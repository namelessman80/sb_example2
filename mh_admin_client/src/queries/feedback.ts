import { apiClient } from "@/lib/apiClient";

export interface AdminFeedback {
    id: number;
    name: string;
    email: string;
    category: string;
    message: string;
    status: "new" | "reviewed" | "resolved";
    createdAt: string;
}

export const fetchFeedbacks = async (status?: string): Promise<AdminFeedback[]> => {
    const response = await apiClient.get("/api/feedback", {
        params: status ? { status } : undefined,
    });
    return response.data.data;
};

export const updateFeedbackStatus = async (
    id: number,
    status: string
): Promise<AdminFeedback> => {
    const response = await apiClient.put(`/api/feedback/${id}/status`, { status });
    return response.data.data;
};
