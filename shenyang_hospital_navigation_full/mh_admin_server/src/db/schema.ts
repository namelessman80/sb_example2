import {
    boolean,
    doublePrecision,
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
    // English name and pinyin romanization of `name`, for the mh_engine
    // language toggle - nullable since not every hospital has these filled
    // in yet (see scripts/seed-shenyang-hospitals.ts for the 10 that do).
    nameEn: varchar({ length: 255 }),
    namePinyin: varchar({ length: 255 }),
    city: varchar({ length: 100 }).notNull(),
    district: varchar({ length: 100 }),
    department: varchar({ length: 255 }).notNull(),
    specialty: varchar({ length: 255 }).notNull(),
    address: varchar({ length: 500 }),
    // English translation of `address` - same nullable/optional idea as
    // nameEn above.
    addressEn: varchar({ length: 500 }),
    phone: varchar({ length: 50 }),
    website: varchar({ length: 255 }),
    // Legacy free-text status field - kept for now (not removed), but no
    // longer drives what's shown on the hospital card. See
    // verificationStatus below, which replaced it for display purposes.
    verified: varchar({ length: 100 }),
    // Three-state verification, replacing the old boolean-ish
    // "needs verification" display:
    //   "verified"   - identity, coordinates, AND currently displayed
    //                  service info have all been checked against
    //                  reliable sources. No warning badge shown.
    //   "partial"    - identity/coordinates verified, but service/
    //                  department info is still incomplete. Shows a
    //                  subtle "Service info incomplete" badge.
    //   "unverified" - important information hasn't been checked yet.
    //                  Shows the existing yellow "Needs Verification" badge.
    // Defaults to "unverified" - never auto-upgraded to "verified" or
    // "partial" just because a hospital exists; that only happens when
    // someone actually checks it (see mh_engine's HospitalCard.tsx for
    // the exact display rules per state).
    verificationStatus: varchar({ length: 20 }).notNull().default("unverified"),
    // What KIND of institution this is (e.g. "general", "cancer",
    // "mental_health_specialty") - broad, usually-obvious-from-the-name
    // classification, separate from `services` below. Defaults to
    // "general" since most hospitals are. This exists specifically so a
    // general hospital doesn't get assumed to offer mental health
    // services just because it's a hospital - see `services`.
    type: varchar({ length: 50 }).notNull().default("general"),
    // SPECIFIC, VERIFIED departments/services this hospital actually
    // offers (e.g. "psychiatry", "sleep") - used to filter "near me"
    // results by the visitor's selected experience categories (see
    // mh_engine/src/lib/serviceMapping.ts for the category -> tag
    // mapping, and hospital.controller.ts's getNearbyHospitals for the
    // filter). Defaults to empty and is NEVER auto-derived from `type` -
    // being a "general" hospital does not imply it offers psychiatry, and
    // being a "mental_health_specialty" hospital doesn't get its services
    // auto-filled either. A tag only goes here once someone has actually
    // verified that specific hospital offers that specific service.
    services: text().array().notNull().default([]),
    // GPS coordinates for "find hospitals near me". Nullable because existing
    // rows (and CSV-uploaded rows) may not have coordinates yet; backfilled
    // via scripts/geocode-hospitals.ts and auto-filled on create/update when
    // left blank (see adminHospital.controller.ts).
    latitude: doublePrecision(),
    longitude: doublePrecision(),
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
