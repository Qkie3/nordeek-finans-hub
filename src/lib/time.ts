import { format } from "date-fns";

import type { Article } from "./api";

export type AgeFilterId = "3h" | "24h" | "3d" | "7d" | "30d" | "all";

export interface AgeFilterOption {
  id: AgeFilterId;
  label: string;
  durationMs?: number;
}

export const AGE_FILTER_OPTIONS: AgeFilterOption[] = [
  { id: "3h", label: "3 timer", durationMs: 3 * 60 * 60 * 1000 },
  { id: "24h", label: "24 timer", durationMs: 24 * 60 * 60 * 1000 },
  { id: "3d", label: "3 dage", durationMs: 3 * 24 * 60 * 60 * 1000 },
  { id: "7d", label: "7 dage", durationMs: 7 * 24 * 60 * 60 * 1000 },
  { id: "30d", label: "30 dage", durationMs: 30 * 24 * 60 * 60 * 1000 },
  { id: "all", label: "Alle" },
];

export function timeAgo(publishedMs: number, nowMs: number = Date.now()): string {
  const diffMs = Math.max(0, nowMs - publishedMs);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes <= 1) return "lige nu";
  if (diffMinutes < 60) return `${diffMinutes} min siden`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} t siden`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} d siden`;
}

export function filterByAge(publishedMs: number, filterId: AgeFilterId, nowMs: number = Date.now()): boolean {
  const option = AGE_FILTER_OPTIONS.find((opt) => opt.id === filterId);
  if (!option || !option.durationMs) return true;

  const diffMs = nowMs - publishedMs;
  return diffMs <= option.durationMs;
}

const BREAKING_WINDOW_MS = 4 * 60 * 60 * 1000;
const BIG_CAP_TICKERS = ["NOVO-B", "AAPL", "MSFT", "SPY", "QQQ", "DIA"];

export function isBreaking(article: Article, nowMs: number = Date.now()): boolean {
  const ageMs = nowMs - article.publishedMs;
  if (ageMs > BREAKING_WINDOW_MS) return false;

  if (article.sentiment && article.sentiment !== "neutral") return true;

  if (article.ticker && BIG_CAP_TICKERS.includes(article.ticker.toUpperCase())) return true;

  const ageMinutes = ageMs / 60000;
  return ageMinutes <= 30;
}

export interface RelevanceOptions {
  nowMs?: number;
  watchlistTickers?: string[];
}

export function calcRelevanceScore(article: Article, options: RelevanceOptions = {}): number {
  const { nowMs = Date.now(), watchlistTickers = [] } = options;

  const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
  const ageMs = Math.max(0, nowMs - article.publishedMs);
  const recencyScore = 1 - Math.min(ageMs / maxAgeMs, 1);

  const ticker = article.ticker?.toUpperCase();
  const watchlistBoost = ticker && watchlistTickers.includes(ticker) ? 0.6 : 0;

  let sentimentBoost = 0;
  if (article.sentiment === "bullish" || article.sentiment === "bearish") {
    sentimentBoost = 0.2;
  }

  const breakingBoost = isBreaking(article, nowMs) ? 0.3 : 0;

  return recencyScore + watchlistBoost + sentimentBoost + breakingBoost;
}

export function formatLastUpdated(lastUpdated: number | null | undefined): string | null {
  if (!lastUpdated) return null;

  try {
    return format(new Date(lastUpdated), "HH:mm");
  } catch {
    return null;
  }
}
