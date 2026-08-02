import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";
import environments from "../src/environments";
import { categoriesTable, hospitalsTable } from "../src/db/schema";

const client = postgres(environments.DATABASE_URL as string);
const db = drizzle(client);

interface CategorySeed {
    name: string;
    icon: string;
    displayOrder: number;
    isFallback: boolean;
    keywordsEn: string[];
    keywordsZh: string[];
    relatesTo: string[];
    supportType: string;
    seekProfessionalWhen: string;
    gentleSuggestion: string;
}

interface HospitalRow {
    name: string;
    city: string;
    district?: string;
    department?: string;
    specialty?: string;
    address?: string;
    phone?: string;
    website?: string;
    verified?: string;
}

async function loadCategories() {
    console.log("Loading categories...");
    const filePath = join(__dirname, "../src/data/categories.json");
    const data: CategorySeed[] = JSON.parse(readFileSync(filePath, "utf-8"));

    let loaded = 0;
    let skipped = 0;
    let errors = 0;

    for (const item of data) {
        try {
            const existing = await db
                .select()
                .from(categoriesTable)
                .where(eq(categoriesTable.name, item.name))
                .limit(1);

            if (existing.length > 0) {
                skipped++;
                continue;
            }

            await db.insert(categoriesTable).values({
                name: item.name,
                icon: item.icon,
                displayOrder: item.displayOrder,
                isFallback: item.isFallback,
                keywordsEn: item.keywordsEn,
                keywordsZh: item.keywordsZh,
                relatesTo: item.relatesTo,
                supportType: item.supportType,
                seekProfessionalWhen: item.seekProfessionalWhen,
                gentleSuggestion: item.gentleSuggestion,
            });
            loaded++;
        } catch (error) {
            console.error(`Error loading category ${item.name}:`, error);
            errors++;
        }
    }

    console.log(
        `✅ Categories: ${loaded} loaded, ${skipped} skipped (already exist), ${errors} errors`
    );
}

async function loadHospitals() {
    console.log("Loading hospitals...");
    const filePath = join(__dirname, "../src/data/hospitals.csv");
    const rows: HospitalRow[] = parse(readFileSync(filePath, "utf-8"), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    let loaded = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of rows) {
        try {
            const existing = await db
                .select()
                .from(hospitalsTable)
                .where(eq(hospitalsTable.name, row.name))
                .limit(1);

            if (existing.length > 0) {
                skipped++;
                continue;
            }

            await db.insert(hospitalsTable).values({
                name: row.name,
                city: row.city,
                district: row.district || null,
                department: row.department || "",
                specialty: row.specialty || "",
                address: row.address || null,
                phone: row.phone || null,
                website: row.website || null,
                verified: row.verified || null,
            });
            loaded++;
        } catch (error) {
            console.error(`Error loading hospital ${row.name}:`, error);
            errors++;
        }
    }

    console.log(
        `✅ Hospitals: ${loaded} loaded, ${skipped} skipped (already exist), ${errors} errors`
    );
}

async function checkTablesExist(): Promise<boolean> {
    try {
        await db.select().from(categoriesTable).limit(1);
        await db.select().from(hospitalsTable).limit(1);
        return true;
    } catch (error: any) {
        if (
            error?.message?.includes("does not exist") ||
            error?.message?.includes("relation") ||
            error?.code === "42P01"
        ) {
            return false;
        }
        throw error;
    }
}

async function main() {
    try {
        console.log("🚀 Starting data load process...\n");

        if (!environments.DATABASE_URL) {
            throw new Error(
                "DATABASE_URL environment variable is not set. Please check your .env file."
            );
        }

        const tablesExist = await checkTablesExist();
        if (!tablesExist) {
            console.error(
                "❌ Database tables do not exist. Please run the schema push first:\n"
            );
            console.error("   npm run db:push\n");
            console.error("   Or run the complete setup:\n");
            console.error("   npm run db:setup\n");
            process.exit(1);
        }

        await loadCategories();
        console.log();

        await loadHospitals();
        console.log();

        console.log("✅ Data load process completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error during data load:", error);
        process.exit(1);
    }
}

main();
