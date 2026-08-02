import {
    boolean,
    integer,
    pgTable,
    timestamp,
    varchar,
    text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const adminsTable = pgTable("admins", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    role: varchar({ length: 50 }).notNull().default("admin"),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

export const logsTable = pgTable("logs", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    adminId: integer()
        .notNull()
        .references(() => adminsTable.id),
    tableName: varchar({ length: 100 }).notNull(),
    recordId: integer().notNull(),
    action: varchar({ length: 50 }).notNull(),
    previousData: varchar({ length: 2000 }),
    newData: varchar({ length: 2000 }),
    ipAddress: varchar({ length: 45 }),
    userAgent: varchar({ length: 255 }),
    createdAt: timestamp().notNull().defaultNow(),
});

/**
 * Replaces app.py's hardcoded CATEGORY_KEYWORDS/CATEGORY_ICONS/CATEGORY_DETAILS
 * dicts, making the bilingual keyword-categorization data admin-manageable.
 * Exactly one row should have isFallback=true ("General concern") — see
 * adminCategory.controller.ts's deleteCategory guard.
 */
export const categoriesTable = pgTable("categories", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 100 }).notNull().unique(),
    icon: varchar({ length: 16 }).notNull(),
    keywordsEn: text().array().notNull().default([]),
    keywordsZh: text().array().notNull().default([]),
    relatesTo: text().array().notNull().default([]),
    supportType: varchar({ length: 1000 }).notNull(),
    seekProfessionalWhen: varchar({ length: 1000 }).notNull(),
    gentleSuggestion: varchar({ length: 1000 }).notNull(),
    displayOrder: integer().notNull().default(0),
    isFallback: boolean().notNull().default(false),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

/** Replaces hospitals.csv. Plain text city/district for CSV fidelity. */
export const hospitalsTable = pgTable("hospitals", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    city: varchar({ length: 100 }).notNull(),
    district: varchar({ length: 100 }),
    department: varchar({ length: 255 }).notNull(),
    specialty: varchar({ length: 255 }).notNull(),
    address: varchar({ length: 500 }),
    phone: varchar({ length: 50 }),
    website: varchar({ length: 255 }),
    verified: varchar({ length: 100 }),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

/**
 * Anonymous check-in analytics only. Deliberately does NOT store the raw
 * free-text the user typed — only metadata — to honor the source app's
 * "no persistence of user input" ethos for this sensitive mental-health
 * domain. sessionId is a random client-generated UUID, not identity-derived.
 */
export const checkinsTable = pgTable("checkins", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    sessionId: varchar({ length: 64 }).notNull(),
    matchedCategoryIds: integer().array().notNull().default([]),
    isFallbackMatch: boolean().notNull().default(false),
    textLength: integer().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
});

export const feedbacksTable = pgTable("feedbacks", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    category: varchar({ length: 100 }).notNull().default("general"),
    message: varchar({ length: 5000 }).notNull(),
    status: varchar({ length: 50 }).notNull().default("new"), // new, reviewed, resolved
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

export const logsRelations = relations(logsTable, ({ one }) => ({
    admin: one(adminsTable, {
        fields: [logsTable.adminId],
        references: [adminsTable.id],
    }),
}));

export const adminsRelations = relations(adminsTable, ({ many }) => ({
    logs: many(logsTable),
}));
