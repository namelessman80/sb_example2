import { Router, Request, Response, NextFunction } from "express";
import { AppResponse } from "../middlewares/error.middleware";
import {
    createFeedback,
    getFeedbacks,
    updateFeedbackStatus,
} from "../controllers/feedback.controller";
import adminMiddleware from "../middlewares/adminMiddleware";
import { getLogContext } from "../utils/helper";

const router = Router();

// Public route to submit feedback
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await createFeedback(req.body);
        AppResponse(res, 201, "Feedback submitted successfully", data);
    } catch (error: any) {
        next(error);
    }
});

// Protected admin routes
router.get(
    "/",
    adminMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { status } = req.query;
            const data = await getFeedbacks({
                status: status != null ? String(status) : undefined,
            });
            AppResponse(res, 200, "Feedback retrieved successfully", data);
        } catch (error: any) {
            next(error);
        }
    }
);

router.put(
    "/:id/status",
    adminMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await updateFeedbackStatus(
                parseInt(req.params.id, 10),
                req.body.status,
                getLogContext(req)
            );
            AppResponse(res, 200, "Feedback status updated successfully", data);
        } catch (error: any) {
            next(error);
        }
    }
);

export default router;
