/**
 * The ~30 major Chinese cities from the original Streamlit prototype's
 * MAJOR_CITY_OPTIONS dropdown. Kept as a hardcoded constant (not derived
 * from `SELECT DISTINCT city`) so the dropdown always offers the same
 * cities regardless of which cities currently have hospital data —
 * preserving the original UX where an empty result is a valid, intentional
 * "early prototype" state.
 */
export const MAJOR_CITY_OPTIONS: string[] = [
    "Beijing",
    "Changchun",
    "Changsha",
    "Chengdu",
    "Chongqing",
    "Dalian",
    "Fuzhou",
    "Guangzhou",
    "Guiyang",
    "Hangzhou",
    "Harbin",
    "Hefei",
    "Jinan",
    "Kunming",
    "Lanzhou",
    "Nanchang",
    "Nanjing",
    "Nanning",
    "Qingdao",
    "Shanghai",
    "Shenyang",
    "Shenzhen",
    "Shijiazhuang",
    "Taiyuan",
    "Tianjin",
    "Urumqi",
    "Wuhan",
    "Xiamen",
    "Xi'an",
    "Zhengzhou",
];
