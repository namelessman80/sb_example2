import bcrypt from "bcrypt";
const SALT_ROUNDS = 10;
import { db } from "../db";
import { adminsTable } from "../db/schema";
import { BadRequestError } from "../middlewares/error.middleware";
import { generateToken } from "../utils/jwt.utils";
import { eq } from "drizzle-orm";
import { createLog, LogContext } from "./logs.controller";

const createAdmin = async (
    {
        name,
        email,
        password,
    }: {
        name: string;
        email: string;
        password: string;
    },
    logContext?: LogContext
) => {
    if (!name || !email || !password) {
        throw new BadRequestError("Name, email, and password are required");
    }

    const [existingAdmin] = await db
        .select()
        .from(adminsTable)
        .where(eq(adminsTable.email, email));

    if (existingAdmin) {
        throw new BadRequestError("Admin with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await db
        .insert(adminsTable)
        .values({
            name,
            email,
            password: hashedPassword,
        })
        .returning({ id: adminsTable.id });

    await createLog({
        adminId: result.id,
        tableName: "admins",
        recordId: result.id,
        action: "create",
        newData: JSON.stringify({ name, email }),
        ...(logContext && {
            ipAddress: logContext.ipAddress,
            userAgent: logContext.userAgent,
        }),
    });

    const token = generateToken({
        id: result.id,
        email,
        name,
        role: "admin",
    });

    return { token };
};

const loginAdmin = async ({
    email,
    password,
}: {
    email: string;
    password: string;
}) => {
    const [admin] = await db
        .select()
        .from(adminsTable)
        .where(eq(adminsTable.email, email));

    if (!admin) {
        throw new BadRequestError("Admin not found");
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        throw new BadRequestError("Invalid password");
    }

    const token = generateToken({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
    });
    return {
        token,
        admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        },
    };
};

export { createAdmin, loginAdmin };
