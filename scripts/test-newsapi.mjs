import fs from "node:fs";
const env = Object.fromEntries(
  fs.existsSync(".env")
    ? fs.readFileSync(".env", "utf8").split(/\r?\n/).map(l => l.match(/^\s*([^=\s]+)\s*=(.*)$/)).filter(Boolean).map(m => [m[1], m[2]])
    : []
);
const key = env.VITE_NEWSAPI_AI_KEY || process.env.VITE_NEWSAPI_AI_KEY;
const base = (env.VITE_NEWSAPI_AI_ENDPOINT || "https://eventregistry.org/api/v1").replace(/\/$/, "");
if (!key) {
  console.error("⛔ VITE_NEWSAPI_AI_KEY mangler i .env"); process.exit(1);
}
const url = `${base}/article/getArticles`;
const body = {
  apiKey: key,
  resultType: "articles",
  articlesSortBy: "date",
  articlesCount: 3,
  lang: ["dan","eng"]
};
const res = await fetch(url, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(body) });
console.log("HTTP", res.status);
const j = await res.json();
console.log("count:", j?.articles?.results?.length ?? 0);
if (Array.isArray(j?.articles?.results)) {
  for (const a of j.articles.results.slice(0,3)) {
    console.log("-", a?.title || a?.headline, " | ", a?.url);
  }
}
