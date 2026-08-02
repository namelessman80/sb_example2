import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { analyzeCheckin } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import type { CheckinAnalyzeResult } from "@shared/types";

export function CheckinForm({
    onResult,
}: {
    onResult: (result: CheckinAnalyzeResult) => void;
}) {
    const [text, setText] = React.useState("");

    const mutation = useMutation({
        mutationFn: (value: string) => analyzeCheckin(value, getSessionId()),
        onSuccess: onResult,
        onError: () => toast.error("Could not analyze your check-in. Please try again."),
    });

    const handleAnalyze = () => {
        if (!text.trim()) {
            toast.warning("Please describe how you feel before analyzing.");
            return;
        }
        mutation.mutate(text);
    };

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold">How are you feeling?</h2>
            <p className="text-sm text-muted-foreground">
                Share a few sentences in your own words. There are no right or wrong
                answers.
            </p>
            <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Example: I've been very stressed and not sleeping well..."
                rows={6}
            />
            <Button onClick={handleAnalyze} disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner /> : <Search />}
                Analyze
            </Button>
        </div>
    );
}
