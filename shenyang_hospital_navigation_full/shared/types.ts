export interface Hospital {
  id: number;
  name: string;
  /** English translation of `name`. Null if not yet provided for this hospital. */
  nameEn: string | null;
  /** Pinyin romanization of `name`. Null if not yet provided for this hospital. */
  namePinyin: string | null;
  city: string;
  district: string | null;
  department: string;
  specialty: string;
  address: string | null;
  /** English translation of `address`. Null if not yet provided for this hospital. */
  addressEn: string | null;
  phone: string | null;
  website: string | null;
  /** Legacy free-text status field - kept but no longer drives the card's
   * badge; see verificationStatus, which replaced it for display. */
  verified: string | null;
  /**
   * Three-state verification, replacing the old boolean-ish
   * "needs verification" display:
   *  - "verified": identity, coordinates, AND currently displayed service
   *    info have all been checked against reliable sources - no warning
   *    badge shown.
   *  - "partial": identity/coordinates verified, but service/department
   *    info is still incomplete - shows a subtle "Service info
   *    incomplete" badge.
   *  - "unverified": important information hasn't been checked yet -
   *    shows the yellow "Needs Verification" badge.
   * Never auto-upgraded to "verified"/"partial" - only set once someone
   * has actually checked that specific hospital.
   */
  verificationStatus: "verified" | "partial" | "unverified";
  /**
   * What KIND of institution this is (e.g. "general", "cancer",
   * "mental_health_specialty") - broad classification, separate from
   * `services` below. A "general" hospital does NOT imply it offers
   * mental health services - see `services`.
   */
  type: string;
  /**
   * SPECIFIC, VERIFIED departments/services this hospital actually
   * offers (e.g. "psychiatry", "psychology"), used to filter "near me"
   * results by the visitor's selected experience categories - see
   * mh_engine/src/lib/serviceMapping.ts. Empty for most hospitals today;
   * never auto-derived from `type` - only set once verified for that
   * specific hospital.
   */
  services: string[];
  latitude: number | null;
  longitude: number | null;
  /** Present only on results from the /nearby endpoint. */
  distanceKm?: number;
}

/** Result of forward geocoding (address -> coordinates), from /api/geocode. */
export interface GeocodeResult {
  latitude: number;
  longitude: number;
}

/** Result of reverse geocoding (coordinates -> address), from /api/geocode/reverse. */
export interface ReverseGeocodeResult {
  address: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  relatesTo: string[];
  supportType: string;
  seekProfessionalWhen: string;
  gentleSuggestion: string;
  isFallback: boolean;
}

export interface CheckinAnalyzeResult {
  categories: Category[];
  matchedCount: number;
  isFallback: boolean;
}

export interface Feedback {
  id: number;
  name: string;
  email: string;
  category: string;
  message: string;
  status: "new" | "reviewed" | "resolved";
  createdAt: string;
}
