export type FilterMode = "all" | "breaking" | "earnings" | "guidance" | "mna" | "macro" | "foryou";
export type ArticleLike = { id: string; title?: string; headline?: string; summary?: string; body?: string; url?: string; publishedMs?: number; };

const RX = {
  earnings: /\b(earnings|q[1-4]\s*results|results|eps|revenue|sales|beat|miss)\b/i,
  guidance: /\b(guidance|outlook|forecast|raises|cuts|lowers|updates)\b/i,
  mna: /\b(merger|acquire|acquisition|buyout|takeover)\b/i,
  macro: /\b(cpi|inflation|ecb|fed|rate|gdp|jobs|unemployment)\b/i,
};

const text = (a: ArticleLike) => [a.title||a.headline||"", a.summary||"", (a as any).body||""].join(" ").slice(0,8000);
const ms = (a: ArticleLike) => typeof a.publishedMs === "number" ? a.publishedMs : Date.now();

export function fallbackSort(list: ArticleLike[], mode: FilterMode, watchlist: string[] = []) {
  const wl = (watchlist || []).map(x => x.toUpperCase());
  const scored = list.map(a => {
    let s = 0; const t = text(a); const now = Date.now(); const age = now - ms(a);
    if (RX.earnings.test(t)) s += 0.35;
    if (RX.guidance.test(t)) s += 0.25;
    if (RX.mna.test(t))      s += 0.20;
    if (RX.macro.test(t))    s += 0.15;
    if (wl.length && wl.some(x => t.toUpperCase().includes(x))) s += 0.15;
    if (age < 12*60*1000) s += 0.12; else if (age < 60*60*1000) s += 0.06; else if (age < 24*60*60*1000) s += 0.02;
    const breaking = (age < 12*60*1000) && s > 0.55 && (RX.earnings.test(t) || RX.guidance.test(t) || RX.mna.test(t));
    return { a, s, breaking, ts: ms(a) };
  });

  let filtered = scored;
  if (mode === "breaking") filtered = scored.filter(x => x.breaking);
  if (mode === "earnings") filtered = scored.filter(x => RX.earnings.test(text(x.a)));
  if (mode === "guidance") filtered = scored.filter(x => RX.guidance.test(text(x.a)));
  if (mode === "mna")      filtered = scored.filter(x => RX.mna.test(text(x.a)));
  if (mode === "macro")    filtered = scored.filter(x => RX.macro.test(text(x.a)));
  if (mode === "foryou")   filtered = scored.filter(x => wl.length && wl.some(w => text(x.a).toUpperCase().includes(w)));

  return filtered
    .sort((p, q) => Number(q.breaking) - Number(p.breaking) || q.s - p.s || q.ts - p.ts)
    .map(x => x.a);
}
