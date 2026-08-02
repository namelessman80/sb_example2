import express, { Request, Response, NextFunction } from "express";
import { AppResponse } from "../middlewares/error.middleware";
import { analyzeCheckin } from "../controllers/checkin.controller";

const router = express.Router();

router.post("/analyze", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text, sessionId } = req.body;
        const data = await analyzeCheckin({ text, sessionId });
        AppResponse(res, 200, "Check-in analyzed successfully", data);
    } catch (error: any) {
        next(error);
    }
});

export default router;
