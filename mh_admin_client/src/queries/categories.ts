import { apiClient } from "@/lib/apiClient";

export interface AdminCategory {
    id: number;
    name: string;
    icon: string;
    keywordsEn: string[];
    keywordsZh: string[];
    relatesTo: string[];
    supportType: string;
    seekProfessionalWhen: string;
    gentleSuggestion: string;
    displayOrder: number;
    isFallback: boolean;
    isActive: boolean;
}

export type CategoryInput = Omit<AdminCategory, "id">;

export const fetchCategories = async (): Promise<AdminCategory[]> => {
    const response = await apiClient.get("/api/admin/categories");
    return response.data.data;
};

export const createCategory = async (
    input: CategoryInput
): Promise<AdminCategory> => {
    const response = await apiClient.post("/api/admin/categories", input);
    return response.data.data;
};

export const updateCategory = async (
    id: number,
    input: Partial<CategoryInput>
): Promise<AdminCategory> => {
    const response = await apiClient.put(`/api/admin/categories/${id}`, input);
    return response.data.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/categories/${id}`);
};
