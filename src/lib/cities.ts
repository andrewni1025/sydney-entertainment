export interface CityConfig {
  id: string;
  name: string;
  nameZh?: string;
  emoji: string;
  latitude: number;
  longitude: number;
  timezone: string;
  wttrName: string;
  country: string;
  locale: "en" | "zh";
  tagline: string;
  description: string;
  accentColor: string;
  areas: { value: string; label: string }[];
  /** "cinema" for Sydney-style night out, "culture" for CN-style going out */
  goingOutMode: "cinema" | "culture";
}

export const cities: Record<string, CityConfig> = {
  sydney: {
    id: "sydney",
    name: "Sydney",
    emoji: "🌉",
    latitude: -33.87,
    longitude: 151.21,
    timezone: "Australia/Sydney",
    wttrName: "Sydney",
    country: "AU",
    locale: "en",
    tagline: "Harbour city cinema & streaming guide",
    description: "From the golden age cinemas of Cremorne to IMAX blockbusters in the CBD — your curated guide to Sydney's screen culture and what to stream tonight.",
    accentColor: "#e4b84e",
    goingOutMode: "cinema",
    areas: [
      { value: "all", label: "Anywhere" },
      { value: "cbd", label: "CBD" },
      { value: "inner-west", label: "Inner West" },
      { value: "east", label: "Eastern" },
      { value: "north-shore", label: "North Shore" },
    ],
  },
  shanghai: {
    id: "shanghai",
    name: "Shanghai",
    nameZh: "上海",
    emoji: "🏙️",
    latitude: 31.23,
    longitude: 121.47,
    timezone: "Asia/Shanghai",
    wttrName: "Shanghai",
    country: "CN",
    locale: "zh",
    tagline: "魔都文化生活指南",
    description: "从外滩美术馆到浦东的teamLab，从话剧艺术中心到深夜电影——上海的文化夜生活，一站掌握。",
    accentColor: "#f43f5e",
    goingOutMode: "culture",
    areas: [
      { value: "all", label: "全部" },
      { value: "puxi", label: "浦西" },
      { value: "pudong", label: "浦东" },
      { value: "xuhui", label: "徐汇" },
      { value: "jing-an", label: "静安" },
    ],
  },
  suzhou: {
    id: "suzhou",
    name: "Suzhou",
    nameZh: "苏州",
    emoji: "🏯",
    latitude: 31.30,
    longitude: 120.62,
    timezone: "Asia/Shanghai",
    wttrName: "Suzhou",
    country: "CN",
    locale: "zh",
    tagline: "园林古城的文艺日常",
    description: "两千五百年的园林古城，从苏州博物馆到平江路昆曲茶馆——在这里，文化是一种生活方式。",
    accentColor: "#10b981",
    goingOutMode: "culture",
    areas: [
      { value: "all", label: "全部" },
      { value: "gusu", label: "姑苏区" },
      { value: "sip", label: "园区" },
      { value: "snd", label: "新区" },
      { value: "wuzhong", label: "吴中区" },
    ],
  },
  changzhou: {
    id: "changzhou",
    name: "Changzhou",
    nameZh: "常州",
    emoji: "🎢",
    latitude: 31.81,
    longitude: 119.97,
    timezone: "Asia/Shanghai",
    wttrName: "Changzhou",
    country: "CN",
    locale: "zh",
    tagline: "龙城新潮文化地图",
    description: "恐龙园之外的常州——从青果巷到运河边的创意园区，发现这座龙城的另一面。",
    accentColor: "#8b5cf6",
    goingOutMode: "culture",
    areas: [
      { value: "all", label: "全部" },
      { value: "tianning", label: "天宁区" },
      { value: "zhonglou", label: "钟楼区" },
      { value: "xinbei", label: "新北区" },
      { value: "wujin", label: "武进区" },
    ],
  },
};

export const cityList = Object.values(cities);
export const defaultCity = cities.sydney;
