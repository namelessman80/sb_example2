import express, { Request, Response, NextFunction } from "express";
import { AppResponse } from "../middlewares/error.middleware";
import {
    getNearbyHospitals,
    getPublicHospitals,
} from "../controllers/hospital.controller";

const router = express.Router();

// NOTE: registered before "/" is irrelevant here since the paths don't
// overlap, but kept first for readability (specific route before the
// catch-all list route).
router.get("/nearby", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { lat, lng, radius, services } = req.query;
        // Accepts either ?services=a,b,c (comma-separated, what mh_engine
        // sends) or repeated ?services=a&services=b (Express parses that
        // as an array already) - handles both so this is easy to call
        // either way.
        const servicesList = Array.isArray(services)
            ? services.map(String)
            : typeof services === "string" && services.trim()
              ? services.split(",").map((s) => s.trim()).filter(Boolean)
              : undefined;

        const data = await getNearbyHospitals({
            lat: Number(lat),
            lng: Number(lng),
            radiusKm: radius != null ? Number(radius) : undefined,
            services: servicesList,
        });
        AppResponse(res, 200, "Nearby hospitals retrieved successfully", data);
    } catch (error: any) {
        next(error);
    }
});

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
