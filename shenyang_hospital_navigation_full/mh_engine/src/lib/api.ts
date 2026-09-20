import environments from "@/environments";
import type { CheckinAnalyzeResult, GeocodeResult, Hospital, ReverseGeocodeResult } from "@shared/types";

// No `credentials: "include"` here — these are all public, unauthenticated
// endpoints (no cookies/sessions in this app), and sending credentials would
// require the backend's CORS to echo a specific origin instead of "*".
async function getJson<T>(path: string): Promise<T> {
    const res = await fetch(`${environments.serverOrigin}${path}`);
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    const body = await res.json();
    return body.data as T;
}

async function postJson<T>(path: string, data: unknown): Promise<T> {
    const res = await fetch(`${environments.serverOrigin}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    const body = await res.json();
    return body.data as T;
}

export function analyzeCheckin(text: string, sessionId: string) {
    return postJson<CheckinAnalyzeResult>("/api/checkin/analyze", { text, sessionId });
}

export function fetchHospitals(city: string) {
    return getJson<Hospital[]>(`/api/hospitals?city=${encodeURIComponent(city)}`);
}

/**
 * `services`, when given, narrows results to hospitals offering at least
 * one of those tags (see lib/serviceMapping.ts) - filtering happens on
 * the backend, before distance is even calculated (see
 * hospital.controller.ts's getNearbyHospitals). An empty/omitted list
 * means no filter - every hospital in range, same as before this
 * feature existed.
 */
export function fetchNearbyHospitals(
    lat: number,
    lng: number,
    options?: { radiusKm?: number; services?: string[] }
) {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
    if (options?.radiusKm != null) params.set("radius", String(options.radiusKm));
    if (options?.services && options.services.length > 0) {
        params.set("services", options.services.join(","));
    }
    return getJson<Hospital[]>(`/api/hospitals/nearby?${params.toString()}`);
}

export function fetchCities() {
    return getJson<string[]>("/api/cities");
}

// The two geocode calls: address -> coordinates, and coordinates -> address.
// Both are used by the LocationPicker map (clicking the map, typing an
// address, or typing coordinates directly all end up calling one of these).
// Both resolve to `null` (not a thrown error) when nothing matches, since
// "no results for this input" is a normal, expected outcome to show inline,
// not a failure.

export function geocodeAddress(address: string) {
    return getJson<GeocodeResult | null>(`/api/geocode?address=${encodeURIComponent(address)}`);
}

export function reverseGeocode(lat: number, lng: number, lang?: "en" | "zh") {
    const langParam = lang ? `&lang=${lang}` : "";
    return getJson<ReverseGeocodeResult | null>(`/api/geocode/reverse?lat=${lat}&lng=${lng}${langParam}`);
}

export function submitFeedback(input: {
    name: string;
    email: string;
    message: string;
    category?: string;
}) {
    return postJson("/api/feedback", input);
}
