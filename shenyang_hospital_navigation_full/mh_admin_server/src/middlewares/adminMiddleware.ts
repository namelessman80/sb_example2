import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt.utils";
import { UnauthorizedError } from "./error.middleware";
import { db } from "../db";
import { adminsTable } from "../db/schema";
import { eq } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
    admin?: TokenPayload;
}

const adminMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("No token provided");
        }

        const token = authHeader.substring(7);

        if (!token) {
            throw new UnauthorizedError("No token provided");
        }

        const decoded = verifyToken(token);

        if (decoded.role !== "admin") {
            throw new UnauthorizedError("Access denied. Admin role required");
        }

        const [admin] = await db
            .select()
            .from(adminsTable)
            .where(eq(adminsTable.id, decoded.id));

        if (!admin || !admin.isActive) {
            throw new UnauthorizedError("Admin not found");
        }

        req.admin = decoded;
        next();
    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            next(error);
        } else if (error.name === "JsonWebTokenError") {
            next(new UnauthorizedError("Invalid token"));
        } else if (error.name === "TokenExpiredError") {
            next(new UnauthorizedError("Token expired"));
        } else {
            next(new UnauthorizedError("Authentication failed"));
        }
    }
};

export default adminMiddleware;
export type { AuthenticatedRequest };
