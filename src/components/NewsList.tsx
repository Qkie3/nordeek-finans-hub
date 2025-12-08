import { NewsChips } from './NewsChips';
import { useEffect, useState } from "react";
import { getCompanyNews, getMarketNews, NewsItem } from "../services/news";

type Props = { symbol?: string; mode?: FilterMode; showFilters?: boolean; watchlist?: string[] };

export function NewsList({ symbol }: Props) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const enabled = String(import.meta.env.VITE_USE_NEWSAPI_AI || "false") === "true";
  const hasKey = Boolean(import.meta.env.VITE_NEWSAPI_AI_KEY);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = symbol ? await getCompanyNews(symbol, 8) : await getMarketNews(10);
        if (alive) setItems(filterAndSort(data, mode, { watchlist }));
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };\n  }, [symbol, mode]);\n\n  // refilter on mode or watchlist changes\n  useEffect(() => {\n    setItems(prev => filterAndSort(prev, mode, { watchlist }));\n  }, [mode, watchlist]);

  if (!enabled) return <p className="opacity-80">Nyheder er slået fra (<code>VITE_USE_NEWSAPI_AI=false</code>).</p>;
  if (!hasKey) return <p className="opacity-80">Tilføj <code>VITE_NEWSAPI_AI_KEY</code> i <code>.env</code>.</p>;
  if (loading) return <p className="opacity-80">Henter nyheder…</p>;
  if (!items.length) return (
    <div className="opacity-80">
      <p>Ingen nyheder fundet.</p>
      <ul className="list-disc ml-5 text-sm">
        <li>Tjek at nøglen er gyldig</li>
        <li>DevTools → Network: POST <code>/article/getArticles</code> = 200?</li>
        <li>Nogle søgninger (fx “AAPL”) kan være tomme lige nu—prøv “Apple”</li>
      </ul>
    </div>
  );

  return (
    <ul className="space-y-3">
      {items.map((n) => (
        <li key={n.id} className="rounded border p-3">
          <a href={n.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
            {n.headline}
          </a>
          <div className="text-xs text-muted-foreground">
            {n.source} • {new Date(n.datetime * 1000).toLocaleString("da-DK")}
          </div>
          {n.summary ? <p className="mt-1 text-sm opacity-85 line-clamp-3">{n.summary}</p> : null}
        </li>
      ))}
    </ul>
  );
}

