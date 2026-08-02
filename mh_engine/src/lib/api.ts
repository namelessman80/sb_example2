import environments from "@/environments";
import type { CheckinAnalyzeResult, Hospital } from "@shared/types";

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

export function fetchCities() {
    return getJson<string[]>("/api/cities");
}

export function submitFeedback(input: {
    name: string;
    email: string;
    message: string;
    category?: string;
}) {
    return postJson("/api/feedback", input);
}
