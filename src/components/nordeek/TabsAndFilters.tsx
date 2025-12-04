import { Info } from "lucide-react";

import { AGE_FILTER_OPTIONS, formatLastUpdated, type AgeFilterId } from "@/lib/time";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type NewsTab = "all" | "forYou" | "breaking";

interface TabsAndFiltersProps {
  activeTab: NewsTab;
  onChangeTab: (tab: NewsTab) => void;
  ageFilter: AgeFilterId;
  onChangeAgeFilter: (filter: AgeFilterId) => void;
  totalCount: number | null;
  feedCount: number;
  lastUpdated: number | null | undefined;
}

export function TabsAndFilters({
  activeTab,
  onChangeTab,
  ageFilter,
  onChangeAgeFilter,
  totalCount,
  feedCount,
  lastUpdated,
}: TabsAndFiltersProps) {
  const lastUpdatedLabel = formatLastUpdated(lastUpdated ?? null);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Tabs value={activeTab} onValueChange={(value) => onChangeTab(value as NewsTab)}>
        <TabsList className="bg-muted/40">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="forYou">Til dig</TabsTrigger>
          <TabsTrigger value="breaking">Breaking</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col items-start gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:gap-4">
        <div className="flex items-center gap-2">
          <Select value={ageFilter} onValueChange={(value) => onChangeAgeFilter(value as AgeFilterId)}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue placeholder="Tidsfilter" />
            </SelectTrigger>
            <SelectContent>
              {AGE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5" />
          <span>
            {totalCount ?? feedCount} nyheder · Sidst opdateret kl. {lastUpdatedLabel ?? "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TabsAndFilters;
