export type ArticleIn = { id: string; title?: string; summary?: string; body?: string; url?: string; publishedMs?: number };
export type RankItem = { id: string; score: number; reason?: string; rejected?: boolean };

export async function rankArticlesAI(
  articles: ArticleIn[],
  timeoutMs = 9000
): Promise<{ orderedIds: string[]; rejects: string[]; reasons: Record<string,string> }> {
  if (!articles.length) return { orderedIds: [], rejects: [], reasons: {} };

  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const payload = {
      articles: articles.map(a => ({
        id: a.id,
        title: a.title,
        body: a.summary || a.body || "",
        url: a.url,
        publishedMs: a.publishedMs ?? Date.now()
      }))
    };

    const r = await fetch("/api/rank-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify(payload),
    });
    clearTimeout(to);

    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    const ranking: RankItem[] = Array.isArray(j.ranking) ? j.ranking : [];
    const rejects: RankItem[] = Array.isArray(j.rejects) ? j.rejects : [];

    const orderedIds = ranking.map(x => String(x.id));
    const rejectIds  = rejects.map(x => String(x.id));
    const reasons: Record<string,string> = {};
    for (const x of ranking) reasons[x.id] = x.reason || "";
    for (const x of rejects) reasons[x.id] = x.reason || reasons[x.id] || "";

    return { orderedIds, rejects: rejectIds, reasons };
  } catch {
    clearTimeout(to);
    return { orderedIds: articles.map(a => a.id), rejects: [], reasons: {} };
  }
}
