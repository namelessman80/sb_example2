/*
  DATA ONLY - no map code, no distance math, no markers, no reverse
  geocoding lives in this file. Its only job is to describe "what
  hospitals exist" as plain data; map.js's job is "how to draw a map."
  Keeping them apart means either one can be read or edited without
  needing to understand the other.

  Every entry uses WGS84 coordinates - ordinary GPS latitude/longitude,
  the same coordinate system this Leaflet/OpenStreetMap prototype already
  uses. That's what the coordinateSystem field records. This matters for
  later: Baidu Maps expects a DIFFERENT coordinate system (BD-09), so
  these coordinates would need converting before they'd land correctly on
  a Baidu map - see this project's README for more on that.

  This is a plain <script> file (no import/export, no "module" system) -
  it just declares one global variable, `hospitals`, that any other
  plain <script> loaded AFTER this one (like map.js) can read directly.
*/

const hospitals = [
    {
        // English: The First Affiliated Hospital of China Medical University
        name: "中国医科大学附属第一医院",
        address: null, // not provided yet - can be filled in later
        latitude: 41.792898,
        longitude: 123.405202,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
    },
    {
        // English: Shengjing Hospital of China Medical University, Nanhu Campus
        name: "中国医科大学附属盛京医院南湖院区",
        address: null,
        latitude: 41.770663,
        longitude: 123.420123,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
    },
    {
        // English: Liaoning Provincial People's Hospital
        name: "辽宁省人民医院",
        address: null,
        latitude: 41.773602,
        longitude: 123.447294,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
    },
    {
        // English: Central Hospital Affiliated to Shenyang Medical College
        name: "沈阳医学院附属中心医院",
        address: null,
        latitude: 41.798450,
        longitude: 123.341010,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
    },
    {
        // English: Shenyang First People's Hospital
        name: "沈阳市第一人民医院",
        address: null,
        latitude: 41.813336,
        longitude: 123.459142,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
    },
    {
        // English: Shenyang Fourth People's Hospital
        name: "沈阳市第四人民医院",
        address: null,
        latitude: 41.817997,
        longitude: 123.414230,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
    },
    {
        // English: Shenyang Sixth People's Hospital
        name: "沈阳市第六人民医院",
        address: null,
        latitude: 41.769585,
        longitude: 123.395452,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
    },
    {
        // English: Shenyang Tenth People's Hospital
        name: "沈阳市第十人民医院",
        address: null,
        latitude: 41.828452,
        longitude: 123.466407,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
    },
    {
        // English: Shenyang Children's Hospital
        name: "沈阳市儿童医院",
        address: null,
        latitude: 41.830970,
        longitude: 123.428470,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
    },
    {
        // English: Shenyang Women's and Children's Hospital
        name: "沈阳市妇婴医院",
        address: null,
        latitude: 41.786216,
        longitude: 123.454707,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
    },

    // ------------------------------------------------------------
    // Added later: 20 more hospital/campus locations. Each includes a
    // `services` field the first 10 above don't have yet - an empty
    // array on every one of these, on purpose: nobody has verified which
    // services each of these actually offers yet, so this is left empty
    // rather than guessed. Fill it in only once you have real, confirmed
    // information for a given hospital.
    // ------------------------------------------------------------
    {
        // English: Stomatological Hospital of China Medical University (Main Campus)
        name: "中国医科大学附属口腔医院（总院）",
        address: null,
        latitude: 41.795699,
        longitude: 123.406186,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Liaoning Jinqiu Hospital
        name: "辽宁省金秋医院",
        address: null,
        latitude: 41.772623,
        longitude: 123.445531,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: The Fourth Affiliated Hospital of Liaoning University of Traditional Chinese Medicine
        name: "辽宁中医药大学附属第四医院",
        address: null,
        latitude: 41.662976,
        longitude: 123.339816,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Shenyang Stomatological Hospital
        name: "沈阳市口腔医院",
        address: null,
        latitude: 41.795962,
        longitude: 123.409644,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Shenyang Anorectal Hospital
        name: "沈阳市肛肠医院",
        address: null,
        latitude: 41.810217,
        longitude: 123.415646,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Liaoning Maternal and Child Health Hospital
        name: "辽宁省妇幼保健院",
        address: null,
        latitude: 41.766690,
        longitude: 123.387749,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Liaoning Electric Power Central Hospital
        name: "辽宁电力中心医院",
        address: null,
        latitude: 41.765801,
        longitude: 123.399871,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Tiexi District Central Hospital
        name: "铁西区中心医院",
        address: null,
        latitude: 41.787595,
        longitude: 123.369984,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Huanggu District Central Hospital
        name: "皇姑区中心医院",
        address: null,
        latitude: 41.819226,
        longitude: 123.395049,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Shenyang Deji Hospital
        name: "沈阳德济医院",
        address: null,
        latitude: 41.797803,
        longitude: 123.479279,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Shenyang Hunnan District Hospital
        name: "沈阳市浑南区医院",
        address: null,
        latitude: 41.725839,
        longitude: 123.443245,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Shenyang Shenhe District People's Hospital
        name: "沈阳市沈河区人民医院",
        address: null,
        latitude: 41.793658,
        longitude: 123.447060,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Xinmin City People's Hospital
        name: "新民市人民医院",
        address: null,
        latitude: 41.994293,
        longitude: 122.816434,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Shenyang Liaozhong District People's Hospital
        name: "沈阳市辽中区人民医院",
        address: null,
        latitude: 41.504274,
        longitude: 122.729549,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Shenyang Stomatological Hospital, Hunnan Campus
        name: "沈阳市口腔医院浑南院区",
        address: null,
        latitude: 41.720164,
        longitude: 123.448565,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Stomatological Hospital of China Medical University, South Campus
        name: "中国医科大学附属口腔医院南院区",
        address: null,
        latitude: 41.789274,
        longitude: 123.406456,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Shenyang Jishuitan Hospital
        name: "沈阳积水潭医院",
        address: null,
        latitude: 41.727940,
        longitude: 123.251680,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Shengjing Hospital of China Medical University, Huaxiang Campus
        name: "中国医科大学附属盛京医院滑翔院区",
        address: null,
        latitude: 41.770770,
        longitude: 123.355780,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Shengjing Hospital of China Medical University, Shenbei Campus
        name: "中国医科大学附属盛京医院沈北院区",
        address: null,
        latitude: 41.945000,
        longitude: 123.398090,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
    {
        // English: Hunnan District Central Hospital
        name: "浑南区中心医院",
        address: null,
        latitude: 41.771960,
        longitude: 123.472770,
        coordinateSystem: "WGS84",
        source: "manually entered by project owner",
        services: [],
    },
];
