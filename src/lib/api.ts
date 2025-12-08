/** ===== Types ===== */
export type Sentiment = "bullish" | "bearish" | "neutral";

export interface Article {
  title: string;
  description: string;
  source: string;
  url: string;
  image: string;
  language: string;
  publishedAt: string;
  publishedMs: number;
  country: string;
  company: string | null;
  ticker: string | null;
  domain: string;
  sentiment: Sentiment;
  viaNewsapi?: boolean;
}

export interface NewsError { source: string; error: string; }
export interface NewsResponse {
  articles: Article[];
  count: number;
  lastUpdated: number;
  errors?: NewsError[];
}

export interface EventItem {
  date: string;
  time?: string;
  title: string;
  tickers: string[];
  country: string;
}
export interface EventsResponse {
  events: EventItem[];
  note?: string;
}

export interface IndexPrice {
  price: number;
  prevClose: number;
  changePct: number;
}
export interface PricesResponse {
  prices: Record<string, IndexPrice>;
  source: string;
  note?: string;
}

export interface SummarizePolicy {
  domain: string;
  licensed: boolean;
  knownOpen: boolean;
  optOut: boolean;
}
export type   SummarizeMode = "full" | "short" | "fallback";
export interface SummarizeVariants {
  short_pro?:   { summary: string };
  long_pro?:    { summary: string };
  short_casual?:{ summary: string };
  long_casual?: { summary: string };
}
export interface SummarizeResponse {
  mode: SummarizeMode;
  policy: SummarizePolicy;
  title: string;
  url: string;
  summary: string;
  bullets: string[];
  impacts: string[];
  variants?: SummarizeVariants;
}
export interface SummarizeBatchResponse { items: Record<string, SummarizeResponse>; }
export interface QABody { question: string; url?: string; context?: string; }
export interface QAResponse { answer: string; }

/** ===== Utils ===== */
function domainFromUrl(u: string): string { try { return new URL(u).hostname } catch { return "" } }
function toIso(ms: number) { return new Date(ms).toISOString() }

/** ===== Env (Vite) ===== */
const NEWS_ENABLED = String(import.meta.env.VITE_USE_NEWSAPI_AI || "false") === "true";
const NEWS_API_KEY = import.meta.env.VITE_NEWSAPI_AI_KEY as string | undefined;

/** ===== Alpha cache (localStorage, 60s per symbol) ===== */
type CacheRow = { t: number; v: IndexPrice };
function readCacheAlpha(sym: string): IndexPrice | null {
  try {
    const raw = localStorage.getItem("alpha:" + sym.toUpperCase());
    if (!raw) return null;
    const row = JSON.parse(raw) as CacheRow;
    if (Date.now() - row.t > 60_000) return null; // 60s TTL
    return row.v;
  } catch { return null; }
}
function writeCacheAlpha(sym: string, v: IndexPrice) {
  try {
    const row: CacheRow = { t: Date.now(), v };
    localStorage.setItem("alpha:" + sym.toUpperCase(), JSON.stringify(row));
  } catch {}
}

/** ===== Mappers ===== */
function mapErToArticle(a: any): Article {
  const ms = a?.dateTime ? new Date(a.dateTime).getTime()
         : a?.date ? new Date(a.date).getTime()
         : Date.now();
  const url = a?.url || "";
  return {
    title: a?.title || a?.headline || "Ukendt titel",
    description: a?.body || a?.excerpt || "",
    source: a?.source?.title || a?.source?.uri || "Ukendt kilde",
    url,
    image: a?.image || "",
    language: (Array.isArray(a?.lang) ? a.lang[0] : a?.lang) || "en",
    publishedAt: toIso(ms),
    publishedMs: ms,
    country: a?.location?.country || "",
    company: null,
    ticker: null,
    domain: domainFromUrl(url),
    sentiment: "neutral",
    viaNewsapi: true,
  };
}

/** ===== API: Nyheder via Vite-proxy (/er) ===== */
export async function fetchNews(): Promise<NewsResponse> {
  if (!NEWS_ENABLED || !NEWS_API_KEY) {
    return { articles: [], count: 0, lastUpdated: Date.now(), errors: [{ source: "eventregistry", error: "missing-key-or-disabled" }] };
  }
  const res = await fetch('/er/api/v1/article/getArticles', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: NEWS_API_KEY,
      resultType: "articles",
      articlesSortBy: "date",
      articlesCount: 50,
      lang: ["dan", "eng"],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { articles: [], count: 0, lastUpdated: Date.now(), errors: [{ source: "eventregistry", error: `HTTP ${res.status} ${text}` }] };
  }
  const json = await res.json().catch(() => ({} as any));
  const results = (json?.articles?.results ?? []) as any[];
  const articles = results.map(mapErToArticle);
  return { articles, count: articles.length, lastUpdated: Date.now() };
}

/** ===== API: Events (stub uden backend) ===== */
export async function fetchEvents(): Promise<EventsResponse> {
  return { events: [], note: "no-backend; events disabled" };
}

/** ===== API: Priser (Alpha Vantage live + 60s cache) ===== */
export async function fetchPrices(tickers: readonly string[] | string[]): Promise<PricesResponse> {
  const key = import.meta.env.VITE_ALPHA_VANTAGE_KEY as string | undefined;
  const list = Array.isArray(tickers) ? tickers : String(tickers).split(",").map(s => s.trim()).filter(Boolean);
  const prices: Record<string, IndexPrice> = {};

  if (!key || !list.length) {
    for (const t of list) { prices[t.toUpperCase()] = { price: 0, prevClose: 0, changePct: 0 }; }
    return { prices, source: key ? "alphavantage" : "mock", note: key ? "no-tickers" : "missing-alpha-key" };
  }

  for (const raw of list) {
    const sym = raw.toUpperCase();
    const cached = readCacheAlpha(sym);
    if (cached) { prices[sym] = cached; continue; }

    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(sym)}&apikey=${key}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const q = j["Global Quote"] || {};
      const price = Number.parseFloat(q["05. price"] || "0") || 0;
      const prev  = Number.parseFloat(q["08. previous close"] || "0") || 0;
      let changePct = 0;
      if (q["10. change percent"]) {
        changePct = Number.parseFloat(String(q["10. change percent"]).replace("%","")) / 100;
      } else if (price && prev) {
        changePct = prev ? (price - prev) / prev : 0;
      }
      const row: IndexPrice = { price, prevClose: prev, changePct };
      prices[sym] = row;
      writeCacheAlpha(sym, row);
      await new Promise(r => setTimeout(r, 150)); // mild throttle
    } catch {
      prices[sym] = { price: 0, prevClose: 0, changePct: 0 };
    }
  }

  return { prices, source: "alphavantage" };
}

/** ===== Stubs (summarize/Q&A) så UI ikke knækker ===== */
export async function summarizeUrl(url: string, length: "short" | "long", tone: "pro" | "casual"): Promise<SummarizeResponse> {
  return {
    mode: "fallback",
    policy: { domain: domainFromUrl(url), licensed: false, knownOpen: false, optOut: false },
    title: "Opsummering ikke aktiv i dev",
    url,
    summary: "Server-funktioner er ikke slået til i dette dev-setup.",
    bullets: [], impacts: [],
  };
}
export async function summarizeBatch(urls: string[], length: "short" | "long", tone: "pro" | "casual"): Promise<SummarizeBatchResponse> {
  const out: Record<string, SummarizeResponse> = {};
  for (const u of urls) out[u] = await summarizeUrl(u, length, tone);
  return { items: out };
}
export async function askMarketEffect(payload: QABody): Promise<QAResponse> {
  return { answer: "AI Q&A er deaktiveret i dette dev-setup." };
}
