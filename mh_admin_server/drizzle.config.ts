import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import environments from "./src/environments";

export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: environments.DIRECT_DB_URL as string,
    },
});
