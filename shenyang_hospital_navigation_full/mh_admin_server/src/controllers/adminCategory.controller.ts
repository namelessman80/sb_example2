import { db } from "../db";
import { categoriesTable } from "../db/schema";
import {
    BadRequestError,
    NotFoundError,
} from "../middlewares/error.middleware";
import { eq, asc } from "drizzle-orm";
import { createLog, LogContext } from "./logs.controller";

export interface CategoryInput {
    name: string;
    icon: string;
    keywordsEn: string[];
    keywordsZh: string[];
    relatesTo: string[];
    supportType: string;
    seekProfessionalWhen: string;
    gentleSuggestion: string;
    displayOrder?: number;
    isFallback?: boolean;
    isActive?: boolean;
}

export async function getCategories() {
    return db
        .select()
        .from(categoriesTable)
        .orderBy(asc(categoriesTable.displayOrder));
}

export async function getCategoryById(id: number) {
    const [category] = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, id));
    if (!category) throw new NotFoundError("Category not found");
    return category;
}

export async function createCategory(
    input: CategoryInput,
    logContext?: LogContext
) {
    if (!input.name?.trim() || !input.icon?.trim()) {
        throw new BadRequestError("name and icon are required");
    }

    const [created] = await db
        .insert(categoriesTable)
        .values({
            name: input.name.trim(),
            icon: input.icon.trim(),
            keywordsEn: input.keywordsEn ?? [],
            keywordsZh: input.keywordsZh ?? [],
            relatesTo: input.relatesTo ?? [],
            supportType: input.supportType ?? "",
            seekProfessionalWhen: input.seekProfessionalWhen ?? "",
            gentleSuggestion: input.gentleSuggestion ?? "",
            displayOrder: input.displayOrder ?? 0,
            isFallback: input.isFallback ?? false,
            isActive: input.isActive ?? true,
        })
        .returning();

    if (logContext) {
        await createLog({
            ...logContext,
            tableName: "categories",
            recordId: created.id,
            action: "create",
            newData: JSON.stringify(created),
        });
    }

    return created;
}

export async function updateCategory(
    id: number,
    input: Partial<CategoryInput>,
    logContext?: LogContext
) {
    const existing = await getCategoryById(id);

    const [updated] = await db
        .update(categoriesTable)
        .set({
            ...input,
            updatedAt: new Date(),
        })
        .where(eq(categoriesTable.id, id))
        .returning();

    if (logContext) {
        await createLog({
            ...logContext,
            tableName: "categories",
            recordId: id,
            action: "update",
            previousData: JSON.stringify(existing),
            newData: JSON.stringify(updated),
        });
    }

    return updated;
}

export async function deleteCategory(id: number, logContext?: LogContext) {
    const existing = await getCategoryById(id);

    if (existing.isFallback) {
        throw new BadRequestError(
            "Cannot delete the fallback category. Every check-in needs a default category to fall back to."
        );
    }

    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));

    if (logContext) {
        await createLog({
            ...logContext,
            tableName: "categories",
            recordId: id,
            action: "delete",
            previousData: JSON.stringify(existing),
        });
    }

    return { id };
}
