import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import environments from "../src/environments";

const client = postgres(environments.DATABASE_URL as string);
const db = drizzle(client);

const TABLES = [
    "logs",
    "checkins",
    "feedbacks",
    "hospitals",
    "categories",
    "admins",
];

async function main() {
    console.log("💣 Dropping all tables...");
    for (const table of TABLES) {
        await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`));
        console.log(`   dropped ${table}`);
    }
    console.log("✅ All tables dropped");
    process.exit(0);
}

main().catch((error) => {
    console.error("❌ Error dropping tables:", error);
    process.exit(1);
});
