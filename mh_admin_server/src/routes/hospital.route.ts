import express, { Request, Response, NextFunction } from "express";
import { AppResponse } from "../middlewares/error.middleware";
import { getPublicHospitals } from "../controllers/hospital.controller";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { city } = req.query;
        const data = await getPublicHospitals({
            city: city != null ? String(city) : undefined,
        });
        AppResponse(res, 200, "Hospitals retrieved successfully", data);
    } catch (error: any) {
        next(error);
    }
});

export default router;
