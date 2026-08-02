const SESSION_KEY = "mh_engine_session_id";

/**
 * A random, client-generated identifier — not derived from any identity
 * source — used only to group anonymous check-in analytics. No accounts,
 * no server-side identity, matching the source app's fully anonymous ethos.
 */
export function getSessionId(): string {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
}
