import topMovies from "@/data/top-movies.json";
import type { CityWeather, TimeOfDay } from "./weather";

export interface TopMovie {
  id: number;
  title: string;
  titleZh?: string;
  overview: string;
  overviewZh?: string;
  posterPath: string | null;
  releaseDate: string;
  genres: string[];
  language: string;
  imdb: number | null;
  rottenTomatoes: number | null;
  rtFresh: boolean;
  douban: number | null;
  doubanOriginal: number | null;
  providers: number[];
}

// Weather × Time of Day → preferred genres
const weatherGenreMap: Record<string, string[]> = {
  rain_night: ["Drama", "Romance", "Crime", "Mystery"],
  rain_dawn: ["Drama", "Romance", "Fantasy"],
  rain_day: ["Drama", "Mystery", "Thriller"],
  rain_dusk: ["Drama", "Romance", "Crime"],
  storm_night: ["Thriller", "Action", "Science Fiction", "Horror"],
  storm_dawn: ["Action", "Thriller", "Drama"],
  storm_day: ["Action", "Adventure", "Science Fiction"],
  storm_dusk: ["Thriller", "Drama", "Crime"],
  clear_night: ["Romance", "Science Fiction", "Drama", "Fantasy"],
  clear_dawn: ["Adventure", "Fantasy", "Animation"],
  clear_day: ["Comedy", "Adventure", "Animation", "Action"],
  clear_dusk: ["Romance", "Drama", "Fantasy"],
  cloud_night: ["Drama", "Mystery", "Crime"],
  cloud_dawn: ["Drama", "Fantasy", "Adventure"],
  cloud_day: ["Drama", "Comedy", "Documentary"],
  cloud_dusk: ["Drama", "Romance", "Mystery"],
  fog_night: ["Mystery", "Thriller", "Horror"],
  fog_dawn: ["Mystery", "Fantasy", "Drama"],
  fog_day: ["Mystery", "Drama", "Thriller"],
  fog_dusk: ["Mystery", "Drama", "Romance"],
  snow_night: ["Fantasy", "Animation", "Family", "Drama"],
  snow_dawn: ["Fantasy", "Animation", "Adventure"],
  snow_day: ["Animation", "Fantasy", "Comedy", "Adventure"],
  snow_dusk: ["Drama", "Romance", "Family"],
};

// Poetic lines per weather condition
const poeticLinesZh: Record<string, string[]> = {
  rain: [
    "{city}在下雨，让光影陪你到天亮",
    "听着{city}的雨声，看完这一部",
    "雨天和电影，是{city}最温柔的夜",
    "{city}的雨夜，最适合一部好电影",
  ],
  storm: [
    "{city}暴风雨夜，心跳该加速了",
    "窗外电闪雷鸣，屏幕里也不平静",
    "暴风雨中的{city}，需要一部让人屏住呼吸的电影",
  ],
  clear: [
    "今晚{city}的夜色很美，电影也是",
    "{city}万里无云，像一帧完美的画面",
    "{city}天晴了，好天气配好电影",
    "晴夜的{city}，光影与星光同样耀眼",
  ],
  cloud: [
    "{city}多云微凉，窝在家里看电影的天气",
    "阴天的{city}，交给电影来点亮",
    "{city}的天空灰灰的，但电影是彩色的",
  ],
  fog: [
    "雾中的{city}，本身就像一部电影",
    "{city}起雾了，比银幕还梦幻",
    "雾气弥漫的{city}，适合一部让人沉浸的片子",
  ],
  snow: [
    "{city}在下雪，躲进电影的温暖世界",
    "雪天的{city}，一杯热饮一部好片",
    "窗外白雪纷飞，屏幕里的故事正浓",
  ],
};

const poeticLinesJa: Record<string, string[]> = {
  rain: [
    "{city}は雨。映画と過ごす静かな夜",
    "雨音の{city}。スクリーンの中へ",
    "{city}の雨の夜、映画が一番の友達",
  ],
  storm: [
    "{city}に嵐。心を揺さぶる一本を",
    "窓の外は雷、スクリーンの中も嵐",
    "嵐の{city}、息を呑む映画を",
  ],
  clear: [
    "今夜の{city}は美しい。映画も美しい",
    "{city}の澄んだ夜空、映画の光と共に",
    "晴れた{city}の夜。完璧な映画日和",
  ],
  cloud: [
    "曇りの{city}。映画で彩りを",
    "{city}の空はグレー、でも映画はカラフル",
    "曇り空の{city}、映画に包まれる夜",
  ],
  fog: [
    "霧の{city}、まるで映画のセット",
    "{city}に霧。現実と映画が交差する",
    "霧に包まれた{city}、幻想的な一夜を",
  ],
  snow: [
    "{city}は雪。温かい映画の世界へ",
    "雪の{city}、ホットドリンクと映画を",
    "窓の外は白銀、スクリーンの中は物語",
  ],
};

const poeticLinesEn: Record<string, string[]> = {
  rain: [
    "Rain in {city} — let cinema keep you company",
    "Listening to the rain in {city}. Watching a film. Perfect.",
    "{city} is raining. Time for a movie.",
  ],
  storm: [
    "A storm over {city}. Time for something intense.",
    "Thunder outside, cinema inside.",
    "The storm rages in {city} — and on screen.",
  ],
  clear: [
    "Clear skies over {city}. A perfect night for film.",
    "The stars are out in {city}. So is a great movie.",
    "{city} tonight — beautiful out there, beautiful in here.",
  ],
  cloud: [
    "Overcast {city}. Perfect movie weather.",
    "Grey skies in {city}. Let cinema bring the colour.",
    "A cloudy {city} evening. Just you and a great film.",
  ],
  fog: [
    "Fog over {city}. The city looks like a film set.",
    "{city} in the mist. Reality meets cinema.",
    "Misty {city} — even the air feels cinematic.",
  ],
  snow: [
    "Snow falling in {city}. Time for something warm.",
    "A snowy {city}. Stay in, press play.",
    "White skies over {city}. A cozy night for film.",
  ],
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/**
 * Pick a movie based on weather + time of day + date.
 * Returns a deterministic-per-day result for a given weather/time combo.
 */
// City → language filter strategy
// Sydney: English films, Tokyo: Japanese films
// Shanghai: Douban-weighted best films (any language, shown in Chinese)
const cityLanguageFilter: Record<string, string[] | null> = {
  sydney: ["en"],
  tokyo: ["ja"],
  shanghai: null, // No language filter — pick by Douban score, display in Chinese
};

export function pickWeatherMovie(
  condition: CityWeather["condition"],
  timeOfDay: TimeOfDay,
  isZh: boolean,
  cityId?: string,
  pickIndex: number = 0
): TopMovie | null {
  const key = `${condition}_${timeOfDay}`;
  const preferredGenres = weatherGenreMap[key] ?? weatherGenreMap.clear_night!;
  const langFilter = cityId ? cityLanguageFilter[cityId] ?? null : null;

  // Filter movies: Shanghai allows partial ratings, others need triple
  const allMovies = topMovies as TopMovie[];
  let pool: TopMovie[];

  if (cityId === "shanghai") {
    // Shanghai: must have titleZh + at least one rating, prefer Chinese films
    pool = allMovies.filter(
      (m) => m.titleZh && (m.imdb !== null || m.rottenTomatoes !== null || m.douban !== null)
    );
  } else {
    pool = allMovies.filter(
      (m) => m.imdb !== null && m.rottenTomatoes !== null && m.douban !== null
    );
  }

  // Apply language filter if set
  if (langFilter) {
    pool = pool.filter((m) => langFilter.includes(m.language));
  }

  const currentYear = new Date().getFullYear();

  // Score by genre match + rating quality + strong recency bonus
  const scored = pool.map((m) => {
    const genreMatch = m.genres.some((g) => preferredGenres.includes(g));
    const imdb = m.imdb ?? 0;
    const rt = m.rottenTomatoes ?? 0;
    const douban = m.douban ?? 0;

    // For movies missing some ratings, average only available ones
    const ratings = [m.imdb, m.rottenTomatoes, m.douban].filter((r) => r !== null) as number[];
    const avg = ratings.length > 0
      ? (isZh && m.douban !== null
          ? imdb * 0.3 + rt * 0.3 + douban * 0.4
          : ratings.reduce((a, b) => a + b, 0) / ratings.length)
      : 0;

    // Recency: films from last 15 years get a significant boost
    const year = parseInt(m.releaseDate?.slice(0, 4) ?? "2000");
    const age = currentYear - year;
    const recencyBonus = age <= 5 ? 12 : age <= 10 ? 8 : age <= 15 ? 4 : age <= 20 ? 1 : 0;

    // Classic masterpiece bonus: IMDb + Douban both ≥ 85 = audience-verified classic
    const classicBonus = (imdb >= 85 && douban >= 85) ? 8 : (imdb >= 80 && douban >= 80) ? 4 : 0;

    // Chinese language bonus for Shanghai
    const isChineseFilm = m.language === "zh" || m.language === "cn";
    const langBonus = cityId === "shanghai" && isChineseFilm ? 10 : 0;

    const score = avg + (genreMatch ? 15 : 0) + recencyBonus + classicBonus + langBonus;
    return { movie: m, score };
  });

  scored.sort((a, b) => b.score - a.score);
  // Take top 20 genre-matched candidates
  const candidates = scored.slice(0, 20);
  if (candidates.length === 0) return null;

  // Date + weather + city seed for determinism
  const cityHash = (cityId ?? "").split("").reduce((h, c) => h * 31 + c.charCodeAt(0), 0);
  const seed = dateSeed() + condition.length * 100 + timeOfDay.length * 10 + cityHash;
  let s = seed;
  for (let i = candidates.length - 1; i > 0; i--) {
    s = ((s * 1103515245 + 12345) & 0x7fffffff);
    const j = s % (i + 1);
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  // Pick the Nth candidate (wrapping around)
  const idx = pickIndex % candidates.length;
  return candidates[idx]?.movie ?? null;
}

/**
 * Get a poetic line for the current weather condition and city.
 */
export function getPoetryLine(
  condition: CityWeather["condition"],
  cityName: string,
  locale: "en" | "zh" | "ja"
): string {
  const linesMap = locale === "ja" ? poeticLinesJa : locale === "zh" ? poeticLinesZh : poeticLinesEn;
  const lines = linesMap[condition] ?? linesMap.clear!;

  const seed = dateSeed() + condition.length;
  const idx = Math.floor(seededRandom(seed) * lines.length);
  return (lines[idx] ?? lines[0]!).replace("{city}", cityName);
}

export const GENRE_ZH: Record<string, string> = {
  Action: "动作", Comedy: "喜剧", Romance: "爱情", "Sci-Fi": "科幻",
  "Science Fiction": "科幻", Horror: "恐怖", Thriller: "悬疑", Drama: "剧情",
  Animation: "动画", Documentary: "纪录片", Fantasy: "奇幻",
  Adventure: "冒险", Crime: "犯罪", Mystery: "悬疑", War: "战争",
  Family: "家庭", History: "历史", Music: "音乐", Western: "西部",
};

export const GENRE_JA: Record<string, string> = {
  Action: "アクション", Comedy: "コメディ", Romance: "ロマンス", "Sci-Fi": "SF",
  "Science Fiction": "SF", Horror: "ホラー", Thriller: "スリラー", Drama: "ドラマ",
  Animation: "アニメ", Documentary: "ドキュメンタリー", Fantasy: "ファンタジー",
  Adventure: "アドベンチャー", Crime: "犯罪", Mystery: "ミステリー", War: "戦争",
  Family: "ファミリー", History: "歴史", Music: "音楽", Western: "西部劇",
};
