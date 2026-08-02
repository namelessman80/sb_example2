import { db } from "../db";
import { categoriesTable, checkinsTable } from "../db/schema";
import { gte } from "drizzle-orm";

export async function getCheckinAnalytics(params: { days?: number } = {}) {
    const days = Math.max(1, Math.min(params.days ?? 30, 365));
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const [checkins, categories] = await Promise.all([
        db.select().from(checkinsTable).where(gte(checkinsTable.createdAt, cutoff)),
        db.select().from(categoriesTable),
    ]);

    const categoryById = new Map(categories.map((category) => [category.id, category]));

    const total = checkins.length;
    const uniqueSessions = new Set(checkins.map((c) => c.sessionId)).size;
    const fallbackCount = checkins.filter((c) => c.isFallbackMatch).length;
    const fallbackRate = total > 0 ? fallbackCount / total : 0;

    const categoryCounts = new Map<number, number>();
    for (const checkin of checkins) {
        for (const categoryId of checkin.matchedCategoryIds) {
            categoryCounts.set(categoryId, (categoryCounts.get(categoryId) ?? 0) + 1);
        }
    }

    const byCategory = Array.from(categoryCounts.entries())
        .map(([categoryId, matchCount]) => {
            const category = categoryById.get(categoryId);
            return {
                categoryId,
                name: category?.name ?? "Unknown",
                icon: category?.icon ?? "❓",
                matchCount,
            };
        })
        .sort((a, b) => b.matchCount - a.matchCount);

    const dailyCounts = new Map<string, number>();
    for (const checkin of checkins) {
        const day = checkin.createdAt.toISOString().slice(0, 10);
        dailyCounts.set(day, (dailyCounts.get(day) ?? 0) + 1);
    }
    const daily = Array.from(dailyCounts.entries())
        .map(([date, checkinCount]) => ({ date, count: checkinCount }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        totals: { total, uniqueSessions, fallbackCount },
        fallbackRate,
        byCategory,
        daily,
    };
}
