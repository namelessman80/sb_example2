import * as React from "react";
import { useDebounce } from "use-debounce";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { LogDetailDialog } from "@/components/dialog/LogDetailDialog";
import { fetchLogs, type LogEntry } from "@/queries/logs";

export default function Logs() {
    const [search, setSearch] = React.useState("");
    const [debouncedSearch] = useDebounce(search, 300);
    const [page, setPage] = React.useState(1);
    const [logs, setLogs] = React.useState<LogEntry[] | null>(null);
    const [pagination, setPagination] = React.useState({ totalPages: 1, total: 0 });
    const [selected, setSelected] = React.useState<LogEntry | null>(null);

    React.useEffect(() => {
        fetchLogs({ adminSearch: debouncedSearch, page, limit: 20 }).then((result) => {
            setLogs(result.data);
            setPagination(result.pagination);
        });
    }, [debouncedSearch, page]);

    return (
        <div className="space-y-4">
            <Input
                placeholder="Search by admin name or email..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
                className="max-w-sm"
            />

            {!logs ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>When</TableHead>
                                <TableHead>Admin</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Table</TableHead>
                                <TableHead>Record</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow
                                    key={log.id}
                                    className="cursor-pointer"
                                    onClick={() => setSelected(log)}
                                >
                                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>{log.adminName ?? "—"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{log.action}</Badge>
                                    </TableCell>
                                    <TableCell>{log.tableName}</TableCell>
                                    <TableCell>#{log.recordId}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{pagination.total} entries</span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Previous
                            </Button>
                            <span>
                                Page {page} of {pagination.totalPages || 1}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= pagination.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}

            <LogDetailDialog
                open={!!selected}
                onOpenChange={(open) => !open && setSelected(null)}
                log={selected}
            />
        </div>
    );
}
