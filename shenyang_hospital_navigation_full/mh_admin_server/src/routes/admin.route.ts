import express, { Request, Response, NextFunction } from "express";
import { AppResponse, UnauthorizedError } from "../middlewares/error.middleware";
import { createAdmin, loginAdmin } from "../controllers/admin.controller";
import { getLogContext } from "../utils/helper";
import environments from "../environments";

const router = express.Router();

router.post(
    "/createadmin",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, password, superAdminSecret } = req.body;
            if (
                !environments.SUPER_ADMIN_SECRET ||
                superAdminSecret !== environments.SUPER_ADMIN_SECRET
            ) {
                throw new UnauthorizedError("Invalid super admin secret");
            }
            const { token } = await createAdmin(
                { name, email, password },
                getLogContext(req)
            );
            AppResponse(res, 200, "Admin created successfully", { token });
        } catch (error: any) {
            next(error);
        }
    }
);

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const data = await loginAdmin({ email, password });
        AppResponse(res, 200, "Admin logged in successfully", data);
    } catch (error: any) {
        next(error);
    }
});

export default router;
