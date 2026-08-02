import * as React from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
    createCategory,
    updateCategory,
    type AdminCategory,
    type CategoryInput,
} from "@/queries/categories";

const linesToArray = (value: string) =>
    value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: AdminCategory | null;
    onSaved: () => void;
}

export function CategoryDialog({
    open,
    onOpenChange,
    category,
    onSaved,
}: CategoryDialogProps) {
    const [form, setForm] = React.useState({
        name: "",
        icon: "",
        keywordsEn: "",
        keywordsZh: "",
        relatesTo: "",
        supportType: "",
        seekProfessionalWhen: "",
        gentleSuggestion: "",
        displayOrder: "0",
        isFallback: false,
        isActive: true,
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (category) {
            setForm({
                name: category.name,
                icon: category.icon,
                keywordsEn: category.keywordsEn.join("\n"),
                keywordsZh: category.keywordsZh.join("\n"),
                relatesTo: category.relatesTo.join("\n"),
                supportType: category.supportType,
                seekProfessionalWhen: category.seekProfessionalWhen,
                gentleSuggestion: category.gentleSuggestion,
                displayOrder: String(category.displayOrder),
                isFallback: category.isFallback,
                isActive: category.isActive,
            });
        } else {
            setForm({
                name: "",
                icon: "",
                keywordsEn: "",
                keywordsZh: "",
                relatesTo: "",
                supportType: "",
                seekProfessionalWhen: "",
                gentleSuggestion: "",
                displayOrder: "0",
                isFallback: false,
                isActive: true,
            });
        }
    }, [category, open]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const input: CategoryInput = {
                name: form.name,
                icon: form.icon,
                keywordsEn: linesToArray(form.keywordsEn),
                keywordsZh: linesToArray(form.keywordsZh),
                relatesTo: linesToArray(form.relatesTo),
                supportType: form.supportType,
                seekProfessionalWhen: form.seekProfessionalWhen,
                gentleSuggestion: form.gentleSuggestion,
                displayOrder: parseInt(form.displayOrder, 10) || 0,
                isFallback: form.isFallback,
                isActive: form.isActive,
            };

            if (category) {
                await updateCategory(category.id, input);
                toast.success("Category updated");
            } else {
                await createCategory(input);
                toast.success("Category created");
            }
            onSaved();
            onOpenChange(false);
        } catch {
            // apiClient surfaces the error toast
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="icon">Icon (emoji)</Label>
                            <Input
                                id="icon"
                                required
                                value={form.icon}
                                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="keywordsEn">English keywords (one per line)</Label>
                            <Textarea
                                id="keywordsEn"
                                rows={4}
                                value={form.keywordsEn}
                                onChange={(e) => setForm({ ...form, keywordsEn: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="keywordsZh">Chinese keywords (one per line)</Label>
                            <Textarea
                                id="keywordsZh"
                                rows={4}
                                value={form.keywordsZh}
                                onChange={(e) => setForm({ ...form, keywordsZh: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="relatesTo">Relates to (one bullet per line)</Label>
                        <Textarea
                            id="relatesTo"
                            rows={3}
                            value={form.relatesTo}
                            onChange={(e) => setForm({ ...form, relatesTo: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="supportType">Suggested support type</Label>
                        <Textarea
                            id="supportType"
                            rows={2}
                            required
                            value={form.supportType}
                            onChange={(e) => setForm({ ...form, supportType: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="seekProfessionalWhen">
                            When to consider seeking professional help
                        </Label>
                        <Textarea
                            id="seekProfessionalWhen"
                            rows={2}
                            required
                            value={form.seekProfessionalWhen}
                            onChange={(e) =>
                                setForm({ ...form, seekProfessionalWhen: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="gentleSuggestion">Gentle self-care suggestion</Label>
                        <Textarea
                            id="gentleSuggestion"
                            rows={2}
                            required
                            value={form.gentleSuggestion}
                            onChange={(e) =>
                                setForm({ ...form, gentleSuggestion: e.target.value })
                            }
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="displayOrder" className="whitespace-nowrap">
                                Display order
                            </Label>
                            <Input
                                id="displayOrder"
                                type="number"
                                className="w-20"
                                value={form.displayOrder}
                                onChange={(e) =>
                                    setForm({ ...form, displayOrder: e.target.value })
                                }
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isFallback}
                                onChange={(e) =>
                                    setForm({ ...form, isFallback: e.target.checked })
                                }
                            />
                            Fallback category
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) =>
                                    setForm({ ...form, isActive: e.target.checked })
                                }
                            />
                            Active
                        </label>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            {category ? "Save changes" : "Create category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
