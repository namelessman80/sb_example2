import { Request } from "express";
import { AuthenticatedRequest } from "../middlewares/adminMiddleware";
import type { LogContext } from "../controllers/logs.controller";

export const getLogContext = (req: Request): LogContext | undefined => {
    const authReq = req as AuthenticatedRequest;
    if (authReq.admin?.id == null) return undefined;
    const ipAddress =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
        req.socket?.remoteAddress ??
        null;
    const userAgent = (req.headers["user-agent"] as string) ?? null;
    return {
        adminId: authReq.admin.id,
        ipAddress,
        userAgent,
    };
};
