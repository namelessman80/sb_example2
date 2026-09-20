import { apiClient } from "@/lib/apiClient";

export interface AdminHospital {
    id: number;
    name: string;
    city: string;
    district: string | null;
    department: string;
    specialty: string;
    address: string | null;
    phone: string | null;
    website: string | null;
    verified: string | null;
    isActive: boolean;
    // Optional: leaving these out on create/update lets the server
    // auto-geocode from the address instead.
    latitude?: number | null;
    longitude?: number | null;
}

export type HospitalInput = Omit<AdminHospital, "id">;

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        count: number;
    };
}

export interface FetchHospitalsParams {
    search?: string;
    city?: string;
    page?: number;
    limit?: number;
}

export const fetchHospitals = async (
    params?: FetchHospitalsParams
): Promise<PaginatedResponse<AdminHospital>> => {
    const response = await apiClient.get("/api/admin/hospitals", { params });
    return response.data.data;
};

export const createHospital = async (
    input: HospitalInput
): Promise<AdminHospital> => {
    const response = await apiClient.post("/api/admin/hospitals", input);
    return response.data.data;
};

export const updateHospital = async (
    id: number,
    input: Partial<HospitalInput>
): Promise<AdminHospital> => {
    const response = await apiClient.put(`/api/admin/hospitals/${id}`, input);
    return response.data.data;
};

export const deleteHospital = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/hospitals/${id}`);
};

export interface BulkUploadResult {
    created: number;
    errors: { row: number; message: string }[];
}

export const bulkUploadHospitals = async (
    file: File
): Promise<BulkUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(
        "/api/admin/hospitals/bulk-upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
};
