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
import { Spinner } from "@/components/ui/spinner";
import {
    createHospital,
    updateHospital,
    type AdminHospital,
    type HospitalInput,
} from "@/queries/hospitals";

interface HospitalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hospital: AdminHospital | null;
    onSaved: () => void;
}

const EMPTY_FORM = {
    name: "",
    city: "",
    district: "",
    department: "",
    specialty: "",
    address: "",
    phone: "",
    website: "",
    verified: "",
};

export function HospitalDialog({
    open,
    onOpenChange,
    hospital,
    onSaved,
}: HospitalDialogProps) {
    const [form, setForm] = React.useState(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (hospital) {
            setForm({
                name: hospital.name,
                city: hospital.city,
                district: hospital.district ?? "",
                department: hospital.department,
                specialty: hospital.specialty,
                address: hospital.address ?? "",
                phone: hospital.phone ?? "",
                website: hospital.website ?? "",
                verified: hospital.verified ?? "",
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [hospital, open]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const input: HospitalInput = {
                ...form,
                district: form.district || null,
                address: form.address || null,
                phone: form.phone || null,
                website: form.website || null,
                verified: form.verified || null,
                isActive: hospital?.isActive ?? true,
            };

            if (hospital) {
                await updateHospital(hospital.id, input);
                toast.success("Hospital updated");
            } else {
                await createHospital(input);
                toast.success("Hospital created");
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
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{hospital ? "Edit hospital" : "New hospital"}</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
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
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                required
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="district">District</Label>
                            <Input
                                id="district"
                                value={form.district}
                                onChange={(e) => setForm({ ...form, district: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="specialty">Specialty</Label>
                            <Input
                                id="specialty"
                                value={form.specialty}
                                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                value={form.website}
                                onChange={(e) => setForm({ ...form, website: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <Label htmlFor="verified">Verification status</Label>
                            <Input
                                id="verified"
                                placeholder="e.g. needs verification"
                                value={form.verified}
                                onChange={(e) => setForm({ ...form, verified: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            {hospital ? "Save changes" : "Create hospital"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
