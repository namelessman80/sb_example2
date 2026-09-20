import multer from "multer";
import { BadRequestError } from "./error.middleware";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
    const isCsv =
        file.mimetype === "text/csv" ||
        file.mimetype === "application/vnd.ms-excel" ||
        file.originalname.toLowerCase().endsWith(".csv");

    if (!isCsv) {
        cb(new BadRequestError("Only .csv files are supported"));
        return;
    }
    cb(null, true);
};

export const csvUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});
