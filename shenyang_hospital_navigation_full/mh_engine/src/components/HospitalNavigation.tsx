import { NearMeHospitals } from "@/components/NearMeHospitals";
import { useLanguage, format } from "@/lib/i18n";
import type { QuickCategoryKey } from "@/lib/serviceMapping";
import type { Category } from "@shared/types";

export function HospitalNavigation({
    categories,
    selectedCategories,
}: {
    /** The AI check-in result's categories - used only for the summary text. */
    categories: Category[];
    /** The quick-select chips picked in CheckinForm - used to filter which
     * hospitals show below (see NearMeHospitals + lib/serviceMapping.ts). */
    selectedCategories: QuickCategoryKey[];
}) {
    const { t } = useLanguage();
    const categoryNames = categories.map((category) => category.name).join(", ");

    return (
        <div className="space-y-4">
            <div className="border-t pt-6">
                <h2 className="mb-1 text-lg font-semibold">{t.hospitalNavHeading}</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                    {format(t.hospitalNavDescription, { categories: categoryNames })}
                </p>
            </div>

            <NearMeHospitals selectedCategories={selectedCategories} />
        </div>
    );
}
