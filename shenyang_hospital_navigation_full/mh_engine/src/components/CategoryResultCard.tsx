import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/lib/i18n";
import type { Category } from "@shared/types";

// NOTE: category.name / relatesTo / supportType / seekProfessionalWhen /
// gentleSuggestion are the AI-generated content itself, sourced from the
// backend's categories table - English-only today (see lib/i18n.tsx's
// header comment for why that's out of scope here). Only the surrounding
// wrapper labels below are translated.
export function CategoryResultCard({ category }: { category: Category }) {
    const { t } = useLanguage();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-xl">{category.icon}</span>
                    {category.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{t.resultCardGeneralInfoNote}</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="mb-1 text-sm font-medium">{t.resultCardRelatesToHeading}</h3>
                    <p className="mb-1 text-sm text-muted-foreground">
                        {t.resultCardRelatesToIntro}
                    </p>
                    <ul className="list-disc space-y-0.5 pl-5 text-sm">
                        {category.relatesTo.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="mb-1 text-sm font-medium">{t.resultCardSupportTypeHeading}</h3>
                    <Alert variant="info">
                        <AlertDescription>{category.supportType}</AlertDescription>
                    </Alert>
                </div>

                <div>
                    <h3 className="mb-1 text-sm font-medium">{t.resultCardSeekHelpHeading}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t.resultCardSeekHelpIntro} {category.seekProfessionalWhen}
                    </p>
                </div>

                <Accordion type="single" collapsible>
                    <AccordionItem value="self-care" className="border-b-0">
                        <AccordionTrigger className="text-sm">
                            {t.resultCardSelfCareToggle}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                            {category.gentleSuggestion}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}
