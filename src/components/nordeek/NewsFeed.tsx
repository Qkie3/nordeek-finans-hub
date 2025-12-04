import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Clock, ExternalLink, Sparkles } from "lucide-react";

import type { Article, SummarizeResponse } from "@/lib/api";
import { summarizeUrl } from "@/lib/api";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

import type { AiLength, AiTone } from "./TopNav";

interface NewsFeedProps {
  articles: Article[];
  isLoading: boolean;
  aiEnabled: boolean;
  aiLength: AiLength;
  aiTone: AiTone;
  summaryCache: Record<string, SummarizeResponse>;
  onUpdateSummaryCache: (url: string, summary: SummarizeResponse) => void;
}

function SentimentPill({ sentiment }: { sentiment: Article["sentiment"] }) {
  const label =
    sentiment === "bullish" ? "Bullish" : sentiment === "bearish" ? "Bearish" : "Neutral";
  const colorClass =
    sentiment === "bullish"
      ? "bg-sentiment-bull/20 text-sentiment-bull"
      : sentiment === "bearish"
        ? "bg-sentiment-bear/20 text-sentiment-bear"
        : "bg-sentiment-neutral/18 text-sentiment-neutral";

  return (
    <Badge className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", colorClass)}>
      {label}
    </Badge>
  );
}

interface SummaryProps {
  article: Article;
  summary: SummarizeResponse;
}

function SummaryBlock({ article, summary }: SummaryProps) {
  if (summary.mode === "fallback" && summary.policy?.optOut) {
    return (
      <div className="mt-3 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
        Denne kilde har frabedt sig AI-resuméer. Åbn artiklen direkte hos udgiveren.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-border bg-secondary/60 px-3 py-3 text-xs">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          AI-resumé
        </p>
      </div>
      <p className="text-sm leading-relaxed">{summary.summary}</p>

      {summary.bullets?.length > 0 && (
        <div className="pt-1">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Nøgletal
          </p>
          <ul className="list-disc space-y-1 pl-4">
            {summary.bullets.map((b, idx) => (
              <li key={idx} className="text-xs text-muted-foreground">
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.impacts?.length > 0 && (
        <div className="pt-1">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Mulig markedseffekt
          </p>
          <ul className="list-disc space-y-1 pl-4">
            {summary.impacts.map((i, idx) => (
              <li key={idx} className="text-xs text-muted-foreground">
                {i}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Separator className="my-1 border-border/60" />
      <p className="text-[11px] text-muted-foreground">
        Kilde: <span className="font-medium">{article.source}</span>
      </p>
    </div>
  );
}

export function NewsFeed({
  articles,
  isLoading,
  aiEnabled,
  aiLength,
  aiTone,
  summaryCache,
  onUpdateSummaryCache,
}: NewsFeedProps) {
  const [openSummaryUrl, setOpenSummaryUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);

  const handleOpenArticle = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleToggleSummary = async (article: Article) => {
    if (!aiEnabled) return;
    const cached = summaryCache[article.url];

    if (cached) {
      setOpenSummaryUrl((prev) => (prev === article.url ? null : article.url));
      return;
    }

    setLoadingUrl(article.url);
    try {
      const result = await summarizeUrl(article.url, aiLength, aiTone);
      onUpdateSummaryCache(article.url, result);
      setOpenSummaryUrl(article.url);
    } catch (err) {
      console.error(err);
      toast({
        title: "Kunne ikke hente resumé",
        description: "Prøv igen om lidt eller åbn artiklen direkte hos kilden.",
      });
    } finally {
      setLoadingUrl(null);
    }
  };

  if (isLoading && !articles.length) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="border-border/60 bg-card/40" data-card>
            <CardContent className="flex h-28 animate-pulse items-center gap-4 p-4">
              <div className="h-20 w-28 rounded-lg bg-muted/40" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 rounded bg-muted/40" />
                <div className="h-4 w-1/2 rounded bg-muted/30" />
                <div className="h-3 w-1/3 rounded bg-muted/20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!articles.length) {
    return (
      <Card className="border-dashed border-border/70 bg-card/40" data-card>
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">Ingen nyheder matcher dine filtre endnu.</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Prøv at udvide tidsfilteret, fjerne landefilter eller tilføje flere aktier til din watchlist.
          </p>
        </CardContent>
      </Card>
    );
  }

  const [hero, ...rest] = articles;
  const gridItems = rest.slice(0, 4);
  const tailItems = rest.slice(4);

  const renderCard = (article: Article, variant: "hero" | "grid" | "row") => {
    const summary = summaryCache[article.url];
    const isOpen = openSummaryUrl === article.url;
    const isLoadingSummary = loadingUrl === article.url;

    return (
      <Card
        key={article.url}
        className={cn(
          "group overflow-hidden border-border/70 bg-card/70 transition-transform duration-200 hover:-translate-y-[1px]",
          variant === "hero" && "md:col-span-2",
        )}
        data-card
      >
        <CardContent className="flex gap-4 p-4 md:p-5">
          <div
            className={cn(
              "relative shrink-0 overflow-hidden rounded-xl bg-muted/40",
              variant === "hero" ? "h-40 w-40 md:h-44 md:w-60" : variant === "grid" ? "h-28 w-28" : "h-20 w-28",
            )}
          >
            {article.image ? (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${article.image})` }}
                aria-hidden
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
                Ingen billede
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-1">
                <p className={cn("line-clamp-2 text-sm font-semibold md:text-base", variant === "hero" && "md:text-lg")}
                >
                  {article.title}
                </p>
                {article.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">
                    {article.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{timeAgo(article.publishedMs)}</span>
              </span>
              <span>· {article.source}</span>
              {article.country && <Badge className="rounded-full bg-secondary/80 px-2">{article.country}</Badge>}
              {article.ticker && (
                <Badge className="rounded-full bg-primary/15 px-2 text-primary">{article.ticker}</Badge>
              )}
              <SentimentPill sentiment={article.sentiment} />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 border-border/70 bg-secondary/60 text-xs"
                onClick={() => handleOpenArticle(article.url)}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Åbn artikel
              </Button>

              {aiEnabled && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1 text-xs text-primary hover:bg-primary/10"
                  onClick={() => handleToggleSummary(article)}
                  disabled={isLoadingSummary}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isLoadingSummary ? "Genererer AI-resumé…" : "AI-resumé"}
                </Button>
              )}
            </div>

            {isOpen && summary && <SummaryBlock article={article} summary={summary} />}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {hero && renderCard(hero, "hero")}
        {gridItems.map((article) => renderCard(article, "grid"))}
      </div>

      {tailItems.length > 0 && (
        <div className="space-y-3">
          {tailItems.map((article) => renderCard(article, "row"))}
        </div>
      )}
    </div>
  );
}

export default NewsFeed;
