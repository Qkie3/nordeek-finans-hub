import type { EventItem } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface EventsPanelProps {
  events: EventItem[];
  note?: string;
  isLoading: boolean;
  error: Error | null;
}

export function EventsPanel({ events, note, isLoading, error }: EventsPanelProps) {
  return (
    <Card className="border-border/80 bg-card/80" data-card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Kommende regnskaber</CardTitle>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-full rounded-md bg-muted/40" />
            ))}
          </div>
        )}

        {error && !isLoading && (
          <p className="text-xs text-muted-foreground">Kunne ikke hente events lige nu.</p>
        )}

        {!isLoading && !error && events.length === 0 && (
          <p className="text-xs text-muted-foreground">Ingen kommende events.</p>
        )}

        {!isLoading && !error && events.length > 0 && (
          <ul className="space-y-1.5 text-xs">
            {events.slice(0, 10).map((event, idx) => (
              <li
                key={`${event.title}-${idx}`}
                className="rounded-md border border-border/70 bg-secondary/70 px-2.5 py-1.5"
              >
                <p className="line-clamp-1 font-medium">{event.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {event.date}
                  {event.time ? ` kl. ${event.time}` : ""} · {event.country}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default EventsPanel;
