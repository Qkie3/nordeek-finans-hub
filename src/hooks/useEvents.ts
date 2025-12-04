import { useQuery } from "@tanstack/react-query";

import { fetchEvents, type EventsResponse } from "@/lib/api";

export function useEvents() {
  return useQuery<EventsResponse, Error>({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 5 * 60_000,
  });
}
