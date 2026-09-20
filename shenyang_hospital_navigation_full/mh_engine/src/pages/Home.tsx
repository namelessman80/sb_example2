import * as React from "react";
import { CheckinForm } from "@/components/CheckinForm";
import { CategoryResultCard } from "@/components/CategoryResultCard";
import { HospitalNavigation } from "@/components/HospitalNavigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage, format } from "@/lib/i18n";
import type { QuickCategoryKey } from "@/lib/serviceMapping";
import type { CheckinAnalyzeResult } from "@shared/types";

export default function Home() {
    const [result, setResult] = React.useState<CheckinAnalyzeResult | null>(null);
    // Lifted up from CheckinForm so the hospital section below can also
    // see which categories are selected, to filter results by relevant
    // service tags (see lib/serviceMapping.ts and NearMeHospitals.tsx).
    const [selectedCategories, setSelectedCategories] = React.useState<QuickCategoryKey[]>([]);
    const { t } = useLanguage();

    return (
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
            {/* relative + absolute keeps "Moodle" visually centered on the
                page regardless of the toggle's width, since the toggle is
                taken out of normal flow instead of pushing the title over. */}
            <div className="relative text-center">
                <h1
                    className="inline-block cursor-pointer text-5xl font-bold tracking-tight transition-transform duration-150 hover:scale-110"
                    onClick={() => window.location.reload()}
                    title={t.titleRefreshHint}
                >
                    Moodle
                </h1>
                <div className="absolute right-0 top-0">
                    <LanguageToggle />
                </div>
            </div>

            <CheckinForm
                onResult={setResult}
                selectedCategories={selectedCategories}
                onSelectedCategoriesChange={setSelectedCategories}
            />

            {result && (
                <div className="space-y-4 border-t pt-6">
                    <div>
                        <h2 className="text-lg font-semibold">{t.resultsHeading}</h2>
                        <p className="text-sm text-muted-foreground">
                            {format(t.resultsSummary, { n: result.matchedCount })}
                        </p>
                    </div>

                    {result.categories.map((category) => (
                        <CategoryResultCard key={category.id} category={category} />
                    ))}

                    <p className="text-sm italic text-muted-foreground">{t.crisisNote}</p>

                    <HospitalNavigation
                        categories={result.categories}
                        selectedCategories={selectedCategories}
                    />
                </div>
            )}

            <footer className="space-y-1 border-t pt-6 text-center text-xs text-muted-foreground">
                <p>{t.footerThemes}</p>
                <p>{t.footerPrototype}</p>
            </footer>
        </div>
    );
}
