import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function Disclaimer({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Alert variant="warning" className={cn(className)}>
            <AlertTriangle />
            <AlertDescription>{children}</AlertDescription>
        </Alert>
    );
}
