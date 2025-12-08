import { useEffect, useState } from "react";
import { getMarketNews } from "../services/news";

export default function DebugNews() {
  const [env, setEnv] = useState({
    enabled: String(import.meta.env.VITE_USE_NEWSAPI_AI || "false"),
    key: import.meta.env.VITE_NEWSAPI_AI_KEY ? "<sat>" : "<mangler>",
    endpoint: String(import.meta.env.VITE_NEWSAPI_AI_ENDPOINT || ""),
  });
  const [count, setCount] = useState<number | null>(null);
  const [titles, setTitles] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const items = await getMarketNews(5);
        setCount(items.length);
        setTitles(items.map((x) => x.headline).slice(0, 5));
      } catch (e: any) {
        setErr(String(e?.message || e));
      }
    })();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Debug: NewsAPI.ai</h1>
      <div className="rounded border p-3 text-sm">
        <div><b>VITE_USE_NEWSAPI_AI</b>: {env.enabled}</div>
        <div><b>VITE_NEWSAPI_AI_KEY</b>: {env.key}</div>
        <div><b>VITE_NEWSAPI_AI_ENDPOINT</b>: {env.endpoint}</div>
      </div>
      {err ? <p className="text-red-600">Fejl: {err}</p> : null}
      {count !== null ? (
        <div className="rounded border p-3">
          <div>Antal artikler: {count}</div>
          <ul className="list-disc ml-5 mt-2">
            {titles.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      ) : <p>Henter…</p>}
      <p className="text-xs text-muted-foreground">Åbn også DevTools → Console/Network for logs: /article/getArticles</p>
    </div>
  );
}
