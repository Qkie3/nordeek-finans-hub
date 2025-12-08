import React, { useEffect, useMemo, useState } from "react";
import { NewsChips } from "./NewsChips";
import type { FilterMode } from "@/lib/news-filter";
import { fallbackSort } from "@/lib/news-filter";
import { rankArticlesAI } from "@/lib/ai-ranker";
import { getMarketNews, getCompanyNews, type NewsItem } from "@/services/news";
import { useWatchlist } from "@/state/watchlist";

type Props = { symbol?: string; initialMode?: FilterMode; showFilters?: boolean };

export default function NewsListAI({ symbol, initialMode = "all", showFilters = true }: Props) {
  const wl = (() => { try { return (useWatchlist?.() || { items: [] }).items as string[] } catch { return [] }})();

  const [mode, setMode] = useState<FilterMode>(initialMode);
  const [raw, setRaw] = useState<NewsItem[]>([]);
  const [ordered, setOrdered] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiUsed, setAiUsed] = useState(false);
  const [reasons, setReasons] = useState<Record<string,string>>({});

  const showReasons = useMemo(() => {
    try { return localStorage.getItem("ai:showReasons") === "1"; } catch { return false; }
  }, [typeof window !== "undefined" && (window as any).localStorage?.getItem?.("ai:showReasons")]);

  // hent nyheder
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = symbol ? await getCompanyNews(symbol, 20) : await getMarketNews(50);
        if (!alive) return;
        setRaw(data);
      } catch {
        if (!alive) return;
        setRaw([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false };
  }, [symbol]);

  // AI-rank + fallback
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!raw.length) { setOrdered([]); return; }
      const articles = raw.map(a => ({
        id: a.id,
        title: a.headline,
        summary: a.summary || "",
        url: a.url,
        publishedMs: a.datetime * 1000,
      }));

      const ai = await rankArticlesAI(articles, 9000);
      if (!alive) return;

      if (ai.orderedIds.length) {
        const map = new Map(raw.map(x => [String(x.id), x]));
        const keep = ai.orderedIds.map(id => map.get(String(id))).filter(Boolean) as NewsItem[];
        const rej  = new Set(ai.rejects || []);
        const final = keep.filter(x => !rej.has(String(x.id)));
        setOrdered(fallbackSort(final, mode, wl));
        setReasons(ai.reasons || {});
        setAiUsed(true);
      } else {
        setOrdered(fallbackSort(raw, mode, wl));
        setReasons({});
        setAiUsed(false);
      }
    })();
    return () => { alive = false };
  }, [raw, mode, wl.join("|")]);

  return (
    <section className="space-y-3">
      {showFilters ? <div className="mb-2"><NewsChips value={mode} onChange={setMode} /></div> : null}
      {loading ? <p className="opacity-80">Henter nyheder…</p>
      : !ordered.length ? <p className="opacity-70">Ingen nyheder fundet.</p>
      : (
        <>
          <div className="text-xs text-muted-foreground flex items-center gap-3">
            <span>{aiUsed ? "AI-rangering" : "Heuristisk rangering"}</span>
          </div>
          <ul className="space-y-3">
            {ordered.map(n => {
              const reason = reasons[String(n.id)] || "";
              return (
                <li key={n.id} className="rounded border p-3" title={showReasons && reason ? reason : undefined}>
                  <a href={n.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                    {n.headline}
                  </a>
                  <div className="text-xs text-muted-foreground">
                    {(n.source || "Kilde ukendt")} • {new Date(n.datetime * 1000).toLocaleString("da-DK")}
                    {showReasons && reason ? <span className="ml-2 opacity-80">(AI: {reason.slice(0,140)}{reason.length>140?"…":""})</span> : null}
                  </div>
                  {n.summary ? <p className="mt-1 text-sm opacity-85 line-clamp-3">{n.summary}</p> : null}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
