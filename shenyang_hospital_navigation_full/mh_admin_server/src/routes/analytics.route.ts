import express, { Request, Response, NextFunction } from "express";
import { AppResponse } from "../middlewares/error.middleware";
import { getCheckinAnalytics } from "../controllers/analytics.controller";

const router = express.Router();

router.get("/checkins", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { days } = req.query;
        const data = await getCheckinAnalytics({
            days: days != null ? parseInt(String(days), 10) : undefined,
        });
        AppResponse(res, 200, "Analytics retrieved successfully", data);
    } catch (error: any) {
        next(error);
    }
});

export default router;
