import * as React from "react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    fetchFeedbacks,
    updateFeedbackStatus,
    type AdminFeedback,
} from "@/queries/feedback";

const STATUS_VARIANT: Record<string, "secondary" | "warning" | "success"> = {
    new: "warning",
    reviewed: "secondary",
    resolved: "success",
};

export default function Feedback() {
    const [feedbacks, setFeedbacks] = React.useState<AdminFeedback[] | null>(null);

    const load = React.useCallback(() => {
        fetchFeedbacks().then(setFeedbacks);
    }, []);

    React.useEffect(() => {
        load();
    }, [load]);

    const handleStatusChange = async (id: number, status: string) => {
        await updateFeedbackStatus(id, status);
        toast.success("Status updated");
        load();
    };

    if (!feedbacks) {
        return (
            <div className="flex justify-center py-12">
                <Spinner className="size-6" />
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                        <TableCell className="whitespace-nowrap">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                            <div>{feedback.name}</div>
                            <div className="text-xs text-muted-foreground">{feedback.email}</div>
                        </TableCell>
                        <TableCell className="max-w-md">{feedback.message}</TableCell>
                        <TableCell>
                            <Select
                                value={feedback.status}
                                onValueChange={(status) => handleStatusChange(feedback.id, status)}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue>
                                        <Badge variant={STATUS_VARIANT[feedback.status] ?? "secondary"}>
                                            {feedback.status}
                                        </Badge>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">new</SelectItem>
                                    <SelectItem value="reviewed">reviewed</SelectItem>
                                    <SelectItem value="resolved">resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
