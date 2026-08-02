import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import type { LogEntry } from "@/queries/logs";

function formatJson(value: string | null) {
    if (!value) return "—";
    try {
        return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
        return value;
    }
}

interface LogDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    log: LogEntry | null;
}

export function LogDetailDialog({ open, onOpenChange, log }: LogDetailDialogProps) {
    if (!log) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {log.action} · {log.tableName} #{log.recordId}
                    </DialogTitle>
                    <DialogDescription>
                        {log.adminName} ({log.adminEmail}) ·{" "}
                        {new Date(log.createdAt).toLocaleString()}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="mb-1 font-medium text-muted-foreground">Previous data</p>
                        <pre className="max-h-64 overflow-auto rounded-md bg-muted p-2 text-xs">
                            {formatJson(log.previousData)}
                        </pre>
                    </div>
                    <div>
                        <p className="mb-1 font-medium text-muted-foreground">New data</p>
                        <pre className="max-h-64 overflow-auto rounded-md bg-muted p-2 text-xs">
                            {formatJson(log.newData)}
                        </pre>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground">
                    IP: {log.ipAddress ?? "—"} · User agent: {log.userAgent ?? "—"}
                </div>
            </DialogContent>
        </Dialog>
    );
}
