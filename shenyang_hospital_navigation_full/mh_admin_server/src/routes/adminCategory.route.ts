import express, { Request, Response, NextFunction } from "express";
import { AppResponse } from "../middlewares/error.middleware";
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/adminCategory.controller";
import { getLogContext } from "../utils/helper";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await getCategories();
        AppResponse(res, 200, "Categories retrieved successfully", data);
    } catch (error: any) {
        next(error);
    }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await getCategoryById(parseInt(req.params.id, 10));
        AppResponse(res, 200, "Category retrieved successfully", data);
    } catch (error: any) {
        next(error);
    }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await createCategory(req.body, getLogContext(req));
        AppResponse(res, 201, "Category created successfully", data);
    } catch (error: any) {
        next(error);
    }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await updateCategory(
            parseInt(req.params.id, 10),
            req.body,
            getLogContext(req)
        );
        AppResponse(res, 200, "Category updated successfully", data);
    } catch (error: any) {
        next(error);
    }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await deleteCategory(
            parseInt(req.params.id, 10),
            getLogContext(req)
        );
        AppResponse(res, 200, "Category deleted successfully", data);
    } catch (error: any) {
        next(error);
    }
});

export default router;
