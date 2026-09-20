import { db } from "../db";
import { categoriesTable, checkinsTable } from "../db/schema";
import { BadRequestError, NotFoundError } from "../middlewares/error.middleware";
import { asc, eq } from "drizzle-orm";

type CategoryRow = typeof categoriesTable.$inferSelect;

/**
 * Direct port of app.py's `categorize_feelings`: lowercase-normalize the
 * input, then check each active category's English + Chinese keyword lists
 * for a substring match. A check-in can match multiple categories; if none
 * match, the single `isFallback` category ("General concern") is returned.
 * Kept as a pure function so it can be exercised in isolation, same as the
 * original.
 */
export function categorizeFeelings(
    text: string,
    categories: CategoryRow[]
): CategoryRow[] {
    const normalized = text.toLowerCase();
    const matches: CategoryRow[] = [];

    for (const category of categories) {
        if (category.isFallback) continue;
        const keywords = [...category.keywordsEn, ...category.keywordsZh];
        if (keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) {
            matches.push(category);
        }
    }

    if (matches.length > 0) {
        return matches;
    }

    const fallback = categories.find((category) => category.isFallback);
    if (!fallback) {
        throw new NotFoundError(
            "No fallback category is configured. An admin must mark one category as the fallback."
        );
    }
    return [fallback];
}

function toPublicCategory(category: CategoryRow) {
    return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        relatesTo: category.relatesTo,
        supportType: category.supportType,
        seekProfessionalWhen: category.seekProfessionalWhen,
        gentleSuggestion: category.gentleSuggestion,
        isFallback: category.isFallback,
    };
}

export async function analyzeCheckin({
    text,
    sessionId,
}: {
    text: string;
    sessionId: string;
}) {
    if (!text?.trim()) {
        throw new BadRequestError("text is required");
    }
    if (!sessionId?.trim()) {
        throw new BadRequestError("sessionId is required");
    }

    const activeCategories = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.isActive, true))
        .orderBy(asc(categoriesTable.displayOrder));

    const matched = categorizeFeelings(text, activeCategories);
    const isFallback = matched.length === 1 && matched[0].isFallback;

    await db.insert(checkinsTable).values({
        sessionId: sessionId.trim().slice(0, 64),
        matchedCategoryIds: matched.map((category) => category.id),
        isFallbackMatch: isFallback,
        textLength: text.trim().length,
    });

    return {
        categories: matched.map(toPublicCategory),
        matchedCount: matched.length,
        isFallback,
    };
}
