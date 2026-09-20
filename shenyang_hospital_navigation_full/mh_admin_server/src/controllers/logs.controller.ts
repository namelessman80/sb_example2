import { db } from "../db";
import { logsTable, adminsTable } from "../db/schema";
import { BadRequestError } from "../middlewares/error.middleware";
import { eq, and, or, desc, sql, gte, lte, ilike } from "drizzle-orm";

export type LogContext = {
    adminId: number;
    ipAddress?: string | null;
    userAgent?: string | null;
};

export type CreateLogParams = {
    adminId: number;
    tableName: string;
    recordId: number;
    action: string;
    previousData?: string | null;
    newData?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
};

const MAX_DATA_LENGTH = 2000;

export async function createLog(params: CreateLogParams) {
    const {
        adminId,
        tableName,
        recordId,
        action,
        previousData,
        newData,
        ipAddress,
        userAgent,
    } = params;

    if (!tableName?.trim()) {
        throw new BadRequestError("tableName is required");
    }
    if (action?.trim() === "") {
        throw new BadRequestError("action is required");
    }

    const [log] = await db
        .insert(logsTable)
        .values({
            adminId,
            tableName: tableName.trim().slice(0, 100),
            recordId,
            action: action.trim().slice(0, 50),
            previousData:
                previousData != null
                    ? String(previousData).slice(0, MAX_DATA_LENGTH)
                    : null,
            newData:
                newData != null ? String(newData).slice(0, MAX_DATA_LENGTH) : null,
            ipAddress: ipAddress != null ? String(ipAddress).slice(0, 45) : null,
            userAgent:
                userAgent != null ? String(userAgent).slice(0, 255) : null,
        })
        .returning();

    return log;
}

export type GetAllLogsParams = {
    page?: number;
    limit?: number;
    adminSearch?: string;
    tableName?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
};

export async function getAllLogs(params: GetAllLogsParams = {}) {
    const {
        page = 1,
        limit: rawLimit = 10,
        adminSearch,
        tableName,
        action,
        dateFrom,
        dateTo,
    } = params;

    const limit = Math.max(1, Math.min(rawLimit, 100));
    const pageNum = Math.max(1, page);
    const offset = (pageNum - 1) * limit;

    const conditions = [];

    if (adminSearch?.trim()) {
        const pattern = `%${adminSearch.trim()}%`;
        conditions.push(
            or(ilike(adminsTable.name, pattern), ilike(adminsTable.email, pattern))
        );
    }
    if (tableName?.trim()) {
        conditions.push(ilike(logsTable.tableName, `%${tableName.trim()}%`));
    }
    if (action?.trim()) {
        conditions.push(ilike(logsTable.action, `%${action.trim()}%`));
    }
    if (dateFrom) {
        const from = new Date(dateFrom);
        if (!isNaN(from.getTime())) {
            conditions.push(gte(logsTable.createdAt, from));
        }
    }
    if (dateTo) {
        const to = new Date(dateTo);
        if (!isNaN(to.getTime())) {
            conditions.push(lte(logsTable.createdAt, to));
        }
    }

    const baseQuery = db
        .select({
            id: logsTable.id,
            adminId: logsTable.adminId,
            tableName: logsTable.tableName,
            recordId: logsTable.recordId,
            action: logsTable.action,
            previousData: logsTable.previousData,
            newData: logsTable.newData,
            ipAddress: logsTable.ipAddress,
            userAgent: logsTable.userAgent,
            createdAt: logsTable.createdAt,
            adminName: adminsTable.name,
            adminEmail: adminsTable.email,
        })
        .from(logsTable)
        .leftJoin(adminsTable, eq(logsTable.adminId, adminsTable.id));

    const countQuery = db
        .select({ count: sql<number>`count(*)::int` })
        .from(logsTable)
        .leftJoin(adminsTable, eq(logsTable.adminId, adminsTable.id));

    let filteredBase = baseQuery;
    let filteredCount = countQuery;
    if (conditions.length > 0) {
        const whereClause = and(...conditions);
        filteredBase = filteredBase.where(whereClause) as typeof baseQuery;
        filteredCount = filteredCount.where(whereClause) as typeof countQuery;
    }

    const [{ count: totalCount }] = await filteredCount;
    const total = totalCount ?? 0;

    const logs = await filteredBase
        .orderBy(desc(logsTable.createdAt))
        .limit(limit)
        .offset(offset);

    const totalPages = Math.ceil(total / limit);

    return {
        data: logs,
        pagination: {
            total,
            page: pageNum,
            limit,
            totalPages,
            count: logs.length,
        },
    };
}
