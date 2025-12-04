import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export type AiLength = "short" | "long";
export type AiTone = "pro" | "casual";

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  aiEnabled: boolean;
  onAiEnabledChange: (value: boolean) => void;
  aiLength: AiLength;
  onAiLengthChange: (value: AiLength) => void;
  aiTone: AiTone;
  onAiToneChange: (value: AiTone) => void;
}

export function TopNav({
  searchQuery,
  onSearchChange,
  aiEnabled,
  onAiEnabledChange,
  aiLength,
  onAiLengthChange,
  aiTone,
  onAiToneChange,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 mb-2 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-soft">
            <span className="text-lg font-display tracking-tight">N</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg md:text-xl">Nordeek</span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Aktie- & markedsnyheder
            </span>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Søg efter selskaber, tickers eller nyheder..."
              className="h-10 w-full rounded-full border-border bg-secondary/70 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end leading-none">
              <span className="text-xs font-medium">AI-resuméer</span>
              <span className="text-[10px] text-muted-foreground">Opsummer artikler automatisk</span>
            </div>
            <Switch checked={aiEnabled} onCheckedChange={onAiEnabledChange} aria-label="Slå AI-resuméer til" />
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex flex-col gap-1">
              <Label htmlFor="ai-length" className="text-[11px] text-muted-foreground">
                Længde
              </Label>
              <Select value={aiLength} onValueChange={(v) => onAiLengthChange(v as AiLength)}>
                <SelectTrigger id="ai-length" className="h-8 w-28 border-border bg-secondary/70 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short" className="text-xs">
                    Kort
                  </SelectItem>
                  <SelectItem value="long" className="text-xs">
                    Lang
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="ai-tone" className="text-[11px] text-muted-foreground">
                Tone
              </Label>
              <Select value={aiTone} onValueChange={(v) => onAiToneChange(v as AiTone)}>
                <SelectTrigger id="ai-tone" className="h-8 w-32 border-border bg-secondary/70 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro" className="text-xs">
                    Professionel
                  </SelectItem>
                  <SelectItem value="casual" className="text-xs">
                    Casual
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-3 pt-1 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Søg efter selskaber, tickers eller nyheder..."
            className="h-9 w-full rounded-full border-border bg-secondary/70 pl-9 pr-4 text-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>
    </header>
  );
}

export default TopNav;
