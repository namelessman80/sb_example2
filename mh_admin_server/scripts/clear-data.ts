import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import environments from "../src/environments";
import {
    categoriesTable,
    hospitalsTable,
    checkinsTable,
    feedbacksTable,
    logsTable,
} from "../src/db/schema";

const client = postgres(environments.DATABASE_URL as string);
const db = drizzle(client);

async function main() {
    console.log("🧹 Clearing data (keeping admins)...");
    await db.delete(logsTable);
    await db.delete(checkinsTable);
    await db.delete(feedbacksTable);
    await db.delete(hospitalsTable);
    await db.delete(categoriesTable);
    console.log("✅ Data cleared");
    process.exit(0);
}

main().catch((error) => {
    console.error("❌ Error clearing data:", error);
    process.exit(1);
});
