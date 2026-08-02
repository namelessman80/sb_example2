import * as React from "react";
import { useDebounce } from "use-debounce";
import { Plus, Upload, Pencil, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { CategoryDialog } from "@/components/dialog/CategoryDialog";
import { HospitalDialog } from "@/components/dialog/HospitalDialog";
import { BulkUploadDialog } from "@/components/dialog/BulkUploadDialog";
import { DeleteConfirmDialog } from "@/components/dialog/DeleteConfirmDialog";
import {
    fetchCategories,
    deleteCategory,
    type AdminCategory,
} from "@/queries/categories";
import {
    fetchHospitals,
    deleteHospital,
    type AdminHospital,
} from "@/queries/hospitals";

function CategoriesTab() {
    const [categories, setCategories] = React.useState<AdminCategory[] | null>(null);
    const [editing, setEditing] = React.useState<AdminCategory | null>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [deleting, setDeleting] = React.useState<AdminCategory | null>(null);

    const load = React.useCallback(() => {
        fetchCategories().then(setCategories);
    }, []);

    React.useEffect(() => {
        load();
    }, [load]);

    if (!categories) {
        return (
            <div className="flex justify-center py-12">
                <Spinner className="size-6" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    onClick={() => {
                        setEditing(null);
                        setDialogOpen(true);
                    }}
                >
                    <Plus /> New category
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Icon</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Flags</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>{category.icon}</TableCell>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>{category.displayOrder}</TableCell>
                            <TableCell className="space-x-1">
                                {category.isFallback && <Badge variant="secondary">Fallback</Badge>}
                                {!category.isActive && <Badge variant="outline">Inactive</Badge>}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setEditing(category);
                                        setDialogOpen(true);
                                    }}
                                >
                                    <Pencil />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleting(category)}
                                >
                                    <Trash2 />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <CategoryDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                category={editing}
                onSaved={load}
            />

            <DeleteConfirmDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title={`Delete "${deleting?.name}"?`}
                description="This cannot be undone. The fallback category cannot be deleted."
                onConfirm={async () => {
                    if (deleting) {
                        await deleteCategory(deleting.id);
                        load();
                    }
                }}
            />
        </div>
    );
}

function HospitalsTab() {
    const [search, setSearch] = React.useState("");
    const [debouncedSearch] = useDebounce(search, 300);
    const [page, setPage] = React.useState(1);
    const [hospitals, setHospitals] = React.useState<AdminHospital[] | null>(null);
    const [pagination, setPagination] = React.useState({ totalPages: 1, total: 0 });
    const [editing, setEditing] = React.useState<AdminHospital | null>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [uploadOpen, setUploadOpen] = React.useState(false);
    const [deleting, setDeleting] = React.useState<AdminHospital | null>(null);

    const load = React.useCallback(() => {
        fetchHospitals({ search: debouncedSearch, page, limit: 20 }).then((result) => {
            setHospitals(result.data);
            setPagination(result.pagination);
        });
    }, [debouncedSearch, page]);

    React.useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Search by name or city..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="max-w-sm"
                />
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setUploadOpen(true)}>
                        <Upload /> Bulk upload
                    </Button>
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setDialogOpen(true);
                        }}
                    >
                        <Plus /> New hospital
                    </Button>
                </div>
            </div>

            {!hospitals ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>District</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {hospitals.map((hospital) => (
                                <TableRow key={hospital.id}>
                                    <TableCell>{hospital.name}</TableCell>
                                    <TableCell>{hospital.city}</TableCell>
                                    <TableCell>{hospital.district ?? "—"}</TableCell>
                                    <TableCell>{hospital.department}</TableCell>
                                    <TableCell>
                                        {hospital.verified === "needs verification" ? (
                                            <Badge variant="warning">Needs verification</Badge>
                                        ) : (
                                            <Badge variant="success">OK</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditing(hospital);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            <Pencil />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleting(hospital)}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{pagination.total} hospitals</span>
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

            <HospitalDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                hospital={editing}
                onSaved={load}
            />

            <BulkUploadDialog
                open={uploadOpen}
                onOpenChange={setUploadOpen}
                onUploaded={load}
            />

            <DeleteConfirmDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title={`Delete "${deleting?.name}"?`}
                description="This cannot be undone."
                onConfirm={async () => {
                    if (deleting) {
                        await deleteHospital(deleting.id);
                        load();
                    }
                }}
            />
        </div>
    );
}

export default function ManageData() {
    return (
        <Tabs defaultValue="categories">
            <TabsList>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            </TabsList>
            <TabsContent value="categories">
                <CategoriesTab />
            </TabsContent>
            <TabsContent value="hospitals">
                <HospitalsTab />
            </TabsContent>
        </Tabs>
    );
}
