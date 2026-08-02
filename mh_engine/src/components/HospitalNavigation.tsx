import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Disclaimer } from "@/components/Disclaimer";
import { HospitalCard } from "@/components/HospitalCard";
import { fetchCities, fetchHospitals } from "@/lib/api";
import type { Category } from "@shared/types";

const PLACEHOLDER = "__choose_a_city__";

export function HospitalNavigation({ categories }: { categories: Category[] }) {
    const [selectedCity, setSelectedCity] = React.useState(PLACEHOLDER);

    const citiesQuery = useQuery({ queryKey: ["cities"], queryFn: fetchCities });
    const hospitalsQuery = useQuery({
        queryKey: ["hospitals", selectedCity],
        queryFn: () => fetchHospitals(selectedCity),
        enabled: selectedCity !== PLACEHOLDER,
    });

    const categoryNames = categories.map((category) => category.name).join(", ");

    return (
        <div className="space-y-4">
            <div className="border-t pt-6">
                <h2 className="mb-1 text-lg font-semibold">
                    🏥 Hospital &amp; service navigation
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                    Based on your check-in (<strong>{categoryNames}</strong>), you can
                    browse sample hospitals below. Select a city to see matching services
                    from our database.
                </p>

                <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="max-w-xs">
                        <SelectValue placeholder="— Choose a city —" />
                    </SelectTrigger>
                    <SelectContent>
                        {citiesQuery.data?.map((city) => (
                            <SelectItem key={city} value={city}>
                                {city}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedCity === PLACEHOLDER ? (
                <Alert variant="info">
                    <AlertDescription>
                        Choose one of <strong>30 major cities</strong> in China to see
                        sample hospitals.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="space-y-4">
                    <Disclaimer>
                        Hospital information shown below is provided for educational and
                        prototype purposes only. Information may be incomplete, outdated, or
                        require verification from official hospital sources before use.
                        This prototype does not recommend or endorse any specific hospital,
                        clinician, or treatment.
                    </Disclaimer>

                    {hospitalsQuery.isLoading ? (
                        <div className="flex justify-center py-8">
                            <Spinner className="size-6" />
                        </div>
                    ) : hospitalsQuery.data && hospitalsQuery.data.length > 0 ? (
                        <>
                            <p className="text-sm font-medium">
                                {hospitalsQuery.data.length} hospital(s) in {selectedCity}
                            </p>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {hospitalsQuery.data.map((hospital) => (
                                    <HospitalCard key={hospital.id} hospital={hospital} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <Alert variant="warning">
                            <AlertDescription>
                                No hospitals were found for this city. This is an early
                                prototype—the hospital database is still being expanded.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}
        </div>
    );
}
