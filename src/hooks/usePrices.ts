import { useQuery } from "@tanstack/react-query";

import { fetchPrices, type PricesResponse } from "@/lib/api";

const INDEX_TICKERS = ["DIA", "SPY", "QQQ"] as const;

export function usePrices() {
  return useQuery<PricesResponse, Error>({
    queryKey: ["prices", INDEX_TICKERS],
    queryFn: () => fetchPrices([...INDEX_TICKERS]),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
