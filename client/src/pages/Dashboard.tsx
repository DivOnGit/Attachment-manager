import { useState } from "react";
import { MapView } from "@/components/MapView";
import { DemandChart } from "@/components/DemandChart";
import { AiAnalyst } from "@/components/AiAnalyst";
import { TimeSlider } from "@/components/TimeSlider";
import { MapLegend } from "@/components/MapLegend";
import { useZones } from "@/hooks/use-zones";
import { usePredictions } from "@/hooks/use-predictions";
import { startOfDay, endOfDay, addHours } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export default function Dashboard() {
  // Global Time State - Default to today 12:00
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Selection State
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  // Queries
  const { data: zones, isLoading: loadingZones, error: zonesError } = useZones();
  
  // Fetch predictions for the current specific hour for the map
  const { data: mapPredictions, isLoading: loadingMapPreds } = usePredictions({
    startTime: currentDate.toISOString(),
    endTime: addHours(currentDate, 1).toISOString(),
  });

  // Fetch 24h forecast for selected zone
  const { data: zoneForecast } = usePredictions({
    startTime: startOfDay(currentDate).toISOString(),
    endTime: endOfDay(currentDate).toISOString(),
    zoneId: selectedZoneId || undefined,
  });

  const selectedZone = zones?.find(z => z.zoneId === selectedZoneId);

  if (loadingZones) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-primary">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-sm font-mono tracking-widest uppercase">Initializing Geospatial Data...</p>
        </div>
      </div>
    );
  }

  if (zonesError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>System Error</AlertTitle>
          <AlertDescription>Failed to load zone data. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20" />
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight">TaxiDemand.ai</h1>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ONLINE
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
            NYC Operations Center
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 relative overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          
          {/* Main Map Area */}
          <ResizablePanel defaultSize={70} minSize={50} className="relative">
            <TimeSlider 
              currentDate={currentDate} 
              onChange={setCurrentDate} 
            />
            
            <MapView 
              zones={zones || []} 
              predictions={mapPredictions || []}
              selectedZoneId={selectedZoneId}
              onZoneSelect={setSelectedZoneId}
            />

            <MapLegend />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border/50 hover:bg-primary transition-colors" />

          {/* Right Sidebar */}
          <ResizablePanel defaultSize={30} minSize={20} className="bg-card/30 backdrop-blur-sm border-l border-border">
            <div className="h-full flex flex-col p-4 gap-4 overflow-y-auto">
              
              {/* Zone Details Section */}
              <div className="shrink-0">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Zone Analytics
                </h2>
                <DemandChart 
                  data={zoneForecast || []} 
                  zoneName={selectedZone?.zoneName}
                />
              </div>

              {/* Stats Grid */}
              {selectedZone && (
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  <div className="bg-card/50 border border-border rounded-lg p-3">
                    <span className="text-[10px] text-muted-foreground uppercase">Borough</span>
                    <p className="font-display font-semibold text-sm">{selectedZone.borough}</p>
                  </div>
                  <div className="bg-card/50 border border-border rounded-lg p-3">
                    <span className="text-[10px] text-muted-foreground uppercase">Service Zone</span>
                    <p className="font-display font-semibold text-sm">{selectedZone.serviceZone}</p>
                  </div>
                </div>
              )}

              {/* AI Analyst Section */}
              <div className="flex-1 min-h-[300px] flex flex-col">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  AI Insights
                </h2>
                <div className="flex-1">
                  <AiAnalyst contextZoneName={selectedZone?.zoneName} />
                </div>
              </div>

            </div>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>
    </div>
  );
}
