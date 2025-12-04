import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import type { Article } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface WatchlistPanelProps {
  watchlist: string[];
  onAddTicker: (ticker: string) => void;
  onRemoveTicker: (ticker: string) => void;
  articles: Article[];
}

export function WatchlistPanel({ watchlist, onAddTicker, onRemoveTicker, articles }: WatchlistPanelProps) {
  const [input, setInput] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of articles) {
      if (!a.ticker) continue;
      const t = a.ticker.toUpperCase();
      map[t] = (map[t] ?? 0) + 1;
    }
    return map;
  }, [articles]);

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const items: string[] = [];
    for (const a of articles) {
      if (!a.ticker) continue;
      const t = a.ticker.toUpperCase();
      if (seen.has(t) || watchlist.includes(t)) continue;
      if (input && !t.includes(input.toUpperCase())) continue;
      seen.add(t);
      items.push(t);
      if (items.length >= 6) break;
    }
    return items;
  }, [articles, input, watchlist]);

  const handleAdd = () => {
    const value = input.trim();
    if (!value) return;
    onAddTicker(value.toUpperCase());
    setInput("");
  };

  return (
    <Card className="border-border/80 bg-card/80" data-card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Watchlist</CardTitle>
        <p className="text-xs text-muted-foreground">
          Følg dine vigtigste aktier og se hvor meget nyhederne fylder.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          {watchlist.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Ingen aktier endnu. Tilføj en ticker herunder for at komme i gang.
            </p>
          )}

          {watchlist.map((ticker) => (
            <div
              key={ticker}
              className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary/70 px-2.5 py-1.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">{ticker}</span>
                <Badge className="rounded-full bg-primary/15 px-2 text-[11px] text-primary">
                  {counts[ticker] ?? 0} nyheder
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => onRemoveTicker(ticker)}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                aria-label={`Fjern ${ticker} fra watchlist`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tilføj aktie (ticker eller navn)"
              className="h-8 flex-1 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button size="sm" className="h-8 px-2 text-xs" onClick={handleAdd}>
              <Plus className="mr-1 h-3 w-3" />
              Tilføj
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-1 rounded-lg bg-secondary/60 p-1.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Forslag fra nyheder
              </p>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onAddTicker(s);
                      setInput("");
                    }}
                    className="rounded-full border border-border/70 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary/60 hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default WatchlistPanel;
