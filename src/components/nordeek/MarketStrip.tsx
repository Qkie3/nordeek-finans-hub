import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import type { PricesResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

interface MarketStripProps {
  prices?: PricesResponse;
  isLoading: boolean;
  error: Error | null;
}

const INDEX_LABELS: Record<string, string> = {
  DIA: "Dow Jones",
  SPY: "S&P 500",
  QQQ: "Nasdaq 100",
};

export function MarketStrip({ prices, isLoading, error }: MarketStripProps) {
  const entries = prices ? Object.entries(prices.prices ?? {}) : [];

  return (
    <section
      aria-label="Markedsindeks"
      className="rounded-2xl border border-border/80 bg-strip-gradient/20 bg-[radial-gradient(circle_at_top,_hsl(222_40%_18%_/_0.8),_transparent_60%),_linear-gradient(90deg,_hsl(195_85%_14%_/_0.8),_hsl(260_65%_22%_/_0.7))] p-[1px] shadow-soft"
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-background/95 px-3 py-2 text-xs md:px-4 md:py-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] text-primary">
            ●
          </span>
          <span>Indeks overblik</span>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          {isLoading && !entries.length && (
            <p className="text-[11px] text-muted-foreground">Henter indeksdata...</p>
          )}

          {error && !entries.length && (
            <p className="text-[11px] text-muted-foreground">Kunne ikke hente indeks. Viser ingen data.</p>
          )}

          {entries.map(([ticker, data]) => {
            const label = INDEX_LABELS[ticker] ?? ticker;
            const change = data.changePct;
            const isUp = change >= 0;

            return (
              <div
                key={ticker}
                className={cn(
                  "flex min-w-[110px] items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[11px] md:min-w-[140px] md:text-xs",
                  "border-border/80 bg-secondary/80",
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium leading-tight">{label}</span>
                  <span className="text-[11px] text-muted-foreground">{ticker}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-xs md:text-sm">{data.price.toFixed(2)}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      isUp ? "bg-positive/15 text-positive" : "bg-negative/15 text-negative",
                    )}
                  >
                    {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {change.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default MarketStrip;
