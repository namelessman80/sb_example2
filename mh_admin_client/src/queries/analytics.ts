import { apiClient } from "@/lib/apiClient";

export interface CheckinAnalytics {
    totals: { total: number; uniqueSessions: number; fallbackCount: number };
    fallbackRate: number;
    byCategory: { categoryId: number; name: string; icon: string; matchCount: number }[];
    daily: { date: string; count: number }[];
}

export const fetchCheckinAnalytics = async (
    days: number = 30
): Promise<CheckinAnalytics> => {
    const response = await apiClient.get("/api/admin/analytics/checkins", {
        params: { days },
    });
    return response.data.data;
};
