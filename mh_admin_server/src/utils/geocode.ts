/**
 * Turns a free-text address into GPS coordinates (and back) using
 * OpenStreetMap's Nominatim service — free, no API key required. Used to:
 *  - auto-fill latitude/longitude when an admin creates/updates a hospital
 *    without entering coordinates by hand (adminHospital.controller.ts),
 *  - backfill coordinates for hospitals that already existed before this
 *    feature was added (scripts/geocode-hospitals.ts), and
 *  - let a visitor pinpoint their own location by typed address or by
 *    clicking a map, via the public /api/geocode routes
 *    (routes/geocode.route.ts, used by mh_engine's LocationPicker).
 *
 * Nominatim's usage policy caps requests at 1/second and requires an
 * identifying User-Agent — see `wait()` and the header below. Any failure
 * (network down, no match, rate-limited) resolves to `null` rather than
 * throwing, so callers can proceed/degrade gracefully instead of crashing.
 *
 * Deliberately done server-side (not called directly from the browser like
 * the original map-API tutorial did): keeps the User-Agent/rate-limit
 * policy centralized in one place, and avoids a CORS/caching quirk that
 * can otherwise make Nominatim intermittently omit CORS headers on cached
 * responses when called straight from client-side JavaScript.
 */

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT = "mh-admin-server/1.0 (mental-health-directory prototype)";

export interface GeocodeResult {
    latitude: number;
    longitude: number;
}

export interface ReverseGeocodeResult {
    address: string;
}

/** Sleep helper — call between geocode requests to respect the 1 req/sec limit. */
export function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Geocodes a free-text query (e.g. "some address, some city"). Returns
 * `null` on any failure — never throws — so callers can proceed without
 * coordinates instead of failing an otherwise-valid create/update.
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
    const trimmed = query.trim();
    if (!trimmed) return null;

    try {
        const url = `${NOMINATIM_SEARCH_URL}?format=json&limit=1&q=${encodeURIComponent(trimmed)}`;
        const res = await fetch(url, {
            headers: { "User-Agent": USER_AGENT },
        });
        if (!res.ok) return null;

        const results = (await res.json()) as Array<{ lat: string; lon: string }>;
        if (!results.length) return null;

        const latitude = Number(results[0].lat);
        const longitude = Number(results[0].lon);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

        return { latitude, longitude };
    } catch {
        return null;
    }
}

/**
 * Reverse geocodes coordinates into a human-readable address. Returns
 * `null` on any failure (no match, network error, rate-limited) — never
 * throws — so a caller can still show/use the coordinates even without an
 * address label.
 *
 * `lang`, when given, is passed straight to Nominatim's `accept-language`
 * parameter - e.g. "en" asks it to prefer each place's English name where
 * OpenStreetMap has one tagged, falling back to the local-language name
 * for anything untranslated. Used by mh_engine to get a real English
 * translation of a reverse-geocoded address, not just a fixed label.
 */
export async function reverseGeocodeCoordinates(
    lat: number,
    lng: number,
    lang?: string
): Promise<ReverseGeocodeResult | null> {
    try {
        const langParam = lang ? `&accept-language=${encodeURIComponent(lang)}` : "";
        const url = `${NOMINATIM_REVERSE_URL}?format=json&lat=${lat}&lon=${lng}${langParam}`;
        const res = await fetch(url, {
            headers: { "User-Agent": USER_AGENT },
        });
        if (!res.ok) return null;

        const data = (await res.json()) as { display_name?: string };
        if (!data.display_name) return null;

        return { address: data.display_name };
    } catch {
        return null;
    }
}

/** Builds the best available query string for a hospital's location fields. */
export function buildGeocodeQuery(hospital: {
    address?: string | null;
    district?: string | null;
    city: string;
}): string {
    return [hospital.address, hospital.district, hospital.city, "China"]
        .filter((part): part is string => !!part?.trim())
        .join(", ");
}
