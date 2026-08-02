import * as React from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { bulkUploadHospitals, type BulkUploadResult } from "@/queries/hospitals";

interface BulkUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUploaded: () => void;
}

export function BulkUploadDialog({
    open,
    onOpenChange,
    onUploaded,
}: BulkUploadDialogProps) {
    const [file, setFile] = React.useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [result, setResult] = React.useState<BulkUploadResult | null>(null);

    React.useEffect(() => {
        if (open) {
            setFile(null);
            setResult(null);
        }
    }, [open]);

    const handleUpload = async () => {
        if (!file) return;
        setIsSubmitting(true);
        try {
            const uploadResult = await bulkUploadHospitals(file);
            setResult(uploadResult);
            toast.success(`Uploaded ${uploadResult.created} hospitals`);
            onUploaded();
        } catch {
            // apiClient surfaces the error toast
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bulk upload hospitals</DialogTitle>
                    <DialogDescription>
                        CSV columns: name, city, district, department, specialty, address,
                        phone, website, verified (same shape as the original hospitals.csv).
                    </DialogDescription>
                </DialogHeader>

                <Input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />

                {result && (
                    <div className="rounded-md border p-3 text-sm">
                        <p>
                            <strong>{result.created}</strong> hospitals created.
                        </p>
                        {result.errors.length > 0 && (
                            <div className="mt-2 max-h-40 overflow-y-auto text-destructive">
                                {result.errors.map((error, index) => (
                                    <p key={index}>
                                        Row {error.row}: {error.message}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={handleUpload} disabled={!file || isSubmitting}>
                        {isSubmitting && <Spinner />}
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
