import { useQuery } from "@tanstack/react-query";

import { fetchNews, type NewsResponse } from "@/lib/api";

export function useNews() {
  return useQuery<NewsResponse, Error>({
    queryKey: ["news"],
    queryFn: fetchNews,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
