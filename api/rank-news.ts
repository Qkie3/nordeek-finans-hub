import type { VercelRequest, VercelResponse } from '@vercel/node';

type InArticle = { id: string; title?: string; body?: string; url?: string; publishedMs?: number };
type OutItem = { id: string; score: number; reason?: string; rejected?: boolean };

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY missing' });

    const body = req.body || {};
    const items = Array.isArray(body.articles) ? (body.articles as InArticle[]) : [];
    if (!items.length) return res.status(200).json({ ranking: [], rejects: [] });

    // Normalize/trim
    const norm = items.map(a => ({
      id: String(a.id),
      title: String(a.title || '').slice(0, 180),
      body: String(a.body || '').slice(0, 3500),
      url: String(a.url || ''),
      publishedMs: Number.isFinite(a.publishedMs as number) ? (a.publishedMs as number) : Date.now()
    }));

    const sys = [
      "Du er finansredaktør. Rangér artikler efter hvor 'breaking' de er for aktiemarkedet.",
      "Sprog: Dansk, kort, neutralt. Boost earnings/guidance/M&A/makro, ticker-nærhed, friskhed.",
      "Output KUN JSON: { ranking: [{id, score 0..1, reason}], rejects: [{id, reason}] } sorteret DESC på score.",
      "Afvis støj (sport/krimi/kultur/politik uden finansielt indhold)."
    ].join(' ');

    const user = [
      "Her er artikler:",
      ...norm.map(a => `ID=${a.id}\nTitel: ${a.title}\nUddrag: ${a.body}\nURL: ${a.url}\nPublishedMs: ${a.publishedMs}`),
      "",
      "Returnér KUN JSON som:",
      `{ "ranking": [ { "id": "ID1", "score": 0.92, "reason": "..." } ], "rejects": [ { "id": "IDX", "reason": "støj ..." } ] }`
    ].join('\n\n');

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      // Fallback: behold input-rækkefølge (AI offline / quota)
      return res.status(200).json({
        ranking: norm.map(a => ({ id: a.id, score: 0.5, reason: "fallback (AI offline)" })),
        rejects: []
      });
    });
    }

    const j = await r.json();
    const raw = j?.choices?.[0]?.message?.content || "{}";
    let parsed: { ranking?: OutItem[]; rejects?: OutItem[] } = {};
    try { parsed = JSON.parse(raw) } catch {}

    const ranking = Array.isArray(parsed.ranking) ? parsed.ranking : [];
    const rejects = Array.isArray(parsed.rejects) ? parsed.rejects : [];

    return res.status(200).json({ ranking, rejects });
  } catch (e: any) {
    const b = (req.body || {}) as any;
    const arr = Array.isArray(b.articles) ? b.articles : [];
    return res.status(200).json({
      ranking: arr.map((a:any)=>({ id: String(a?.id ?? ""), score: 0.5, reason: "fallback (exception)" })),
      rejects: []
    });
  });
  }
}

