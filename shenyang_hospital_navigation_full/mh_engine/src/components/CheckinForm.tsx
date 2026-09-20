import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { analyzeCheckin } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { useLanguage } from "@/lib/i18n";
import { QUICK_CATEGORY_KEYS, type QuickCategoryKey } from "@/lib/serviceMapping";
import type { CheckinAnalyzeResult } from "@shared/types";

// Used ONLY by "Quick Analysis" (see handleQuickAnalyze) - plain English
// words chosen to hit the backend's keyword-matching category list (see
// mh_admin_server/src/data/categories.json), independent of whatever
// label is currently displayed in the UI's active language. Several of
// these chips don't have a matching backend category yet (Anger, Loneliness
// partially, Relationship, School/Work partially, Grief) - those fall back
// to the general "General concern" category, same as typing unrelated free
// text would. Where a real overlap exists (e.g. "panic"/"on edge" already
// live under Anxiety/Panic; "workload"/"pressure"/"deadline" already live
// under Stress), the chip correctly routes there.
const CATEGORY_SEARCH_TERMS: Record<QuickCategoryKey, string> = {
    stress: "stress overwhelmed",
    sleep: "sleep",
    lowMood: "sad low mood",
    anxiety: "anxiety worry",
    focus: "focus motivation",
    anger: "anger irritability",
    panic: "panic on edge",
    loneliness: "lonely isolation",
    relationship: "relationship family problems",
    schoolWork: "workload pressure deadline",
    grief: "grief loss",
    other: "not sure",
};

// How tall the search-bar-style textarea is allowed to auto-grow before it
// switches to scrolling internally instead of pushing the rest of the page
// down indefinitely.
const MAX_TEXTAREA_HEIGHT_PX = 240;

export function CheckinForm({
    onResult,
    selectedCategories,
    onSelectedCategoriesChange,
}: {
    onResult: (result: CheckinAnalyzeResult) => void;
    /** Lifted up to Home.tsx so the hospital section below can also see
     * which categories are selected, to filter results by relevant
     * service tags (see lib/serviceMapping.ts and NearMeHospitals.tsx). */
    selectedCategories: QuickCategoryKey[];
    onSelectedCategoriesChange: (categories: QuickCategoryKey[]) => void;
}) {
    const { t } = useLanguage();
    const [text, setText] = React.useState("");

    const categoryLabels: Record<QuickCategoryKey, string> = {
        stress: t.categoryStress,
        sleep: t.categorySleep,
        lowMood: t.categoryLowMood,
        anxiety: t.categoryAnxiety,
        focus: t.categoryFocus,
        anger: t.categoryAnger,
        panic: t.categoryPanic,
        loneliness: t.categoryLoneliness,
        relationship: t.categoryRelationship,
        schoolWork: t.categorySchoolWork,
        grief: t.categoryGrief,
        other: t.categoryOther,
    };

    const toggleCategory = (category: QuickCategoryKey) => {
        onSelectedCategoriesChange(
            selectedCategories.includes(category)
                ? selectedCategories.filter((entry) => entry !== category)
                : [...selectedCategories, category]
        );
    };

    const mutation = useMutation({
        mutationFn: (value: string) => analyzeCheckin(value, getSessionId()),
        onSuccess: onResult,
        onError: () => toast.error(t.checkinErrorToast),
    });

    const handleAnalyze = () => {
        if (!text.trim()) {
            toast.warning(t.checkinEmptyWarning);
            return;
        }
        mutation.mutate(text);
    };

    // For users who'd rather just tap categories than type - builds a
    // search string from the selected chips' CATEGORY_SEARCH_TERMS (not
    // their display labels - see that constant's comment for why) and
    // reuses the exact same analyze mutation the search bar uses.
    const handleQuickAnalyze = () => {
        if (selectedCategories.length === 0) {
            toast.warning(t.checkinQuickAnalyzeEmptyWarning);
            return;
        }
        const searchText = selectedCategories.map((key) => CATEGORY_SEARCH_TERMS[key]).join(", ");
        mutation.mutate(searchText);
    };

    // Grows the textarea to fit its content (up to a cap), search-bar style.
    // "auto" first so the box can also SHRINK back down when text is
    // deleted, not just grow - scrollHeight only ever reports the height
    // needed for the current content once any earlier fixed height is
    // cleared.
    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
        const el = event.target;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
    };

    // Enter submits (like a search bar); Shift+Enter still inserts a
    // newline, so multi-line descriptions are still possible.
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleAnalyze();
        }
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{t.checkinCategoriesLabel}</p>
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={selectedCategories.length === 0 || mutation.isPending}
                        onClick={handleQuickAnalyze}
                        className="transition-shadow duration-150 hover:ring-[3px] hover:ring-white hover:shadow-[0_0_20px_6px_rgba(255,255,255,0.9)]"
                    >
                        {mutation.isPending ? <Spinner /> : <Zap className="size-4" />}
                        {t.checkinQuickAnalyze}
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {QUICK_CATEGORY_KEYS.map((category) => {
                        const isSelected = selectedCategories.includes(category);
                        return (
                            <Button
                                key={category}
                                type="button"
                                size="sm"
                                variant={isSelected ? "default" : "outline"}
                                aria-pressed={isSelected}
                                className={cn(
                                    // Page background is dark now, so a plain bright white
                                    // ring + glow reads clearly with no extra contrast tricks.
                                    "rounded-full transition-shadow duration-150",
                                    "hover:ring-[3px] hover:ring-white hover:shadow-[0_0_20px_6px_rgba(255,255,255,0.9)]",
                                    isSelected &&
                                        "ring-[3px] ring-white shadow-[0_0_22px_7px_rgba(255,255,255,0.95)] hover:opacity-90"
                                )}
                                onClick={() => toggleCategory(category)}
                            >
                                {categoryLabels[category]}
                            </Button>
                        );
                    })}
                </div>
                {selectedCategories.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {t.checkinSelectedPrefix}
                        {selectedCategories.map((key) => categoryLabels[key]).join(", ")}
                    </p>
                )}
            </div>

            <p className="text-sm text-muted-foreground">{t.checkinDescribeLabel}</p>
            <div
                className={cn(
                    "relative mx-auto max-w-xl rounded-2xl border border-input bg-background shadow-sm transition-shadow duration-150",
                    // Page background is dark now, so a plain bright white
                    // ring + glow reads clearly with no extra contrast tricks.
                    "hover:ring-[3px] hover:ring-white hover:shadow-[0_0_20px_6px_rgba(255,255,255,0.9)]",
                    "focus-within:ring-[3px] focus-within:ring-white focus-within:shadow-[0_0_26px_8px_rgba(255,255,255,0.95)]"
                )}
            >
                <Textarea
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    placeholder={t.checkinPlaceholder}
                    rows={1}
                    className="min-h-0 resize-none overflow-y-auto rounded-2xl border-0 bg-transparent py-3 pl-4 pr-12 shadow-none focus-visible:ring-0"
                    style={{ maxHeight: MAX_TEXTAREA_HEIGHT_PX }}
                />
                <Button
                    type="button"
                    size="icon"
                    aria-label={t.checkinAnalyzeAria}
                    onClick={handleAnalyze}
                    disabled={mutation.isPending}
                    className="absolute bottom-2 right-2 size-8 rounded-full"
                >
                    {mutation.isPending ? <Spinner /> : <Search className="size-4" />}
                </Button>
            </div>
        </div>
    );
}
