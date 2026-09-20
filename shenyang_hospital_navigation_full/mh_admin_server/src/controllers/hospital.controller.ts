import { db } from "../db";
import { hospitalsTable } from "../db/schema";
import { and, arrayOverlaps, asc, eq, isNotNull } from "drizzle-orm";
import { BadRequestError } from "../middlewares/error.middleware";

export async function getPublicHospitals(params: { city?: string }) {
    const conditions = [eq(hospitalsTable.isActive, true)];

    if (params.city?.trim()) {
        conditions.push(eq(hospitalsTable.city, params.city.trim()));
    }

    return db
        .select()
        .from(hospitalsTable)
        .where(and(...conditions))
        .orderBy(asc(hospitalsTable.name));
}

const EARTH_RADIUS_KM = 6371;
const DEFAULT_RADIUS_KM = 25;
const MAX_RADIUS_KM = 300;

/** Straight-line (great-circle) distance between two lat/lng points, in km. */
function haversineDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export interface NearbyParams {
    lat: number;
    lng: number;
    radiusKm?: number;
    /**
     * Service tags to filter by (e.g. ["psychiatry", "psychology"]) - a
     * hospital matches if its own `services` array contains AT LEAST ONE
     * of these (an overlap, not "must have all of them"). Omitted/empty
     * means no filtering - every hospital in range is a candidate, same
     * as before this feature existed.
     */
    services?: string[];
}

/**
 * Hospitals within `radiusKm` of (lat, lng), optionally narrowed down to
 * only those offering at least one of `services` first, sorted
 * nearest-first with a `distanceKm` field attached. Only considers
 * hospitals that already have coordinates (see
 * scripts/geocode-hospitals.ts for backfilling those that don't yet).
 * Distance is straight-line, not driving distance — fine for a
 * "roughly how far" prototype feature.
 *
 * IMPORTANT: this is a navigation/routing filter, not a diagnosis. It
 * never claims the visitor has any condition - it just narrows which
 * hospitals are shown, based on service tags the visitor chose to
 * browse by. See mh_engine/src/lib/serviceMapping.ts for the full
 * category -> service tag mapping and its own framing note.
 */
export async function getNearbyHospitals(params: NearbyParams) {
    const { lat, lng, services } = params;
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        throw new BadRequestError("lat must be a number between -90 and 90");
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        throw new BadRequestError("lng must be a number between -180 and 180");
    }
    const radiusKm = Math.min(
        Math.max(params.radiusKm ?? DEFAULT_RADIUS_KM, 1),
        MAX_RADIUS_KM
    );

    // Filtering happens HERE, as part of the database query that builds the
    // candidate list - before any distance is calculated at all. So by the
    // time the haversine/sort logic below runs, it's only ever ranking
    // hospitals that already matched the requested services (or every
    // active hospital with coordinates, if no services were requested).
    const conditions = [
        eq(hospitalsTable.isActive, true),
        isNotNull(hospitalsTable.latitude),
        isNotNull(hospitalsTable.longitude),
    ];
    if (services && services.length > 0) {
        conditions.push(arrayOverlaps(hospitalsTable.services, services));
    }

    const candidates = await db
        .select()
        .from(hospitalsTable)
        .where(and(...conditions));

    return candidates
        .map((hospital) => ({
            ...hospital,
            distanceKm: Math.round(
                haversineDistanceKm(
                    lat,
                    lng,
                    hospital.latitude as number,
                    hospital.longitude as number
                ) * 10
            ) / 10,
        }))
        .filter((hospital) => hospital.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
}
