import express, { Request, Response, NextFunction } from "express";
import { AppResponse, BadRequestError } from "../middlewares/error.middleware";
import {
    getHospitals,
    getHospitalById,
    createHospital,
    updateHospital,
    deleteHospital,
    bulkUploadHospitalsFromCsv,
} from "../controllers/adminHospital.controller";
import { getLogContext } from "../utils/helper";
import { csvUpload } from "../middlewares/upload.middleware";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search, city, page, limit } = req.query;
        const data = await getHospitals({
            search: search != null ? String(search) : undefined,
            city: city != null ? String(city) : undefined,
            page: page != null ? parseInt(String(page), 10) : undefined,
            limit: limit != null ? parseInt(String(limit), 10) : undefined,
        });
        AppResponse(res, 200, "Hospitals retrieved successfully", data);
    } catch (error: any) {
        next(error);
    }
});

router.post(
    "/bulk-upload",
    csvUpload.single("file"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                throw new BadRequestError("A CSV file is required (field name: file)");
            }
            const data = await bulkUploadHospitalsFromCsv(
                req.file.buffer,
                getLogContext(req)
            );
            AppResponse(res, 200, "Bulk upload completed", data);
        } catch (error: any) {
            next(error);
        }
    }
);

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await getHospitalById(parseInt(req.params.id, 10));
        AppResponse(res, 200, "Hospital retrieved successfully", data);
    } catch (error: any) {
        next(error);
    }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await createHospital(req.body, getLogContext(req));
        AppResponse(res, 201, "Hospital created successfully", data);
    } catch (error: any) {
        next(error);
    }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await updateHospital(
            parseInt(req.params.id, 10),
            req.body,
            getLogContext(req)
        );
        AppResponse(res, 200, "Hospital updated successfully", data);
    } catch (error: any) {
        next(error);
    }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await deleteHospital(
            parseInt(req.params.id, 10),
            getLogContext(req)
        );
        AppResponse(res, 200, "Hospital deleted successfully", data);
    } catch (error: any) {
        next(error);
    }
});

export default router;
