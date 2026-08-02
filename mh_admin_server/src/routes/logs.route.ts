import express, { Request, Response, NextFunction } from "express";
import { AppResponse } from "../middlewares/error.middleware";
import { getAllLogs } from "../controllers/logs.controller";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, adminSearch, tableName, action, dateFrom, dateTo } =
            req.query;
        const result = await getAllLogs({
            page: page != null ? parseInt(String(page), 10) : undefined,
            limit: limit != null ? parseInt(String(limit), 10) : undefined,
            adminSearch: adminSearch != null ? String(adminSearch) : undefined,
            tableName: tableName != null ? String(tableName) : undefined,
            action: action != null ? String(action) : undefined,
            dateFrom: dateFrom != null ? String(dateFrom) : undefined,
            dateTo: dateTo != null ? String(dateTo) : undefined,
        });
        AppResponse(res, 200, "Logs retrieved successfully!", result);
    } catch (error: any) {
        next(error);
    }
});

export default router;
