import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import adminRoutes from "./admin.route";
import adminCategoryRoutes from "./adminCategory.route";
import adminHospitalRoutes from "./adminHospital.route";
import hospitalRoutes from "./hospital.route";
import citiesRoutes from "./cities.route";
import checkinRoutes from "./checkin.route";
import feedbackRoutes from "./feedback.route";
import analyticsRoutes from "./analytics.route";
import logsRoutes from "./logs.route";
import { errorMiddleware } from "../middlewares/error.middleware";
import adminMiddleware from "../middlewares/adminMiddleware";

const apiLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();

    res.on("finish", () => {
        const duration = performance.now() - start;
        console.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration.toFixed(2)} ms`
        );
    });

    next();
};

export = (app: express.Application) => {
    app.use(cors());
    app.use(apiLogger);
    app.use(express.json({ limit: "100mb" }));
    app.use(express.urlencoded({ extended: true, limit: "100mb" }));

    // Health
    app.get("/api/health", (req: Request, res: Response) => {
        res.json({ message: "Server is running!" });
    });

    // Admin routes
    app.use("/api/admin", adminRoutes);
    app.use("/api/admin/categories", adminMiddleware, adminCategoryRoutes);
    app.use("/api/admin/hospitals", adminMiddleware, adminHospitalRoutes);
    app.use("/api/admin/analytics", adminMiddleware, analyticsRoutes);
    app.use("/api/admin/logs", adminMiddleware, logsRoutes);

    // Public routes
    app.use("/api/checkin", checkinRoutes);
    app.use("/api/hospitals", hospitalRoutes);
    app.use("/api/cities", citiesRoutes);
    app.use("/api/feedback", feedbackRoutes); // mixes public POST with admin-guarded GET/PUT internally

    // Error handling middleware (must be last)
    app.use(errorMiddleware);
};
