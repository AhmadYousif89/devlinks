import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useClearHighlightParams } from "@/hooks/use-clear-highlight-params";

type HighlightBannerProps = {
  title: string;
  area: "LINKS" | "PROFILE";
  description?: string;
};

export const HighlightBanner = ({ title, description, area }: HighlightBannerProps) => {
  const clearHighlightParams = useClearHighlightParams();

  return (
    <Card className="mb-6 border border-red-200 bg-red-50 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-destructive size-3 animate-pulse rounded-full"></span>
          <h3 className="text-sm font-semibold text-red-800">{title}</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          title="Clear warning banner"
          onClick={clearHighlightParams.bind(null, area)}
          className="text-accent-foreground"
        >
          <span className="flex size-6 items-center justify-center text-2xl">&times;</span>
        </Button>
      </div>
      <p className="text-sm text-amber-700">{description}</p>
    </Card>
  );
};
