import { apiClient } from "@/lib/apiClient";
import type { PaginatedResponse } from "@/queries/hospitals";

export interface LogEntry {
    id: number;
    adminId: number;
    tableName: string;
    recordId: number;
    action: string;
    previousData: string | null;
    newData: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    adminName: string | null;
    adminEmail: string | null;
}

export interface FetchLogsParams {
    page?: number;
    limit?: number;
    adminSearch?: string;
    tableName?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
}

export const fetchLogs = async (
    params?: FetchLogsParams
): Promise<PaginatedResponse<LogEntry>> => {
    const response = await apiClient.get("/api/admin/logs", { params });
    return response.data.data;
};
