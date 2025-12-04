import { Star } from "lucide-react";
import { useMemo } from "react";

import type { Article } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CountriesPanelProps {
  articles: Article[];
  starredCountries: string[];
  activeCountryFilter: string | null;
  onToggleStar: (country: string) => void;
  onChangeActiveCountryFilter: (country: string | null) => void;
}

const COUNTRY_NAMES: Record<string, string> = {
  DK: "Danmark",
  US: "USA",
  DE: "Tyskland",
  SE: "Sverige",
  NO: "Norge",
  FI: "Finland",
};

export function CountriesPanel({
  articles,
  starredCountries,
  activeCountryFilter,
  onToggleStar,
  onChangeActiveCountryFilter,
}: CountriesPanelProps) {
  const countries = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of articles) {
      if (!a.country) continue;
      const c = a.country.toUpperCase();
      counts[c] = (counts[c] ?? 0) + 1;
    }

    const list = Object.entries(counts).map(([code, count]) => ({
      code,
      count,
      starred: starredCountries.includes(code),
    }));

    list.sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return b.count - a.count;
    });

    return list;
  }, [articles, starredCountries]);

  return (
    <Card className="border-border/80 bg-card/80" data-card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Lande</CardTitle>
        <p className="text-xs text-muted-foreground">
          Filtrer nyheder på land og stjernemarkér dine vigtigste markeder.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {countries.length === 0 && (
          <p className="text-xs text-muted-foreground">Ingen lande fundet i de valgte nyheder.</p>
        )}

        {countries.map((c) => {
          const name = COUNTRY_NAMES[c.code] ?? c.code;
          const isActive = activeCountryFilter === c.code;

          return (
            <div
              key={c.code}
              className={cn(
                "flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs",
                isActive ? "border-primary/70 bg-primary/10" : "border-border/70 bg-secondary/70",
              )}
            >
              <button
                type="button"
                className="flex flex-1 items-center gap-2 text-left"
                onClick={() => onChangeActiveCountryFilter(isActive ? null : c.code)}
              >
                <span className="font-medium">{name}</span>
                <span className="text-[11px] text-muted-foreground">{c.code}</span>
              </button>
              <div className="flex items-center gap-2">
                <Badge className="rounded-full bg-background/60 px-2 text-[11px] text-muted-foreground">
                  {c.count}
                </Badge>
                <button
                  type="button"
                  onClick={() => onToggleStar(c.code)}
                  className={cn(
                    "inline-flex h-5 w-5 items-center justify-center rounded-full",
                    c.starred ? "bg-accent/20 text-accent" : "bg-background/40 text-muted-foreground",
                  )}
                  aria-label={`Marker ${name} som favorit`}
                >
                  <Star className={cn("h-3.5 w-3.5", c.starred && "fill-current")} />
                </button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default CountriesPanel;
