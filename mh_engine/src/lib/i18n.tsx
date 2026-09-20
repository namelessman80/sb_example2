import * as React from "react";

export type Lang = "en" | "zh";

/**
 * All translatable UI text for the check-in / hospital-navigation flow.
 * Deliberately plain strings (not JSX) so this file stays simple data,
 * not logic - components decide how to render them. `{placeholders}`
 * inside a string are filled in with `format()` below.
 *
 * Scope: this covers the Home page and everything under it (check-in,
 * results, hospital navigation/map/cards). The Feedback page is
 * out of scope for now and stays English-only.
 *
 * NOT covered here: the AI-generated check-in result content itself
 * (category name, relatesTo, supportType, seekProfessionalWhen,
 * gentleSuggestion) - that text comes from the backend's categories
 * table, which only has English content today. Translating that would
 * mean adding Chinese content to the database, not just this file.
 */
export interface Translations {
    // Home.tsx
    titleRefreshHint: string;
    footerThemes: string;
    footerPrototype: string;
    resultsHeading: string;
    resultsSummary: string; // uses {n}
    crisisNote: string;

    // CheckinForm.tsx
    checkinCategoriesLabel: string;
    categoryStress: string;
    categorySleep: string;
    categoryLowMood: string;
    categoryAnxiety: string;
    categoryFocus: string;
    categoryAnger: string;
    categoryPanic: string;
    categoryLoneliness: string;
    categoryRelationship: string;
    categorySchoolWork: string;
    categoryGrief: string;
    categoryOther: string;
    checkinSelectedPrefix: string;
    checkinQuickAnalyze: string;
    checkinQuickAnalyzeEmptyWarning: string;
    checkinDescribeLabel: string;
    checkinPlaceholder: string;
    checkinEmptyWarning: string;
    checkinErrorToast: string;
    checkinAnalyzeAria: string;

    // HospitalNavigation.tsx
    hospitalNavHeading: string;
    hospitalNavDescription: string; // uses {categories}

    // NearMeHospitals.tsx
    nearbyDisclaimer: string;
    nearbyCountFound: string; // uses {n}
    nearbyNoneFound: string;
    nearbyMatchedHeading: string; // uses {n}
    nearbyMatchedNone: string;
    nearbyOtherHeading: string;
    nearbyOtherNote: string;

    // LocationPicker.tsx
    locatorHint: string;
    locatorSelectedPrefix: string;
    locatorLookingUpAddress: string;
    locatorAddressNotFoundInline: string;
    locatorUseMyLocation: string;
    locatorEnterAddress: string;
    locatorEnterCoordinates: string;
    locatorGpsDenied: string;
    locatorGpsUnsupported: string;
    locatorGpsError: string;
    locatorAddressRequired: string;
    locatorAddressLabel: string;
    locatorAddressPlaceholder: string;
    locatorFind: string;
    locatorLatLabel: string;
    locatorLngLabel: string;
    locatorCoordExamplePrefix: string; // e.g. "e.g." / "例如" - prefixes the example lat/lng placeholders
    locatorAddressNotFoundError: string;
    locatorAddressLookupFailed: string;
    locatorInvalidCoords: string;
    locatorDestinationLabel: string;
    locatorDisplacementTo: string; // uses {name} and {km}
    locatorClearDestination: string;

    // HospitalCard.tsx
    cardCity: string;
    cardDistrict: string;
    cardDepartment: string;
    cardSpecialty: string;
    cardAddress: string;
    cardPhone: string;
    cardWebsite: string;
    cardNeedsVerification: string;
    cardServiceInfoIncomplete: string;
    cardDataStatus: string;
    cardDistanceAway: string; // uses {km}
    cardShowOnMapHint: string;

    // CategoryResultCard.tsx (wrapper text only - not the AI content itself)
    resultCardGeneralInfoNote: string;
    resultCardRelatesToHeading: string;
    resultCardRelatesToIntro: string;
    resultCardSupportTypeHeading: string;
    resultCardSeekHelpHeading: string;
    resultCardSeekHelpIntro: string;
    resultCardSelfCareToggle: string;
}

const en: Translations = {
    titleRefreshHint: "Refresh",
    footerThemes: "Emotional Check-in · Broad Themes · Hospital Suggestions",
    footerPrototype: "Prototype project for educational and research purposes only.",
    resultsHeading: "📋 Your results",
    resultsSummary:
        "Based on your words, we noticed {n} broad theme(s). The cards below offer general ideas only—they do not diagnose any condition.",
    crisisNote:
        "If you are in crisis or need urgent help, contact local emergency services or a crisis helpline in your area.",

    checkinCategoriesLabel: "How are you feeling?",
    categoryStress: "Stress / Overwhelmed",
    categorySleep: "Sleep Problems",
    categoryLowMood: "Low Mood / Sadness",
    categoryAnxiety: "Anxiety / Worry",
    categoryFocus: "Focus / Motivation",
    categoryAnger: "Anger / Irritability",
    categoryPanic: "Panic / Feeling on Edge",
    categoryLoneliness: "Loneliness / Isolation",
    categoryRelationship: "Relationship / Family Problems",
    categorySchoolWork: "School / Work Pressure",
    categoryGrief: "Grief / Loss",
    categoryOther: "Other / Not Sure",
    checkinSelectedPrefix: "Selected: ",
    checkinQuickAnalyze: "Quick Analysis",
    checkinQuickAnalyzeEmptyWarning: "Please select at least one category first.",
    checkinDescribeLabel:
        "Describe your situation in your own words (optional). There are no right or wrong answers.",
    checkinPlaceholder: "Example: I've been very stressed and not sleeping well...",
    checkinEmptyWarning: "Please describe how you feel before analyzing.",
    checkinErrorToast: "Could not analyze your check-in. Please try again.",
    checkinAnalyzeAria: "Analyze",

    hospitalNavHeading: "🏥 Hospital & service navigation",
    hospitalNavDescription:
        "Based on your check-in ({categories}), you can browse sample hospitals below — this prototype currently only covers Shenyang. Set your location on the map to see hospitals near you.",

    nearbyDisclaimer:
        "Hospital information shown below is provided for educational and prototype purposes only. Information may be incomplete, outdated, or require verification from official hospital sources before use. This prototype does not recommend or endorse any specific hospital, clinician, or treatment. Distances are approximate straight-line distances, not driving directions.",
    nearbyCountFound: "{n} hospital(s) found near you",
    nearbyNoneFound:
        "No hospitals with location data were found near you yet. This is an early prototype — the hospital database is still being expanded.",
    nearbyMatchedHeading: "{n} hospital(s) matching your selection",
    nearbyMatchedNone:
        "No hospitals have verified services matching your selection yet — see other nearby hospitals below.",
    nearbyOtherHeading: "Other nearby hospitals",
    nearbyOtherNote:
        "These haven't been verified for the categories you selected, but may still be worth checking.",

    locatorHint:
        "Click anywhere on the map, use your current location, or type an address or coordinates below to set where you are.",
    locatorSelectedPrefix: "Selected:",
    locatorLookingUpAddress: "looking up address...",
    locatorAddressNotFoundInline: "Address not found for this location.",
    locatorUseMyLocation: "Use my location",
    locatorEnterAddress: "Enter address",
    locatorEnterCoordinates: "Enter coordinates",
    locatorGpsDenied:
        "Location access was denied. You can allow it from your browser's site settings, or use the address/coordinate options instead.",
    locatorGpsUnsupported:
        "Your browser doesn't support location sharing. Please use the address/coordinate options instead.",
    locatorGpsError:
        "Could not determine your location. Please try again, or use the address/coordinate options instead.",
    locatorAddressRequired: "Please enter an address.",
    locatorAddressLabel: "Address",
    locatorAddressPlaceholder: "e.g. Shenyang Railway Station",
    locatorFind: "Find",
    locatorLatLabel: "Latitude",
    locatorLngLabel: "Longitude",
    locatorCoordExamplePrefix: "e.g.",
    locatorAddressNotFoundError:
        "Couldn't find that address. Try adding more detail (district, city).",
    locatorAddressLookupFailed: "Address lookup failed. Please try again.",
    locatorInvalidCoords:
        "Please enter a valid latitude (-90 to 90) and longitude (-180 to 180).",
    locatorDestinationLabel: "Destination",
    locatorDisplacementTo: "Displacement to {name}: {km} km (straight-line distance)",
    locatorClearDestination: "Clear",

    cardCity: "City",
    cardDistrict: "District",
    cardDepartment: "Department",
    cardSpecialty: "Specialty",
    cardAddress: "Address",
    cardPhone: "Phone",
    cardWebsite: "Website",
    cardNeedsVerification: "⚠️ Needs Verification",
    cardServiceInfoIncomplete: "Service info incomplete",
    cardDataStatus: "Data status: ",
    cardDistanceAway: "{km} km away",
    cardShowOnMapHint: "Click to show on map",

    resultCardGeneralInfoNote:
        "General information based on keywords in your message—not a diagnosis.",
    resultCardRelatesToHeading: "What this concern may relate to",
    resultCardRelatesToIntro: "People who mention similar feelings often talk about things like:",
    resultCardSupportTypeHeading: "Suggested support type",
    resultCardSeekHelpHeading: "When you may consider seeking professional help",
    resultCardSeekHelpIntro:
        "You might consider speaking with a counselor, doctor, or other trained professional if:",
    resultCardSelfCareToggle: "Optional: gentle self-care idea",
};

const zh: Translations = {
    titleRefreshHint: "刷新",
    footerThemes: "情绪打卡 · 宽泛主题 · 医院建议",
    footerPrototype: "本原型项目仅用于教育和研究目的。",
    resultsHeading: "📋 你的结果",
    resultsSummary:
        "根据你的描述,我们注意到了 {n} 个宽泛的主题。以下卡片仅提供一般性建议——并不会诊断任何病症。",
    crisisNote: "如果你正处于危机中或需要紧急帮助,请联系当地的紧急服务或危机求助热线。",

    checkinCategoriesLabel: "你现在感觉怎么样?",
    categoryStress: "压力 / 难以承受",
    categorySleep: "睡眠问题",
    categoryLowMood: "情绪低落 / 悲伤",
    categoryAnxiety: "焦虑 / 担忧",
    categoryFocus: "专注力 / 动力",
    categoryAnger: "愤怒 / 易怒",
    categoryPanic: "恐慌 / 紧张不安",
    categoryLoneliness: "孤独 / 孤立",
    categoryRelationship: "人际关系 / 家庭问题",
    categorySchoolWork: "学业 / 工作压力",
    categoryGrief: "丧失 / 哀伤",
    categoryOther: "其他 / 不确定",
    checkinSelectedPrefix: "已选择:",
    checkinQuickAnalyze: "快速分析",
    checkinQuickAnalyzeEmptyWarning: "请先至少选择一个类别。",
    checkinDescribeLabel: "用你自己的话描述你的情况(可选)。没有对错之分。",
    checkinPlaceholder: "例如:我最近压力很大,睡眠也不好……",
    checkinEmptyWarning: "请在分析前描述一下你的感受。",
    checkinErrorToast: "无法分析你的打卡内容,请重试。",
    checkinAnalyzeAria: "分析",

    hospitalNavHeading: "🏥 医院与服务导航",
    hospitalNavDescription:
        "根据你的打卡结果({categories}),你可以在下方浏览示例医院——本原型目前仅覆盖沈阳。请在地图上设置你的位置,以查看附近的医院。",

    nearbyDisclaimer:
        "以下医院信息仅用于教育和原型演示目的。信息可能不完整、已过时,使用前请通过医院官方渠道核实。本原型不推荐或认可任何特定医院、医生或治疗方式。距离为近似直线距离,并非驾车路线。",
    nearbyCountFound: "在你附近找到 {n} 家医院",
    nearbyNoneFound: "目前附近还没有找到有位置信息的医院。这是一个早期原型——医院数据库仍在不断完善中。",
    nearbyMatchedHeading: "找到 {n} 家符合你所选类别的医院",
    nearbyMatchedNone: "目前还没有医院被核实提供符合你所选类别的服务——请看下方附近的其他医院。",
    nearbyOtherHeading: "附近其他医院",
    nearbyOtherNote: "这些医院尚未针对你所选的类别进行核实,但仍可能值得了解。",

    locatorHint: "点击地图任意位置、使用你当前的位置,或在下方输入地址或坐标来设置你的位置。",
    locatorSelectedPrefix: "已选位置:",
    locatorLookingUpAddress: "正在查询地址……",
    locatorAddressNotFoundInline: "未找到该位置的地址信息。",
    locatorUseMyLocation: "使用我的位置",
    locatorEnterAddress: "输入地址",
    locatorEnterCoordinates: "输入坐标",
    locatorGpsDenied: "位置访问被拒绝。你可以在浏览器的网站设置中允许访问,或改用地址/坐标输入。",
    locatorGpsUnsupported: "你的浏览器不支持位置共享,请改用地址/坐标输入。",
    locatorGpsError: "无法确定你的位置,请重试,或改用地址/坐标输入。",
    locatorAddressRequired: "请输入地址。",
    locatorAddressLabel: "地址",
    locatorAddressPlaceholder: "例如:沈阳站",
    locatorFind: "查找",
    locatorLatLabel: "纬度",
    locatorLngLabel: "经度",
    locatorCoordExamplePrefix: "例如",
    locatorAddressNotFoundError: "未找到该地址,请尝试补充更多信息(区/市)。",
    locatorAddressLookupFailed: "地址查询失败,请重试。",
    locatorInvalidCoords: "请输入有效的纬度(-90 到 90)和经度(-180 到 180)。",
    locatorDestinationLabel: "目的地",
    locatorDisplacementTo: "到{name}的位移:{km} 公里(直线距离)",
    locatorClearDestination: "清除",

    cardCity: "城市",
    cardDistrict: "区/县",
    cardDepartment: "科室",
    cardSpecialty: "专长",
    cardAddress: "地址",
    cardPhone: "电话",
    cardWebsite: "网站",
    cardNeedsVerification: "⚠️ 待核实",
    cardServiceInfoIncomplete: "服务信息不完整",
    cardDataStatus: "数据状态:",
    cardDistanceAway: "{km} 公里",
    cardShowOnMapHint: "点击在地图上显示",

    resultCardGeneralInfoNote: "以下信息基于你留言中的关键词生成——并非诊断。",
    resultCardRelatesToHeading: "该困扰可能与以下方面有关",
    resultCardRelatesToIntro: "有相似感受的人常常会提到这些:",
    resultCardSupportTypeHeading: "建议的支持方式",
    resultCardSeekHelpHeading: "何时可以考虑寻求专业帮助",
    resultCardSeekHelpIntro: "如果出现以下情况,你可以考虑与心理咨询师、医生或其他专业人士谈谈:",
    resultCardSelfCareToggle: "可选:温和的自我照顾建议",
};

const dictionaries: Record<Lang, Translations> = { en, zh };

/** Replaces `{key}` placeholders in a template string with `vars[key]`. */
export function format(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) =>
        key in vars ? String(vars[key]) : match
    );
}

const LanguageContext = React.createContext<{
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: Translations;
} | null>(null);

const STORAGE_KEY = "mh_engine_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = React.useState<Lang>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored === "en" || stored === "zh" ? stored : "en";
        } catch {
            return "en";
        }
    });

    const setLang = React.useCallback((next: Lang) => {
        setLangState(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // localStorage can throw in private browsing / disabled-storage
            // contexts - the toggle still works for this session either way.
        }
    }, []);

    const value = React.useMemo(() => ({ lang, setLang, t: dictionaries[lang] }), [lang, setLang]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = React.useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
