import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Hospital } from "@shared/types";

export function HospitalCard({ hospital }: { hospital: Hospital }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    🏥 {hospital.name}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
                <p>
                    <strong>City:</strong> {hospital.city}
                </p>
                {hospital.district && (
                    <p>
                        <strong>District:</strong> {hospital.district}
                    </p>
                )}
                <p>
                    <strong>Department:</strong> {hospital.department}
                </p>
                <p>
                    <strong>Specialty:</strong> {hospital.specialty}
                </p>
                {hospital.address && (
                    <p>
                        <strong>Address:</strong> {hospital.address}
                    </p>
                )}
                {hospital.phone && (
                    <p>
                        <strong>Phone:</strong> {hospital.phone}
                    </p>
                )}
                {hospital.website && (
                    <p>
                        <strong>Website:</strong> {hospital.website}
                    </p>
                )}

                {hospital.verified === "needs verification" ? (
                    <Badge variant="warning" className="mt-2">
                        ⚠️ Needs Verification
                    </Badge>
                ) : hospital.verified ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Data status: {hospital.verified}
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}
