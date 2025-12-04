import { AlertTriangle, ChevronDown } from "lucide-react";

import type { NewsError } from "@/lib/api";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NewsErrorsPanelProps {
  errors: NewsError[];
}

export function NewsErrorsPanel({ errors }: NewsErrorsPanelProps) {
  if (!errors.length) return null;

  return (
    <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
      <Collapsible>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="font-medium">Fejlrapport</p>
            <span className="text-xs text-muted-foreground">({errors.length} kilder med fejl)</span>
          </div>
          <CollapsibleTrigger className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <span>Vis detaljer</span>
            <ChevronDown className="h-3 w-3" />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-2 space-y-1">
          {errors.map((err) => (
            <div key={err.source} className="flex flex-col rounded-md bg-background/60 px-2 py-1">
              <span className="text-xs font-medium text-muted-foreground">{err.source}</span>
              <span className="text-xs text-muted-foreground">{err.error}</span>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default NewsErrorsPanel;
