import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import environments from "../environments";

const client = postgres(environments.DATABASE_URL as string);
export const db = drizzle(client);

export async function checkDbConnection() {
    try {
        await db.execute(sql`SELECT 1`);
        console.log("✅ Database connection successful");
    } catch (error) {
        console.error("❌ Database connection failed");
    }
}
