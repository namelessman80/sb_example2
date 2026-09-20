import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { geocodeAddress, reverseGeocode } from "@/lib/api";
import { useLanguage, format } from "@/lib/i18n";

const SHENYANG_CENTER: [number, number] = [41.8057, 123.4315];
const DEFAULT_ZOOM = 12;
const SELECTED_ZOOM = 14;

type InputMode = "address" | "coordinates";
type GpsState = "idle" | "locating" | "denied" | "unsupported" | "error";

/** A hospital selected from the results list, to show as a second marker
 * with a displacement line back to "your location" - see NearMeHospitals,
 * which owns this state and passes it down. */
export interface DestinationPoint {
    lat: number;
    lng: number;
    label: string;
    distanceKm?: number;
    /** Shown in the destination marker's popup alongside `label`, same
     * "keep both languages" pattern as the user's own location popup.
     * Both are commonly null today since most hospitals don't have
     * address data yet - the popup just omits this line when so. */
    address?: string | null;
    addressEn?: string | null;
}

/** A small colored-dot marker icon, drawn with inline CSS instead of an
 * image file — sidesteps the well-known issue where Leaflet's default
 * marker icon images don't resolve correctly under a bundler like Vite. */
function makeColoredDot(color: string) {
    return L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.15),0 1px 3px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });
}
const locationIcon = makeColoredDot("#2563eb"); // blue - "your location"
const destinationIcon = makeColoredDot("#16a34a"); // green - selected hospital

/** Parses a text input into a valid coordinate, or null if it isn't one
 * (empty, not a number, or outside the real-world lat/lng range). */
function parseCoordinate(text: string, min: number, max: number): number | null {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const value = Number(trimmed);
    if (Number.isNaN(value) || value < min || value > max) return null;
    return value;
}

/**
 * An interactive Leaflet + OpenStreetMap picker for "where am I" — click
 * the map, drop a pin via GPS, or type an address/coordinates; all four
 * paths converge on the same `moveMarkerTo`, which repositions one marker,
 * reverse-geocodes it for a human-readable label, and reports the
 * coordinates to the parent via `onLocationChange`.
 *
 * `destination`, when set (by clicking a hospital card in NearMeHospitals),
 * adds a second marker plus a dashed displacement line back to "your
 * location" - the same map pattern as the Displacement Calculator in
 * 0_map_api_example/leaflet-displacement-calculator, reused here for real
 * hospital data instead of two arbitrary points.
 *
 * No API key needed (OpenStreetMap tiles + the backend's free Nominatim
 * proxy at /api/geocode).
 */
export function LocationPicker({
    onLocationChange,
    destination,
    onClearDestination,
}: {
    onLocationChange: (lat: number, lng: number) => void;
    destination?: DestinationPoint | null;
    onClearDestination?: () => void;
}) {
    const { t, lang } = useLanguage();
    const mapContainerRef = React.useRef<HTMLDivElement>(null);
    const mapRef = React.useRef<L.Map | null>(null);
    const markerRef = React.useRef<L.Marker | null>(null);
    const destinationMarkerRef = React.useRef<L.Marker | null>(null);
    const displacementLineRef = React.useRef<L.Polyline | null>(null);

    const [selected, setSelected] = React.useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = React.useState<string | null>(null);

    const [inputMode, setInputMode] = React.useState<InputMode>("address");
    const [addressText, setAddressText] = React.useState("");
    const [latText, setLatText] = React.useState("");
    const [lngText, setLngText] = React.useState("");
    const [formError, setFormError] = React.useState<string | null>(null);
    const [formBusy, setFormBusy] = React.useState(false);

    const [gpsState, setGpsState] = React.useState<GpsState>("idle");

    // Moves (or creates) the one marker, recenters the map if asked,
    // reverse-geocodes it for a label, and tells the parent about it.
    // All four ways of picking a location (click, GPS, address, lat/lng)
    // funnel through this single function instead of duplicating the logic.
    const moveMarkerTo = React.useCallback(
        (lat: number, lng: number, options: { recenter: boolean }) => {
            const map = mapRef.current;
            if (!map) return;

            const point = L.latLng(lat, lng);
            if (markerRef.current) {
                markerRef.current.setLatLng(point);
            } else {
                markerRef.current = L.marker(point, { icon: locationIcon }).addTo(map);
            }
            markerRef.current.bindPopup(t.locatorLookingUpAddress).openPopup();

            if (options.recenter) {
                map.setView(point, SELECTED_ZOOM);
            }

            setSelected({ lat, lng });
            setAddress(null);
            onLocationChange(lat, lng);

            // In English mode, also fetch an English translation via
            // Nominatim's accept-language parameter, and show it alongside
            // the original local-language address rather than replacing it
            // - OpenStreetMap doesn't have an English name tagged for every
            // place, so keeping both means nothing gets silently dropped.
            (async () => {
                try {
                    const local = await reverseGeocode(lat, lng, "zh");
                    const english = lang === "en" ? await reverseGeocode(lat, lng, "en") : null;

                    const parts = [english?.address, local?.address].filter(
                        (value): value is string => Boolean(value)
                    );
                    const combined = parts.length > 0 ? parts.join(" / ") : null;

                    setAddress(combined);
                    markerRef.current?.setPopupContent(combined ?? t.locatorAddressNotFoundInline);
                } catch {
                    markerRef.current?.setPopupContent(t.locatorAddressLookupFailed);
                }
            })();
        },
        [onLocationChange, t, lang]
    );

    // Create the map once, on mount.
    React.useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current).setView(SHENYANG_CENTER, DEFAULT_ZOOM);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        map.on("click", (event: L.LeafletMouseEvent) => {
            moveMarkerTo(event.latlng.lat, event.latlng.lng, { recenter: false });
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
            destinationMarkerRef.current = null;
            displacementLineRef.current = null;
        };
        // moveMarkerTo is stable (wrapped in useCallback with a stable dep),
        // so this effect is safe to run only once, on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Places/moves the destination marker and the displacement line back
    // to "your location" whenever a hospital is selected (or removes both
    // when it's cleared) - same reuse-one-object-instead-of-many pattern
    // as the tutorial's Displacement Calculator.
    React.useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (!destination || !selected) {
            if (destinationMarkerRef.current) {
                map.removeLayer(destinationMarkerRef.current);
                destinationMarkerRef.current = null;
            }
            if (displacementLineRef.current) {
                map.removeLayer(displacementLineRef.current);
                displacementLineRef.current = null;
            }
            return;
        }

        const userPoint = L.latLng(selected.lat, selected.lng);
        const destPoint = L.latLng(destination.lat, destination.lng);

        if (destinationMarkerRef.current) {
            destinationMarkerRef.current.setLatLng(destPoint);
        } else {
            destinationMarkerRef.current = L.marker(destPoint, { icon: destinationIcon }).addTo(map);
        }
        // Same "show the English translation alongside the original"
        // pattern as the user's own location popup and HospitalCard -
        // just omits the address line entirely when neither is known yet.
        const destinationAddressParts = [
            lang === "en" ? destination.addressEn : null,
            destination.address,
        ].filter((value): value is string => Boolean(value));
        const destinationPopup =
            destinationAddressParts.length > 0
                ? `${destination.label}<br>${destinationAddressParts.join(" / ")}`
                : destination.label;
        destinationMarkerRef.current.bindPopup(destinationPopup);

        if (displacementLineRef.current) {
            displacementLineRef.current.setLatLngs([userPoint, destPoint]);
        } else {
            displacementLineRef.current = L.polyline([userPoint, destPoint], {
                color: "#8e44ad",
                weight: 3,
                dashArray: "6 8",
            }).addTo(map);
        }

        map.fitBounds(displacementLineRef.current.getBounds(), { padding: [50, 50] });
    }, [destination, selected, lang]);

    const requestGpsLocation = () => {
        if (!("geolocation" in navigator)) {
            setGpsState("unsupported");
            return;
        }
        setGpsState("locating");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGpsState("idle");
                moveMarkerTo(position.coords.latitude, position.coords.longitude, { recenter: true });
            },
            (error) => {
                setGpsState(error.code === error.PERMISSION_DENIED ? "denied" : "error");
            },
            { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 }
        );
    };

    const submitAddress = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        const query = addressText.trim();
        if (!query) {
            setFormError(t.locatorAddressRequired);
            return;
        }

        setFormBusy(true);
        try {
            const result = await geocodeAddress(query);
            if (!result) {
                setFormError(t.locatorAddressNotFoundError);
                return;
            }
            moveMarkerTo(result.latitude, result.longitude, { recenter: true });
        } catch {
            setFormError(t.locatorAddressLookupFailed);
        } finally {
            setFormBusy(false);
        }
    };

    const submitCoordinates = (event: React.FormEvent) => {
        event.preventDefault();
        const lat = parseCoordinate(latText, -90, 90);
        const lng = parseCoordinate(lngText, -180, 180);
        if (lat === null || lng === null) {
            setFormError(t.locatorInvalidCoords);
            return;
        }
        setFormError(null);
        moveMarkerTo(lat, lng, { recenter: true });
    };

    return (
        <div className="space-y-3">
            <div
                ref={mapContainerRef}
                className="h-72 w-full rounded-md border sm:h-96"
                // Leaflet needs the container to have an explicit height,
                // set via Tailwind classes above rather than an inline style.
            />

            <p className="text-sm text-muted-foreground">{t.locatorHint}</p>

            {selected && (
                <p className="flex items-start gap-1.5 text-sm">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>
                        <strong>{t.locatorSelectedPrefix}</strong> {selected.lat.toFixed(4)},{" "}
                        {selected.lng.toFixed(4)}
                        {address ? ` — ${address}` : ` — ${t.locatorLookingUpAddress}`}
                    </span>
                </p>
            )}

            {destination && (
                <p className="flex items-center gap-1.5 text-sm">
                    <MapPin className="size-4 shrink-0 text-green-600" />
                    <span>
                        {format(t.locatorDisplacementTo, {
                            name: destination.label,
                            km: destination.distanceKm ?? "?",
                        })}
                    </span>
                    {onClearDestination && (
                        <Button type="button" variant="ghost" size="sm" onClick={onClearDestination}>
                            <X className="size-3.5" />
                            {t.locatorClearDestination}
                        </Button>
                    )}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={requestGpsLocation} disabled={gpsState === "locating"}>
                    {gpsState === "locating" ? <Spinner /> : <LocateFixed />}
                    {t.locatorUseMyLocation}
                </Button>
                <div className="flex gap-1 text-sm">
                    <Button
                        type="button"
                        variant={inputMode === "address" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setInputMode("address");
                            setFormError(null);
                        }}
                    >
                        {t.locatorEnterAddress}
                    </Button>
                    <Button
                        type="button"
                        variant={inputMode === "coordinates" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setInputMode("coordinates");
                            setFormError(null);
                        }}
                    >
                        {t.locatorEnterCoordinates}
                    </Button>
                </div>
            </div>

            {gpsState === "denied" && (
                <Alert variant="warning">
                    <AlertDescription>{t.locatorGpsDenied}</AlertDescription>
                </Alert>
            )}
            {gpsState === "unsupported" && (
                <Alert variant="warning">
                    <AlertDescription>{t.locatorGpsUnsupported}</AlertDescription>
                </Alert>
            )}
            {gpsState === "error" && (
                <Alert variant="warning">
                    <AlertDescription>{t.locatorGpsError}</AlertDescription>
                </Alert>
            )}

            {inputMode === "address" ? (
                <form onSubmit={submitAddress} className="flex flex-wrap items-end gap-2">
                    <div className="flex-1 min-w-48 space-y-1">
                        <Label htmlFor="location-address">{t.locatorAddressLabel}</Label>
                        <Input
                            id="location-address"
                            placeholder={t.locatorAddressPlaceholder}
                            value={addressText}
                            onChange={(event) => setAddressText(event.target.value)}
                        />
                    </div>
                    <Button type="submit" size="sm" disabled={formBusy}>
                        {formBusy ? <Spinner /> : <Search />}
                        {t.locatorFind}
                    </Button>
                </form>
            ) : (
                <form onSubmit={submitCoordinates} className="flex flex-wrap items-end gap-2">
                    <div className="w-36 space-y-1">
                        <Label htmlFor="location-lat">{t.locatorLatLabel}</Label>
                        <Input
                            id="location-lat"
                            placeholder={`${t.locatorCoordExamplePrefix} 41.8057`}
                            value={latText}
                            onChange={(event) => setLatText(event.target.value)}
                        />
                    </div>
                    <div className="w-36 space-y-1">
                        <Label htmlFor="location-lng">{t.locatorLngLabel}</Label>
                        <Input
                            id="location-lng"
                            placeholder={`${t.locatorCoordExamplePrefix} 123.4315`}
                            value={lngText}
                            onChange={(event) => setLngText(event.target.value)}
                        />
                    </div>
                    <Button type="submit" size="sm">
                        <Search />
                        {t.locatorFind}
                    </Button>
                </form>
            )}

            {formError && (
                <Alert variant="warning">
                    <AlertDescription>{formError}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
