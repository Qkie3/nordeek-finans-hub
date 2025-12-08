export type NewsItem = {
  id: string;
  headline: string;
  source: string;
  url: string;
  datetime: number; // epoch seconds
  summary?: string;
};

const ENABLED = String(import.meta.env.VITE_USE_NEWSAPI_AI || "false") === "true";
/** Dev-proxy: Vite videresender /er → https://eventregistry.org */
const API_URL = `/er/api/v1/article/getArticles`;

function withTimeout<T>(p: Promise<T>, ms = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`news timeout ${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

async function erRequest(body: Record<string, unknown>) {
  const apiKey = import.meta.env.VITE_NEWSAPI_AI_KEY as string | undefined;
  if (!ENABLED)  { console.warn("[news] disabled"); return { articles: { results: [] } }; }
  if (!apiKey)   { console.warn("[news] missing VITE_NEWSAPI_AI_KEY"); return { articles: { results: [] } }; }

  const req = fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      apiKey,
      resultType: "articles",
      articlesSortBy: "date",
      articlesCount: 12,
      lang: ["dan","eng"],
    }),
  });

  try {
    const res = await withTimeout(req, 12000);
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      console.error("[news] HTTP", res.status, msg);
      return { articles: { results: [] } };
    }
    const json = await res.json();
    console.debug("[news] ok count:", json?.articles?.results?.length ?? 0);
    return json;
  } catch (e) {
    console.error("[news] fetch error:", e);
    return { articles: { results: [] } };
  }
}

export async function getMarketNews(limit = 10): Promise<NewsItem[]> {
  const data = await erRequest({});
  const results = (data as any)?.articles?.results ?? [];
  return mapArticles(results).slice(0, limit);
}

export async function getCompanyNews(query: string, limit = 10): Promise<NewsItem[]> {
  const q = (query || "").trim();
  if (!q) return [];
  const data = await erRequest({ keyword: q, keywordSearchMode: "simple" });
  const results = (data as any)?.articles?.results ?? [];
  return mapArticles(results).slice(0, limit);
}

function mapArticles(results: any[]): NewsItem[] {
  return (results || []).map((a: any) => ({
    id: String(a.uri || a.url || Math.random().toString(36).slice(2)),
    headline: a.title || a.headline || "Ukendt titel",
    source: a.source?.title || a.source?.uri || "Ukendt kilde",
    url: a.url || "",
    datetime: a.dateTime
      ? Math.floor(new Date(a.dateTime).getTime() / 1000)
      : a.date
      ? Math.floor(new Date(a.date).getTime() / 1000)
      : Math.floor(Date.now() / 1000),
    summary: a.body || a.excerpt || "",
  }));
}
