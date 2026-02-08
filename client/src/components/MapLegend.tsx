import { Card } from "@/components/ui/card";

export function MapLegend() {
  return (
    <Card className="absolute bottom-8 left-8 z-[1000] p-4 bg-background/90 backdrop-blur border-border/50 shadow-xl">
      <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Demand Intensity</h4>
      <div className="flex items-center gap-2">
        <div className="flex flex-col text-[10px] font-mono text-muted-foreground gap-1">
          <span>High</span>
          <span>Avg</span>
          <span>Low</span>
        </div>
        <div className="h-16 w-3 rounded-full bg-gradient-to-t from-emerald-500 via-yellow-500 to-red-600" />
      </div>
      <div className="mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-blue-500/50 border border-blue-400" />
          <span>Selected Zone</span>
        </div>
      </div>
    </Card>
  );
}
