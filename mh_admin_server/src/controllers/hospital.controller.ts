import { db } from "../db";
import { hospitalsTable } from "../db/schema";
import { and, asc, eq } from "drizzle-orm";

export async function getPublicHospitals(params: { city?: string }) {
    const conditions = [eq(hospitalsTable.isActive, true)];

    if (params.city?.trim()) {
        conditions.push(eq(hospitalsTable.city, params.city.trim()));
    }

    return db
        .select()
        .from(hospitalsTable)
        .where(and(...conditions))
        .orderBy(asc(hospitalsTable.name));
}
