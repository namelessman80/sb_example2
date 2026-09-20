import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage, format } from "@/lib/i18n";
import type { Hospital } from "@shared/types";

export function HospitalCard({
    hospital,
    onClick,
    selected,
}: {
    hospital: Hospital;
    /** Clicking the card shows this hospital on the map (see NearMeHospitals). */
    onClick?: () => void;
    selected?: boolean;
}) {
    const { t, lang } = useLanguage();

    // In English mode, show the English name as the title and keep BOTH
    // the pinyin and the original Chinese name visible underneath (rather
    // than hiding the Chinese name) - same idea as keeping the Chinese
    // address alongside its English translation. Falls back to the
    // Chinese name if no English translation exists yet for this hospital.
    const primaryName = lang === "en" ? (hospital.nameEn ?? hospital.name) : hospital.name;
    const showSecondaryLine = lang === "en" && (hospital.namePinyin || hospital.nameEn);
    const secondaryNameParts = [hospital.namePinyin, hospital.name].filter(Boolean);

    const primaryAddress = lang === "en" ? (hospital.addressEn ?? hospital.address) : hospital.address;
    const showSecondaryAddress =
        lang === "en" && hospital.address && hospital.addressEn && hospital.address !== hospital.addressEn;

    return (
        <Card
            onClick={onClick}
            className={cn(
                onClick && "cursor-pointer transition-shadow hover:shadow-md",
                selected && "ring-2 ring-green-600"
            )}
        >
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                    <span className="flex items-center gap-2">🏥 {primaryName}</span>
                    {hospital.distanceKm != null && (
                        <Badge variant="secondary" className="shrink-0 font-normal">
                            {format(t.cardDistanceAway, { km: hospital.distanceKm })}
                        </Badge>
                    )}
                </CardTitle>
                {showSecondaryLine && secondaryNameParts.length > 0 && (
                    <p className="text-xs text-muted-foreground">{secondaryNameParts.join(" · ")}</p>
                )}
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
                <p>
                    <strong>{t.cardCity}:</strong> {hospital.city}
                </p>
                {hospital.district && (
                    <p>
                        <strong>{t.cardDistrict}:</strong> {hospital.district}
                    </p>
                )}
                <p>
                    <strong>{t.cardDepartment}:</strong> {hospital.department}
                </p>
                <p>
                    <strong>{t.cardSpecialty}:</strong> {hospital.specialty}
                </p>
                {primaryAddress && (
                    <p>
                        <strong>{t.cardAddress}:</strong> {primaryAddress}
                        {showSecondaryAddress && (
                            <span className="block text-xs text-muted-foreground">{hospital.address}</span>
                        )}
                    </p>
                )}
                {hospital.phone && (
                    <p>
                        <strong>{t.cardPhone}:</strong> {hospital.phone}
                    </p>
                )}
                {hospital.website && (
                    <p>
                        <strong>{t.cardWebsite}:</strong> {hospital.website}
                    </p>
                )}

                {/* "verified" shows no badge at all - see shared/types.ts
                    for the full rules per state. */}
                {hospital.verificationStatus === "unverified" && (
                    <Badge variant="warning" className="mt-2">
                        {t.cardNeedsVerification}
                    </Badge>
                )}
                {hospital.verificationStatus === "partial" && (
                    <Badge variant="secondary" className="mt-2 font-normal">
                        {t.cardServiceInfoIncomplete}
                    </Badge>
                )}

                {onClick && (
                    <p className="mt-2 text-xs italic text-muted-foreground">{t.cardShowOnMapHint}</p>
                )}
            </CardContent>
        </Card>
    );
}
