import { useEffect, useState } from "react";

import type { Article, SummarizeResponse } from "@/lib/api";
import { summarizeBatch } from "@/lib/api";
import { calcRelevanceScore, filterByAge, isBreaking } from "@/lib/time";
import { useEvents } from "@/hooks/useEvents";
import { useNews } from "@/hooks/useNews";
import { usePersistentState } from "@/hooks/usePersistentState";
import { usePrices } from "@/hooks/usePrices";
import CountriesPanel from "@/components/nordeek/CountriesPanel";
import ErrorBanner from "@/components/nordeek/ErrorBanner";
import EventsPanel from "@/components/nordeek/EventsPanel";
import MarketEffectPanel from "@/components/nordeek/MarketEffectPanel";
import { MarketStrip } from "@/components/nordeek/MarketStrip";
import { NewsFeed } from "@/components/nordeek/NewsFeed";
import NewsErrorsPanel from "@/components/nordeek/NewsErrorsPanel";
import { TabsAndFilters, type NewsTab } from "@/components/nordeek/TabsAndFilters";
import TopNav, { type AiLength, type AiTone } from "@/components/nordeek/TopNav";
import WatchlistPanel from "@/components/nordeek/WatchlistPanel";

function isForYou(article: Article, watchlist: string[], starredCountries: string[]): boolean {
  const ticker = article.ticker?.toUpperCase() ?? "";
  const country = article.country?.toUpperCase() ?? "";

  if (ticker && watchlist.includes(ticker)) return true;
  if (country && starredCountries.includes(country)) return true;
  if (article.company || article.ticker) return true;

  return false;
}

const DEFAULT_WATCHLIST = ["NOVO-B", "AAPL", "MSFT"];
const DEFAULT_STARRED_COUNTRIES = ["DK", "US"];

const SUMMARY_PREFETCH_LIMIT = 20;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<NewsTab>("all");
  const [ageFilter, setAgeFilter] = useState<"3h" | "24h" | "3d" | "7d" | "30d" | "all">("24h");

  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiLength, setAiLength] = useState<AiLength>("short");
  const [aiTone, setAiTone] = useState<AiTone>("pro");

  const [watchlist, setWatchlist] = usePersistentState<string[]>("ni_watchlist", DEFAULT_WATCHLIST);
  const [starredCountries, setStarredCountries] = usePersistentState<string[]>(
    "ni_starred_countries",
    DEFAULT_STARRED_COUNTRIES,
  );
  const [activeCountryFilter, setActiveCountryFilter] = useState<string | null>(null);

  const [summaryCache, setSummaryCache] = useState<Record<string, SummarizeResponse>>({});

  const newsQuery = useNews();
  const pricesQuery = usePrices();
  const eventsQuery = useEvents();

  const articles = newsQuery.data?.articles ?? [];
  const nowMs = Date.now();

  const articlesByAge = articles.filter((article) => filterByAge(article.publishedMs, ageFilter, nowMs));

  const normalizedSearch = searchQuery.toLowerCase().trim();
  const articlesAfterSearchAndCountry = articlesByAge.filter((article) => {
    if (activeCountryFilter && article.country !== activeCountryFilter) return false;

    if (!normalizedSearch) return true;

    const haystack = `${article.title} ${article.description ?? ""} ${article.company ?? ""} ${
      article.ticker ?? ""
    }`.toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  const forYouArticles = articlesAfterSearchAndCountry.filter((article) =>
    isForYou(article, watchlist, starredCountries),
  );
  const breakingArticles = articlesAfterSearchAndCountry.filter((article) => isBreaking(article, nowMs));

  const baseForFeed: Article[] =
    activeTab === "all"
      ? articlesAfterSearchAndCountry
      : activeTab === "forYou"
        ? forYouArticles
        : breakingArticles;

  const feedArticles = [...baseForFeed].sort(
    (a, b) =>
      calcRelevanceScore(b, { nowMs, watchlistTickers: watchlist }) -
      calcRelevanceScore(a, { nowMs, watchlistTickers: watchlist }),
  );

  const tickerCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};

  for (const article of articlesByAge) {
    if (article.ticker) {
      const key = article.ticker.toUpperCase();
      tickerCounts[key] = (tickerCounts[key] ?? 0) + 1;
    }

    if (article.country) {
      const key = article.country.toUpperCase();
      countryCounts[key] = (countryCounts[key] ?? 0) + 1;
    }
  }

  const addTickerToWatchlist = (ticker: string) => {
    const normalized = ticker.toUpperCase();
    setWatchlist((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
  };

  const removeTickerFromWatchlist = (ticker: string) => {
    const normalized = ticker.toUpperCase();
    setWatchlist((prev) => prev.filter((t) => t !== normalized));
  };

  const toggleStarredCountry = (country: string) => {
    const normalized = country.toUpperCase();
    setStarredCountries((prev) =>
      prev.includes(normalized) ? prev.filter((c) => c !== normalized) : [...prev, normalized],
    );
  };

  const changeActiveCountryFilter = (country: string | null) => {
    setActiveCountryFilter(country);
  };

  const handleUpdateSummaryCache = (url: string, summary: SummarizeResponse) => {
    setSummaryCache((prev) => ({ ...prev, [url]: summary }));
  };

  useEffect(() => {
    if (!aiEnabled || feedArticles.length === 0) return;

    const topArticles = feedArticles.slice(0, SUMMARY_PREFETCH_LIMIT);
    const urlsToPrefetch = topArticles.map((a) => a.url).filter((url) => !summaryCache[url]);

    if (!urlsToPrefetch.length) return;

    summarizeBatch(urlsToPrefetch, aiLength, aiTone)
      .then((response) => {
        setSummaryCache((prev) => ({ ...prev, ...response.items }));
      })
      .catch(() => {
        // Stilhed ved batch-fejl – individuelle klik vil stadig forsøge resumé
      });
  }, [aiEnabled, feedArticles, aiLength, aiTone, summaryCache]);

  const jsonLd =
    articles.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Nordeek aktie- og markedsnyheder",
          itemListElement: articles.slice(0, 10).map((article, index) => ({
            "@type": "NewsArticle",
            position: index + 1,
            headline: article.title,
            description: article.description,
            datePublished: article.publishedAt,
            url: article.url,
            inLanguage: article.language,
            publisher: {
              "@type": "Organization",
              name: article.source,
            },
          })),
        }
      : null;

  const totalCount = newsQuery.data?.count ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-10 pt-4 md:gap-6 md:px-6 lg:px-8">
        <TopNav
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          aiEnabled={aiEnabled}
          onAiEnabledChange={setAiEnabled}
          aiLength={aiLength}
          onAiLengthChange={setAiLength}
          aiTone={aiTone}
          onAiToneChange={setAiTone}
        />

        <MarketStrip
          prices={pricesQuery.data}
          isLoading={pricesQuery.isLoading}
          error={pricesQuery.error ?? null}
        />

        {newsQuery.error && (
          <ErrorBanner message="Kunne ikke hente nyheder lige nu. Prøv at opdatere siden om lidt." />
        )}

        <TabsAndFilters
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          ageFilter={ageFilter}
          onChangeAgeFilter={setAgeFilter}
          totalCount={totalCount}
          feedCount={feedArticles.length}
          lastUpdated={newsQuery.data?.lastUpdated}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2.4fr)_minmax(260px,1fr)] xl:grid-cols-[minmax(0,2.7fr)_minmax(320px,1fr)]">
          <section aria-label="Nyhedsfeed" className="space-y-4">
            <NewsFeed
              articles={feedArticles}
              isLoading={newsQuery.isLoading}
              aiEnabled={aiEnabled}
              aiLength={aiLength}
              aiTone={aiTone}
              summaryCache={summaryCache}
              onUpdateSummaryCache={handleUpdateSummaryCache}
            />
          </section>

          <aside className="space-y-4 md:space-y-6">
            <WatchlistPanel
              watchlist={watchlist}
              onAddTicker={addTickerToWatchlist}
              onRemoveTicker={removeTickerFromWatchlist}
              articles={articlesByAge}
            />

            <CountriesPanel
              articles={articlesByAge}
              starredCountries={starredCountries}
              activeCountryFilter={activeCountryFilter}
              onToggleStar={toggleStarredCountry}
              onChangeActiveCountryFilter={changeActiveCountryFilter}
            />

            <EventsPanel
              events={eventsQuery.data?.events ?? []}
              note={eventsQuery.data?.note}
              isLoading={eventsQuery.isLoading}
              error={eventsQuery.error ?? null}
            />

            <MarketEffectPanel />
          </aside>
        </div>

        {newsQuery.data?.errors && newsQuery.data.errors.length > 0 && (
          <NewsErrorsPanel errors={newsQuery.data.errors} />
        )}
      </div>
    </div>
  );
};

export default Index;
