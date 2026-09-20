/**
 * One-time data migration: replaces the single generic "Shenyang Mental
 * Health Center" placeholder row (and, on re-run, any earlier copies of
 * these same rows) with real Shenyang hospitals - name, English
 * translation, pinyin, and coordinates all provided directly by the
 * project owner (not geocoded/auto-translated).
 *
 * Coordinates are WGS84 (plain GPS lat/lng) - the same system this app's
 * map/distance code already assumes (see hospital.controller.ts's
 * haversineDistanceKm and the /nearby endpoint).
 *
 * `type` is a broad, usually-obvious-from-the-name institution
 * classification (see TYPE_DEPARTMENT_DEFAULTS) - separate from
 * `services`, which is the specific, VERIFIED department list actually
 * used to filter "near me" results (see mh_engine/src/lib/serviceMapping.ts).
 * Every hospital here gets `services: []` EXCEPT 沈阳市精神卫生中心
 * (Shenyang Mental Health Center) - its whole institutional purpose IS
 * psychiatric/mental health care, so tagging it with those two services
 * isn't a guess the way it would be for a general hospital. Every other
 * hospital's services stay empty until someone verifies what it actually
 * offers - being "general" does NOT imply "offers psychiatry."
 *
 * department/specialty (free-text display fields, separate from `type`)
 * are filled from TYPE_DEPARTMENT_DEFAULTS below rather than being
 * hardcoded to "Psychiatry" for every hospital like an earlier version of
 * this script did - that was actively misleading (a cancer hospital's
 * card would have displayed "Department: Psychiatry"). Real per-hospital
 * department/specialty data isn't known yet; these are still placeholders,
 * just accurate-by-type ones instead of a single wrong one for everyone.
 *
 * Run with: npm run seed-shenyang   (from mh_admin_server/)
 * Safe to re-run: it deletes any existing rows matching these exact
 * Chinese names (plus the old generic placeholder) before inserting, so
 * running it again just refreshes this list rather than creating
 * duplicates.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { inArray } from "drizzle-orm";
import postgres from "postgres";
import environments from "../src/environments";
import { hospitalsTable } from "../src/db/schema";

const client = postgres(environments.DATABASE_URL as string);
const db = drizzle(client);

type HospitalType =
    | "general"
    | "mental_health_specialty"
    | "cancer"
    | "orthopedics"
    | "oral_dental"
    | "maternal_child"
    | "traditional_chinese_medicine"
    | "anorectal";

/** Placeholder department/specialty text per institution type - accurate
 * at the "what kind of hospital is this" level, even though specific
 * per-hospital department data isn't available yet. */
const TYPE_DEPARTMENT_DEFAULTS: Record<HospitalType, { department: string; specialty: string }> = {
    general: { department: "General Medicine", specialty: "General hospital services" },
    mental_health_specialty: {
        department: "Psychiatry (Inpatient & Outpatient)",
        specialty: "Psychiatric diagnosis, treatment, and mental health rehabilitation",
    },
    cancer: { department: "Oncology", specialty: "Cancer treatment" },
    orthopedics: { department: "Orthopedics", specialty: "Orthopedic care" },
    oral_dental: { department: "Stomatology", specialty: "Dental and oral health" },
    maternal_child: { department: "Obstetrics/Gynecology & Pediatrics", specialty: "Maternal and child health" },
    traditional_chinese_medicine: {
        department: "Traditional Chinese Medicine",
        specialty: "TCM diagnosis and treatment",
    },
    anorectal: { department: "Anorectal Surgery", specialty: "Anorectal/proctology care" },
};

interface ShenyangHospitalSeed {
    name: string;
    nameEn: string;
    namePinyin: string;
    latitude: number;
    longitude: number;
    type: HospitalType;
    /** Only set (non-empty) where actually verified - see file header. */
    services?: string[];
    /** Overrides TYPE_DEPARTMENT_DEFAULTS for this one hospital, when
     * something more specific than the generic per-type text is known -
     * currently just the mental health center, so it reads as real
     * detail rather than the same boilerplate every "general" hospital
     * would otherwise show. */
    department?: string;
    specialty?: string;
}

// Matches the data in 0_map_api_example/leaflet-displacement-calculator/hospitals.js,
// plus English/pinyin translations.
const SHENYANG_HOSPITALS: ShenyangHospitalSeed[] = [
    {
        name: "中国医科大学附属第一医院",
        nameEn: "The First Affiliated Hospital of China Medical University",
        namePinyin: "Zhōngguó Yīkē Dàxué Fùshǔ Dì-yī Yīyuàn",
        latitude: 41.792898,
        longitude: 123.405202,
        type: "general",
    },
    {
        name: "中国医科大学附属盛京医院南湖院区",
        nameEn: "Shengjing Hospital of China Medical University, Nanhu Campus",
        namePinyin: "Zhōngguó Yīkē Dàxué Fùshǔ Shèngjīng Yīyuàn Nánhú Yuànqū",
        latitude: 41.770663,
        longitude: 123.420123,
        type: "general",
    },
    {
        name: "辽宁省人民医院",
        nameEn: "Liaoning Provincial People's Hospital",
        namePinyin: "Liáoníng Shěng Rénmín Yīyuàn",
        latitude: 41.773602,
        longitude: 123.447294,
        type: "general",
    },
    {
        name: "沈阳医学院附属中心医院",
        nameEn: "Central Hospital Affiliated to Shenyang Medical College",
        namePinyin: "Shěnyáng Yīxuéyuàn Fùshǔ Zhōngxīn Yīyuàn",
        latitude: 41.798450,
        longitude: 123.341010,
        type: "general",
    },
    {
        name: "沈阳市第一人民医院",
        nameEn: "Shenyang First People's Hospital",
        namePinyin: "Shěnyáng Shì Dì-yī Rénmín Yīyuàn",
        latitude: 41.813336,
        longitude: 123.459142,
        type: "general",
    },
    {
        name: "沈阳市第四人民医院",
        nameEn: "Shenyang Fourth People's Hospital",
        namePinyin: "Shěnyáng Shì Dì-sì Rénmín Yīyuàn",
        latitude: 41.817997,
        longitude: 123.414230,
        type: "general",
    },
    {
        name: "沈阳市第六人民医院",
        nameEn: "Shenyang Sixth People's Hospital",
        namePinyin: "Shěnyáng Shì Dì-liù Rénmín Yīyuàn",
        latitude: 41.769585,
        longitude: 123.395452,
        type: "general",
    },
    {
        name: "沈阳市第十人民医院",
        nameEn: "Shenyang Tenth People's Hospital",
        namePinyin: "Shěnyáng Shì Dì-shí Rénmín Yīyuàn",
        latitude: 41.828452,
        longitude: 123.466407,
        type: "general",
    },
    {
        name: "沈阳市儿童医院",
        nameEn: "Shenyang Children's Hospital",
        namePinyin: "Shěnyáng Shì Értóng Yīyuàn",
        latitude: 41.830970,
        longitude: 123.428470,
        type: "maternal_child",
    },
    {
        name: "沈阳市妇婴医院",
        nameEn: "Shenyang Women's and Children's Hospital",
        namePinyin: "Shěnyáng Shì Fùyīng Yīyuàn",
        latitude: 41.786216,
        longitude: 123.454707,
        type: "maternal_child",
    },
    {
        name: "中国医科大学附属第四医院",
        nameEn: "The Fourth Affiliated Hospital of China Medical University",
        namePinyin: "Zhōngguó Yīkē Dàxué Fùshǔ Dì-sì Yīyuàn",
        latitude: 41.831220,
        longitude: 123.455770,
        type: "general",
    },
    {
        name: "辽宁省肿瘤医院",
        nameEn: "Liaoning Cancer Hospital",
        namePinyin: "Liáoníng Shěng Zhǒngliú Yīyuàn",
        latitude: 41.791731,
        longitude: 123.466831,
        type: "cancer",
    },
    {
        name: "辽宁中医药大学附属医院",
        nameEn: "Affiliated Hospital of Liaoning University of Traditional Chinese Medicine",
        namePinyin: "Liáoníng Zhōngyīyào Dàxué Fùshǔ Yīyuàn",
        latitude: 41.828998,
        longitude: 123.424500,
        type: "traditional_chinese_medicine",
    },
    {
        name: "沈阳医学院附属第二医院",
        nameEn: "Second Affiliated Hospital of Shenyang Medical College",
        namePinyin: "Shěnyáng Yīxuéyuàn Fùshǔ Dì-èr Yīyuàn",
        latitude: 41.800610,
        longitude: 123.411350,
        type: "general",
    },
    {
        name: "沈阳市第五人民医院",
        nameEn: "Shenyang Fifth People's Hospital",
        namePinyin: "Shěnyáng Shì Dì-wǔ Rénmín Yīyuàn",
        latitude: 41.785952,
        longitude: 123.347284,
        type: "general",
    },
    {
        name: "沈阳市第七人民医院",
        nameEn: "Shenyang Seventh People's Hospital",
        namePinyin: "Shěnyáng Shì Dì-qī Rénmín Yīyuàn",
        latitude: 41.786670,
        longitude: 123.418960,
        type: "general",
    },
    {
        name: "沈阳市第九人民医院",
        nameEn: "Shenyang Ninth People's Hospital",
        namePinyin: "Shěnyáng Shì Dì-jiǔ Rénmín Yīyuàn",
        latitude: 41.791003,
        longitude: 123.330243,
        type: "general",
    },
    {
        name: "沈阳市红十字会医院",
        nameEn: "Shenyang Red Cross Hospital",
        namePinyin: "Shěnyáng Shì Hóng Shízìhuì Yīyuàn",
        latitude: 41.797000,
        longitude: 123.431700,
        type: "general",
    },
    {
        name: "沈阳市中医院",
        nameEn: "Shenyang Hospital of Traditional Chinese Medicine",
        namePinyin: "Shěnyáng Shì Zhōngyīyuàn",
        latitude: 41.772366,
        longitude: 123.422640,
        type: "traditional_chinese_medicine",
    },
    {
        name: "沈阳市骨科医院",
        nameEn: "Shenyang Orthopedic Hospital",
        namePinyin: "Shěnyáng Shì Gǔkē Yīyuàn",
        latitude: 41.818449,
        longitude: 123.477362,
        type: "orthopedics",
    },
    {
        name: "沈阳市精神卫生中心",
        nameEn: "Shenyang Mental Health Center",
        namePinyin: "Shěnyáng Shì Jīngshén Wèishēng Zhōngxīn",
        latitude: 41.739350,
        longitude: 123.487120,
        type: "mental_health_specialty",
        services: ["psychiatry", "psychology"],
        department: "Psychiatry — Inpatient, Outpatient & Crisis Intervention",
        specialty:
            "Shenyang's dedicated public psychiatric hospital — psychiatric diagnosis, medication management, therapy, and inpatient mental health treatment",
    },
    {
        name: "沈阳二四二医院",
        nameEn: "Shenyang 242 Hospital",
        namePinyin: "Shěnyáng Èrsìèr Yīyuàn",
        latitude: 41.863140,
        longitude: 123.416300,
        type: "general",
    },
    {
        name: "沈阳市苏家屯区中心医院",
        nameEn: "Sujiatun District Central Hospital, Shenyang",
        namePinyin: "Shěnyáng Shì Sūjiātún Qū Zhōngxīn Yīyuàn",
        latitude: 41.661790,
        longitude: 123.340880,
        type: "general",
    },
];

async function main() {
    const namesToClear = [
        "Shenyang Mental Health Center", // the original generic placeholder
        ...SHENYANG_HOSPITALS.map((h) => h.name),
    ];

    console.log("Removing any existing rows with these names (placeholder + this list)...");
    const removed = await db
        .delete(hospitalsTable)
        .where(inArray(hospitalsTable.name, namesToClear))
        .returning({ id: hospitalsTable.id });
    console.log(`Removed ${removed.length} row(s).`);

    console.log(`Inserting ${SHENYANG_HOSPITALS.length} real Shenyang hospitals...`);
    const inserted = await db
        .insert(hospitalsTable)
        .values(
            SHENYANG_HOSPITALS.map((hospital) => ({
                name: hospital.name,
                nameEn: hospital.nameEn,
                namePinyin: hospital.namePinyin,
                city: "Shenyang",
                district: null,
                department: hospital.department ?? TYPE_DEPARTMENT_DEFAULTS[hospital.type].department,
                specialty: hospital.specialty ?? TYPE_DEPARTMENT_DEFAULTS[hospital.type].specialty,
                address: null,
                addressEn: null,
                phone: null,
                website: null,
                verified: "needs verification",
                // Not a new guess - this just states the same reality the
                // legacy `verified` field above already recorded ("needs
                // verification") in the new three-state field instead.
                // None of these 23 have been individually checked yet, so
                // none get upgraded to "partial" or "verified" here.
                verificationStatus: "unverified",
                type: hospital.type,
                services: hospital.services ?? [],
                latitude: hospital.latitude,
                longitude: hospital.longitude,
                isActive: true,
            }))
        )
        .returning({ id: hospitalsTable.id, name: hospitalsTable.name });

    inserted.forEach((row) => console.log(`  [${row.id}] ${row.name}`));
    console.log(`\nDone. Inserted ${inserted.length} hospital(s).`);
    await client.end();
}

main().catch((error) => {
    console.error("Seeding Shenyang hospitals failed:", error);
    process.exit(1);
});
