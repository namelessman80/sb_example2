import * as React from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { CheckinForm } from "@/components/CheckinForm";
import { CategoryResultCard } from "@/components/CategoryResultCard";
import { HospitalNavigation } from "@/components/HospitalNavigation";
import type { CheckinAnalyzeResult } from "@shared/types";

export default function Home() {
    const [result, setResult] = React.useState<CheckinAnalyzeResult | null>(null);

    return (
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
            <div>
                <h1 className="text-2xl font-bold">🧠 Mental Health Support Prototype</h1>
                <p className="text-sm text-muted-foreground">
                    Emotional check-in · broad themes · gentle support ideas
                </p>
            </div>

            <Disclaimer>
                <strong>Important:</strong> This tool does not provide medical diagnosis
                or treatment. It is for reflection and general ideas only.
            </Disclaimer>

            <CheckinForm onResult={setResult} />

            {result && (
                <div className="space-y-4 border-t pt-6">
                    <div>
                        <h2 className="text-lg font-semibold">📋 Your results</h2>
                        <p className="text-sm text-muted-foreground">
                            Based on your words, we noticed <strong>{result.matchedCount}</strong>{" "}
                            broad theme(s). The cards below offer general ideas only—they do{" "}
                            <strong>not</strong> diagnose any condition.
                        </p>
                    </div>

                    {result.categories.map((category) => (
                        <CategoryResultCard key={category.id} category={category} />
                    ))}

                    <p className="text-sm italic text-muted-foreground">
                        If you are in crisis or need urgent help, contact local emergency
                        services or a crisis helpline in your area.
                    </p>

                    <HospitalNavigation categories={result.categories} />
                </div>
            )}

            <footer className="border-t pt-6 text-center text-xs text-muted-foreground">
                Prototype project for educational and research purposes only.
            </footer>
        </div>
    );
}
