import express, { Request, Response } from "express";
import { AppResponse } from "../middlewares/error.middleware";
import { MAJOR_CITY_OPTIONS } from "../data/cities";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    AppResponse(res, 200, "Cities retrieved successfully", MAJOR_CITY_OPTIONS);
});

export default router;
