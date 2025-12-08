import { useEffect, useState } from "react";

/** Minimal stub: returnerer tickers fra localStorage eller [] */
export function useWatchlist() {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("watchlist");
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, []);
  return { items };
}
