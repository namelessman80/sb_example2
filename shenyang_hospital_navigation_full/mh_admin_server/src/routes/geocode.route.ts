import express, { Request, Response, NextFunction } from "express";
import { AppResponse, BadRequestError } from "../middlewares/error.middleware";
import { geocodeAddress, reverseGeocodeCoordinates } from "../utils/geocode";

const router = express.Router();

/**
 * GET /api/geocode?address=<free text>
 * Forward geocoding: address -> coordinates. Used by mh_engine's
 * LocationPicker to turn a typed address into a map location. Returns
 * `data: null` (still a 200) rather than an error when nothing matches,
 * since "no results for this address" is a normal, expected outcome.
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const address = typeof req.query.address === "string" ? req.query.address.trim() : "";
        if (!address) {
            throw new BadRequestError("address query parameter is required");
        }

        const result = await geocodeAddress(address);
        AppResponse(
            res,
            200,
            result ? "Address geocoded successfully" : "No matching location found",
            result
        );
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/geocode/reverse?lat=<number>&lng=<number>&lang=<optional>
 * Reverse geocoding: coordinates -> address. Used to show a human-readable
 * label for wherever the visitor clicked/dropped a pin on the map.
 *
 * `lang` (optional, e.g. "en" or "zh") is passed straight through to
 * Nominatim's accept-language parameter - mh_engine calls this twice (once
 * per language) in English mode, to show both the English translation and
 * the original local-language address together.
 */
router.get("/reverse", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lat = Number(req.query.lat);
        const lng = Number(req.query.lng);
        const lang = typeof req.query.lang === "string" ? req.query.lang : undefined;

        if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
            throw new BadRequestError("lat must be a number between -90 and 90");
        }
        if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
            throw new BadRequestError("lng must be a number between -180 and 180");
        }

        const result = await reverseGeocodeCoordinates(lat, lng, lang);
        AppResponse(
            res,
            200,
            result ? "Address found" : "No address found for this location",
            result
        );
    } catch (error) {
        next(error);
    }
});

export default router;
