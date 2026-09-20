/**
 * One-time backfill: finds every hospital row that doesn't have
 * latitude/longitude yet and geocodes it from its address/district/city,
 * via the free Nominatim service (see src/utils/geocode.ts). Idempotent —
 * safe to re-run; it only touches rows still missing coordinates, and skips
 * (rather than fails) any hospital it can't geocode, so you can re-run it
 * later after fixing an address and it'll pick up just that one.
 *
 * Run with: npm run geocode   (from mh_admin_server/)
 * Requires internet access and DATABASE_URL pointing at a running Postgres
 * (same as the other scripts in this folder).
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { isNull, or, eq } from "drizzle-orm";
import postgres from "postgres";
import environments from "../src/environments";
import { hospitalsTable } from "../src/db/schema";
import { buildGeocodeQuery, geocodeAddress, wait } from "../src/utils/geocode";

const client = postgres(environments.DATABASE_URL as string);
const db = drizzle(client);

// Respect Nominatim's 1-request-per-second usage policy.
const DELAY_MS = 1100;

async function main() {
    const missing = await db
        .select()
        .from(hospitalsTable)
        .where(or(isNull(hospitalsTable.latitude), isNull(hospitalsTable.longitude)));

    console.log(`Found ${missing.length} hospital(s) missing coordinates.`);

    let geocoded = 0;
    let skipped = 0;

    for (const hospital of missing) {
        const query = buildGeocodeQuery(hospital);
        process.stdout.write(`  [${hospital.id}] ${hospital.name} — "${query}" ... `);

        const result = await geocodeAddress(query);
        if (!result) {
            console.log("no match, skipped");
            skipped++;
            await wait(DELAY_MS);
            continue;
        }

        await db
            .update(hospitalsTable)
            .set({
                latitude: result.latitude,
                longitude: result.longitude,
                updatedAt: new Date(),
            })
            .where(eq(hospitalsTable.id, hospital.id));

        console.log(`-> ${result.latitude}, ${result.longitude}`);
        geocoded++;
        await wait(DELAY_MS);
    }

    console.log(`\nDone. Geocoded ${geocoded}, skipped ${skipped} (no match found).`);
    if (skipped > 0) {
        console.log(
            "Hospitals that were skipped can be fixed by editing their address in the admin dashboard and re-running `npm run geocode`, or by entering latitude/longitude directly."
        );
    }
    await client.end();
}

main().catch((error) => {
    console.error("Geocoding script failed:", error);
    process.exit(1);
});
