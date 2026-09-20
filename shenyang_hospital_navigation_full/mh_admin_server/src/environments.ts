import dotenv from "dotenv";
dotenv.config();

export default {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_DB_URL: process.env.DIRECT_DB_URL,
    PORT: process.env.PORT || 8000,
    JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
    SUPER_ADMIN_SECRET: process.env.SUPER_ADMIN_SECRET,
};
