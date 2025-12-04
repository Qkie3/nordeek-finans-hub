import { useState } from "react";

import { askMarketEffect } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export function MarketEffectPanel() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() && !url.trim()) {
      toast({ title: "Tilføj indhold", description: "Skriv en kort nyhedstekst eller indsæt et link." });
      return;
    }

    setIsLoading(true);
    setAnswer(null);

    try {
      const payload = {
        question: "Hvad betyder denne nyhed for aktiemarkedet, relevante sektorer og konkrete aktier?",
        context: text || undefined,
        url: url || undefined,
      };
      const res = await askMarketEffect(payload);
      setAnswer(res.answer);
    } catch (err) {
      console.error(err);
      toast({
        title: "Kunne ikke analysere markedseffekt",
        description: "Prøv igen om lidt.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/80 bg-card/80" data-card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Markedseffekt (AI)</CardTitle>
        <p className="text-xs text-muted-foreground">
          Indsæt en kort nyhedstekst eller et link, og få en AI-vurdering af markedseffekten.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Skriv eller indsæt en kort nyhedstekst – fx en breaking overskrift eller uddrag."
          className="text-xs"
        />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Valgfrit: Indsæt artikel-URL"
          className="h-8 text-xs"
        />
        <Button
          size="sm"
          className="mt-1 h-8 w-full text-xs"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Analyserer markedseffekt med AI…" : "Analyser"}
        </Button>

        {answer && (
          <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-md border border-border/70 bg-secondary/60 p-2 text-xs leading-relaxed">
            {answer.split(/\n+/).map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MarketEffectPanel;
