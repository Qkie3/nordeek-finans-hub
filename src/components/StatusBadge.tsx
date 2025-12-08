import { useEffect, useState } from "react";
import { fetchPrices } from "@/lib/api";

type State = "ok" | "fail" | "idle";

export default function StatusBadge() {
  const [news, setNews] = useState<State>("idle");
  const [prices, setPrices] = useState<State>("idle");
  const [ts, setTs] = useState<string>("");

  useEffect(() => {
    let alive = true;
    const now = () => new Date().toLocaleTimeString("da-DK");
    (async () => {
      try {
        // News ping
        const res = await fetch("/er/api/v1/article/getArticles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: import.meta.env.VITE_NEWSAPI_AI_KEY,
            resultType: "articles",
            articlesSortBy: "date",
            articlesCount: 1,
            lang: ["dan","eng"]
          })
        });
        if (!alive) return;
        setNews(res.ok ? "ok" : "fail");
      } catch { if (alive) setNews("fail"); }

      try {
        // Prices ping (DIA,SPY,QQQ) – bruger Alpha (med cache)
        await fetchPrices(["DIA","SPY","QQQ"]);
        if (!alive) return;
        setPrices("ok");
      } catch { if (alive) setPrices("fail"); }

      if (alive) setTs(now());
    })();
    return () => { alive = false; };
  }, []);

  const pill = (s: State) =>
    s === "ok" ? "bg-green-100 text-green-700"
    : s === "fail" ? "bg-red-100 text-red-700"
    : "bg-gray-100 text-gray-700";

  return (
    <div className="flex flex-wrap gap-2 items-center text-xs">
      <span className={`px-2 py-1 rounded ${pill(news)}`}>News: {news}</span>
      <span className={`px-2 py-1 rounded ${pill(prices)}`}>Prices: {prices}</span>
      {ts ? <span className="opacity-70">sidst: {ts}</span> : null}
    </div>
  );
}
