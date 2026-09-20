import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Disclaimer } from "@/components/Disclaimer";
import { HospitalCard } from "@/components/HospitalCard";
import { LocationPicker, type DestinationPoint } from "@/components/LocationPicker";
import { fetchNearbyHospitals } from "@/lib/api";
import { useLanguage, format } from "@/lib/i18n";
import { getServiceTagsForCategories, type QuickCategoryKey } from "@/lib/serviceMapping";
import type { Hospital } from "@shared/types";

/**
 * "Find hospitals near me" — lets a visitor set their location by clicking
 * an interactive map, sharing GPS, or typing an address/coordinates (see
 * LocationPicker), then shows hospitals within range sorted by distance
 * via the backend's /api/hospitals/nearby endpoint.
 *
 * `selectedCategories` (lifted up from CheckinForm, via Home.tsx) narrows
 * that search further: their combined, deduplicated service tags (see
 * lib/serviceMapping.ts) are sent to the backend, which filters BEFORE
 * ranking by distance. No categories selected = no filter, same
 * distance-only behavior as before this feature existed.
 *
 * Clicking a hospital card selects it as a second map marker plus a
 * displacement line back to "your location" (see selectedHospital below).
 */
export function NearMeHospitals({ selectedCategories }: { selectedCategories: QuickCategoryKey[] }) {
    const { t, lang } = useLanguage();
    const [location, setLocation] = React.useState<{ lat: number; lng: number } | null>(null);
    const [selectedHospital, setSelectedHospital] = React.useState<Hospital | null>(null);

    const handleLocationChange = React.useCallback((lat: number, lng: number) => {
        setLocation({ lat, lng });
    }, []);

    const serviceTags = getServiceTagsForCategories(selectedCategories);
    const hasFilter = serviceTags.length > 0;

    const nearbyQuery = useQuery({
        queryKey: location
            ? ["hospitals-nearby", location.lat, location.lng, serviceTags]
            : ["hospitals-nearby", "idle"],
        queryFn: () =>
            location
                ? fetchNearbyHospitals(location.lat, location.lng, { services: serviceTags })
                : Promise.resolve([]),
        enabled: location != null,
    });

    // Only fetched when a category filter is active - the unfiltered list
    // of every nearby hospital, used below to show an "other nearby
    // hospitals" fallback so a narrow (or empty) filtered match still
    // leaves the visitor with real options, clearly labeled as NOT
    // verified for the selected categories rather than silently
    // pretending they are.
    const allNearbyQuery = useQuery({
        queryKey: location ? ["hospitals-nearby", location.lat, location.lng, "all"] : ["hospitals-nearby", "idle"],
        queryFn: () => (location ? fetchNearbyHospitals(location.lat, location.lng) : Promise.resolve([])),
        enabled: location != null && hasFilter,
    });

    const matchedIds = new Set((nearbyQuery.data ?? []).map((h) => h.id));
    const otherHospitals = (allNearbyQuery.data ?? []).filter((h) => !matchedIds.has(h.id));

    const handleHospitalClick = (hospital: Hospital) => {
        // Clicking the same hospital again deselects it (toggle), instead
        // of just always selecting - matches the LocationPicker's own
        // "Clear" button doing the same thing.
        setSelectedHospital((current) => (current?.id === hospital.id ? null : hospital));
    };

    const destination: DestinationPoint | null =
        selectedHospital && selectedHospital.latitude != null && selectedHospital.longitude != null
            ? {
                  lat: selectedHospital.latitude,
                  lng: selectedHospital.longitude,
                  label:
                      lang === "en"
                          ? (selectedHospital.nameEn ?? selectedHospital.name)
                          : selectedHospital.name,
                  distanceKm: selectedHospital.distanceKm,
                  address: selectedHospital.address,
                  addressEn: selectedHospital.addressEn,
              }
            : null;

    return (
        <div className="space-y-4">
            <LocationPicker
                onLocationChange={handleLocationChange}
                destination={destination}
                onClearDestination={() => setSelectedHospital(null)}
            />

            {location && (
                <div className="space-y-4">
                    <Disclaimer>{t.nearbyDisclaimer}</Disclaimer>

                    {nearbyQuery.isLoading ? (
                        <div className="flex justify-center py-8">
                            <Spinner className="size-6" />
                        </div>
                    ) : !hasFilter ? (
                        // No category filter active - same single-list
                        // behavior as before this feature existed.
                        nearbyQuery.data && nearbyQuery.data.length > 0 ? (
                            <>
                                <p className="text-sm font-medium">
                                    {format(t.nearbyCountFound, { n: nearbyQuery.data.length })}
                                </p>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {nearbyQuery.data.map((hospital) => (
                                        <HospitalCard
                                            key={hospital.id}
                                            hospital={hospital}
                                            onClick={() => handleHospitalClick(hospital)}
                                            selected={selectedHospital?.id === hospital.id}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <Alert variant="warning">
                                <AlertDescription>{t.nearbyNoneFound}</AlertDescription>
                            </Alert>
                        )
                    ) : (
                        // A category filter IS active - split into two
                        // clearly labeled groups: verified matches first,
                        // then everything else nearby (never presented as
                        // verified for the selected categories).
                        <>
                            {nearbyQuery.data && nearbyQuery.data.length > 0 ? (
                                <>
                                    <p className="text-sm font-medium">
                                        {format(t.nearbyMatchedHeading, { n: nearbyQuery.data.length })}
                                    </p>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {nearbyQuery.data.map((hospital) => (
                                            <HospitalCard
                                                key={hospital.id}
                                                hospital={hospital}
                                                onClick={() => handleHospitalClick(hospital)}
                                                selected={selectedHospital?.id === hospital.id}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <Alert variant="info">
                                    <AlertDescription>{t.nearbyMatchedNone}</AlertDescription>
                                </Alert>
                            )}

                            {allNearbyQuery.isLoading ? (
                                <div className="flex justify-center py-4">
                                    <Spinner className="size-5" />
                                </div>
                            ) : (
                                otherHospitals.length > 0 && (
                                    <div className="space-y-2 border-t pt-4">
                                        <div>
                                            <p className="text-sm font-medium">
                                                {t.nearbyOtherHeading} ({otherHospitals.length})
                                            </p>
                                            <p className="text-xs text-muted-foreground">{t.nearbyOtherNote}</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {otherHospitals.map((hospital) => (
                                                <HospitalCard
                                                    key={hospital.id}
                                                    hospital={hospital}
                                                    onClick={() => handleHospitalClick(hospital)}
                                                    selected={selectedHospital?.id === hospital.id}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
