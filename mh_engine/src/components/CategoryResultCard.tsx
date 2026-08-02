import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Category } from "@shared/types";

export function CategoryResultCard({ category }: { category: Category }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-xl">{category.icon}</span>
                    {category.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    General information based on keywords in your message—not a diagnosis.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="mb-1 text-sm font-medium">
                        What this concern may relate to
                    </h3>
                    <p className="mb-1 text-sm text-muted-foreground">
                        People who mention similar feelings often talk about things like:
                    </p>
                    <ul className="list-disc space-y-0.5 pl-5 text-sm">
                        {category.relatesTo.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="mb-1 text-sm font-medium">Suggested support type</h3>
                    <Alert variant="info">
                        <AlertDescription>{category.supportType}</AlertDescription>
                    </Alert>
                </div>

                <div>
                    <h3 className="mb-1 text-sm font-medium">
                        When you may consider seeking professional help
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        You might consider speaking with a counselor, doctor, or other
                        trained professional <strong>if</strong>: {category.seekProfessionalWhen}
                    </p>
                </div>

                <Accordion type="single" collapsible>
                    <AccordionItem value="self-care" className="border-b-0">
                        <AccordionTrigger className="text-sm">
                            Optional: gentle self-care idea
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
