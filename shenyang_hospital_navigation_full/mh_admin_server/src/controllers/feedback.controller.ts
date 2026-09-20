import { db } from "../db";
import { feedbacksTable } from "../db/schema";
import { BadRequestError, NotFoundError } from "../middlewares/error.middleware";
import { desc, eq } from "drizzle-orm";
import { createLog, LogContext } from "./logs.controller";

export async function createFeedback(input: {
    name: string;
    email: string;
    category?: string;
    message: string;
}) {
    if (!input.name?.trim() || !input.email?.trim() || !input.message?.trim()) {
        throw new BadRequestError("name, email, and message are required");
    }

    const [created] = await db
        .insert(feedbacksTable)
        .values({
            name: input.name.trim(),
            email: input.email.trim(),
            category: input.category?.trim() || "general",
            message: input.message.trim(),
        })
        .returning();

    return created;
}

export async function getFeedbacks(params: { status?: string } = {}) {
    const rows = await db
        .select()
        .from(feedbacksTable)
        .orderBy(desc(feedbacksTable.createdAt));

    if (params.status?.trim()) {
        return rows.filter((row) => row.status === params.status);
    }
    return rows;
}

export async function updateFeedbackStatus(
    id: number,
    status: string,
    logContext?: LogContext
) {
    const [existing] = await db
        .select()
        .from(feedbacksTable)
        .where(eq(feedbacksTable.id, id));
    if (!existing) throw new NotFoundError("Feedback not found");

    const [updated] = await db
        .update(feedbacksTable)
        .set({ status, updatedAt: new Date() })
        .where(eq(feedbacksTable.id, id))
        .returning();

    if (logContext) {
        await createLog({
            ...logContext,
            tableName: "feedbacks",
            recordId: id,
            action: "update_status",
            previousData: JSON.stringify({ status: existing.status }),
            newData: JSON.stringify({ status: updated.status }),
        });
    }

    return updated;
}
