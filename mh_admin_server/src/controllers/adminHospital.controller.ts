import { parse } from "csv-parse/sync";
import { db } from "../db";
import { hospitalsTable } from "../db/schema";
import {
    BadRequestError,
    NotFoundError,
} from "../middlewares/error.middleware";
import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { createLog, LogContext } from "./logs.controller";

export interface HospitalInput {
    name: string;
    city: string;
    district?: string | null;
    department: string;
    specialty: string;
    address?: string | null;
    phone?: string | null;
    website?: string | null;
    verified?: string | null;
    isActive?: boolean;
}

export interface GetHospitalsParams {
    search?: string;
    city?: string;
    page?: number;
    limit?: number;
}

export async function getHospitals(params: GetHospitalsParams = {}) {
    const { search, city, page = 1, limit: rawLimit = 20 } = params;
    const limit = Math.max(1, Math.min(rawLimit, 100));
    const pageNum = Math.max(1, page);
    const offset = (pageNum - 1) * limit;

    const conditions = [];
    if (search?.trim()) {
        const pattern = `%${search.trim()}%`;
        conditions.push(
            or(ilike(hospitalsTable.name, pattern), ilike(hospitalsTable.city, pattern))
        );
    }
    if (city?.trim()) {
        conditions.push(eq(hospitalsTable.city, city.trim()));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const baseQuery = db.select().from(hospitalsTable);
    const countQuery = db.select({ value: count() }).from(hospitalsTable);

    const [{ value: total }] = whereClause
        ? await countQuery.where(whereClause)
        : await countQuery;

    const rows = await (whereClause ? baseQuery.where(whereClause) : baseQuery)
        .orderBy(asc(hospitalsTable.name))
        .limit(limit)
        .offset(offset);

    return {
        data: rows,
        pagination: {
            total,
            page: pageNum,
            limit,
            totalPages: Math.ceil(total / limit),
            count: rows.length,
        },
    };
}

export async function getHospitalById(id: number) {
    const [hospital] = await db
        .select()
        .from(hospitalsTable)
        .where(eq(hospitalsTable.id, id));
    if (!hospital) throw new NotFoundError("Hospital not found");
    return hospital;
}

export async function createHospital(
    input: HospitalInput,
    logContext?: LogContext
) {
    if (!input.name?.trim() || !input.city?.trim()) {
        throw new BadRequestError("name and city are required");
    }

    const [created] = await db
        .insert(hospitalsTable)
        .values({
            name: input.name.trim(),
            city: input.city.trim(),
            district: input.district?.trim() || null,
            department: input.department?.trim() || "",
            specialty: input.specialty?.trim() || "",
            address: input.address?.trim() || null,
            phone: input.phone?.trim() || null,
            website: input.website?.trim() || null,
            verified: input.verified?.trim() || null,
            isActive: input.isActive ?? true,
        })
        .returning();

    if (logContext) {
        await createLog({
            ...logContext,
            tableName: "hospitals",
            recordId: created.id,
            action: "create",
            newData: JSON.stringify(created),
        });
    }

    return created;
}

export async function updateHospital(
    id: number,
    input: Partial<HospitalInput>,
    logContext?: LogContext
) {
    const existing = await getHospitalById(id);

    const [updated] = await db
        .update(hospitalsTable)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(hospitalsTable.id, id))
        .returning();

    if (logContext) {
        await createLog({
            ...logContext,
            tableName: "hospitals",
            recordId: id,
            action: "update",
            previousData: JSON.stringify(existing),
            newData: JSON.stringify(updated),
        });
    }

    return updated;
}

export async function deleteHospital(id: number, logContext?: LogContext) {
    const existing = await getHospitalById(id);

    await db.delete(hospitalsTable).where(eq(hospitalsTable.id, id));

    if (logContext) {
        await createLog({
            ...logContext,
            tableName: "hospitals",
            recordId: id,
            action: "delete",
            previousData: JSON.stringify(existing),
        });
    }

    return { id };
}

interface CsvRow {
    name?: string;
    city?: string;
    district?: string;
    department?: string;
    specialty?: string;
    address?: string;
    phone?: string;
    website?: string;
    verified?: string;
}

export async function bulkUploadHospitalsFromCsv(
    fileBuffer: Buffer,
    logContext?: LogContext
) {
    let rows: CsvRow[];
    try {
        rows = parse(fileBuffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
    } catch (error: any) {
        throw new BadRequestError(`Could not parse CSV: ${error.message}`);
    }

    let created = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            if (!row.name?.trim() || !row.city?.trim()) {
                throw new Error("name and city are required");
            }
            await db.insert(hospitalsTable).values({
                name: row.name.trim(),
                city: row.city.trim(),
                district: row.district?.trim() || null,
                department: row.department?.trim() || "",
                specialty: row.specialty?.trim() || "",
                address: row.address?.trim() || null,
                phone: row.phone?.trim() || null,
                website: row.website?.trim() || null,
                verified: row.verified?.trim() || null,
            });
            created++;
        } catch (error: any) {
            errors.push({ row: i + 2, message: error.message });
        }
    }

    if (logContext) {
        await createLog({
            ...logContext,
            tableName: "hospitals",
            recordId: 0,
            action: "bulk_upload",
            newData: JSON.stringify({ created, errorCount: errors.length }),
        });
    }

    return { created, errors };
}
