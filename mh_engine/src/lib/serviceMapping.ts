/**
 * Maps the quick-select EXPERIENCE categories (see CheckinForm.tsx) to
 * general healthcare SERVICE TAGS, and provides the small helper that
 * combines a visitor's selected categories into one deduplicated list of
 * tags for the "near me" hospital search to filter by.
 *
 * ============================================================
 * THIS IS A NAVIGATION FILTER, NOT A DIAGNOSTIC TOOL.
 * ============================================================
 * Selecting "Anxiety / Worry" does not mean - and must never be presented
 * as meaning - "the app has determined you have anxiety." It only means
 * "show me hospitals that offer services relevant to this kind of
 * experience." The mapping below exists purely to narrow down WHICH
 * hospitals to show, the same way a store directory maps "electronics" to
 * a list of departments - it says nothing about any individual visitor.
 *
 * Kept in its own file, separate from hospital data (hospitals don't
 * import this - the backend just stores whatever tags a hospital has been
 * verified to offer, in its own `services` column) and separate from the
 * category labels' translations (see lib/i18n.tsx) - this file only maps
 * STABLE KEYS to STABLE TAGS, no user-facing text at all.
 */

/** Stable keys for the quick-select chips - NOT the displayed label, which
 * comes from the translation dictionary (lib/i18n.tsx) instead. Keeping
 * selection state keyed by these instead of the English label means
 * switching UI languages mid-selection doesn't lose what was picked. */
export const QUICK_CATEGORY_KEYS = [
    "stress",
    "sleep",
    "lowMood",
    "anxiety",
    "focus",
    "anger",
    "panic",
    "loneliness",
    "relationship",
    "schoolWork",
    "grief",
    "other",
] as const;
export type QuickCategoryKey = (typeof QUICK_CATEGORY_KEYS)[number];

/**
 * SPECIFIC, VERIFIED department/service tags - deliberately narrow (not
 * "mental_health" as a catch-all, not "general_hospital" as a tag at all
 * - what KIND of institution a hospital is belongs on its `type` field
 * instead, see shared/types.ts). Kept narrow on purpose: a hospital only
 * matches a category search if it has actually been verified to offer
 * one of these specific things, never because it's "a hospital" in
 * general.
 */
export type ServiceTag = "psychology" | "psychiatry" | "sleep" | "neurology" | "counseling";

/**
 * Which service tags are relevant to browse for, given each experience
 * category. A category can map to multiple tags (a hospital matching ANY
 * one of them is considered relevant - see getServiceTagsForCategories
 * and hospital.controller.ts's getNearbyHospitals).
 *
 * "Other / Not Sure" deliberately maps to an empty list - "not sure what
 * this is" shouldn't narrow the search to anything specific; combined
 * with getServiceTagsForCategories, selecting ONLY "Other / Not Sure"
 * results in no filter at all (every hospital shown by distance), the
 * same as selecting nothing.
 */
export const CATEGORY_SERVICE_MAP: Record<QuickCategoryKey, ServiceTag[]> = {
    stress: ["psychology", "psychiatry"],
    sleep: ["sleep", "neurology", "psychiatry"],
    lowMood: ["psychology", "psychiatry"],
    anxiety: ["psychology", "psychiatry"],
    focus: ["psychology", "psychiatry"],
    anger: ["psychology", "psychiatry"],
    panic: ["psychiatry", "psychology"],
    loneliness: ["psychology", "counseling"],
    relationship: ["psychology", "counseling"],
    schoolWork: ["psychology", "counseling"],
    grief: ["psychology", "counseling"],
    other: [],
};

/**
 * Turns a list of selected categories into ONE deduplicated list of
 * service tags to search by:
 *   1. Look up each selected category's tags in CATEGORY_SERVICE_MAP.
 *   2. Flatten all of those lists into one combined list.
 *   3. Remove duplicates (Set only ever keeps one of each value).
 * Returns an empty array if nothing is selected - callers should treat
 * that as "no filter, show everything by distance," not "show nothing."
 */
export function getServiceTagsForCategories(categories: QuickCategoryKey[]): ServiceTag[] {
    const combined = categories.flatMap((category) => CATEGORY_SERVICE_MAP[category]);
    return Array.from(new Set(combined));
}
