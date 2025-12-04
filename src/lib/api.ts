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

export interface NewsError {
  source: string;
  error: string;
}

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

export type SummarizeMode = "full" | "short" | "fallback";

export interface SummarizeVariants {
  short_pro?: { summary: string };
  long_pro?: { summary: string };
  short_casual?: { summary: string };
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

export interface SummarizeBatchResponse {
  items: Record<string, SummarizeResponse>;
}

export interface QABody {
  question: string;
  url?: string;
  context?: string;
}

export interface QAResponse {
  answer: string;
}

export const API_BASE_URL = import.meta.env.VITE_NORDEEK_API ?? "http://localhost:3000";

async function handleJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Uventet serverfejl");
  }

  return response.json() as Promise<T>;
}

export async function fetchNews(): Promise<NewsResponse> {
  const response = await fetch(`${API_BASE_URL}/news?pageSize=200`);
  return handleJson<NewsResponse>(response);
}

export async function fetchEvents(): Promise<EventsResponse> {
  const response = await fetch(`${API_BASE_URL}/events`);
  const data = await handleJson<any>(response);

  if (Array.isArray(data)) {
    return { events: data };
  }

  if ("events" in data) {
    return { events: data.events as EventItem[], note: data.note };
  }

  return { events: [] };
}

export async function fetchPrices(tickers: string[]): Promise<PricesResponse> {
  const query = encodeURIComponent(tickers.join(","));
  const response = await fetch(`${API_BASE_URL}/prices?tickers=${query}`);
  return handleJson<PricesResponse>(response);
}

export async function summarizeUrl(
  url: string,
  length: "short" | "long",
  tone: "pro" | "casual",
): Promise<SummarizeResponse> {
  const response = await fetch(`${API_BASE_URL}/summarize?length=${length}&tone=${tone}` as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  return handleJson<SummarizeResponse>(response);
}

export async function summarizeBatch(
  urls: string[],
  length: "short" | "long",
  tone: "pro" | "casual",
): Promise<SummarizeBatchResponse> {
  const response = await fetch(`${API_BASE_URL}/summarize-batch?length=${length}&tone=${tone}` as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  });

  return handleJson<SummarizeBatchResponse>(response);
}

export async function askMarketEffect(payload: QABody): Promise<QAResponse> {
  const response = await fetch(`${API_BASE_URL}/qa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleJson<QAResponse>(response);
}
