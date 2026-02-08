import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Popup, useMap } from "react-leaflet";
import type { ZoneResponse, PredictionResponse } from "@shared/routes";
import { scaleLinear } from "d3-scale";
import { interpolateRgb } from "d3-interpolate";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helper for color scale
const getColor = scaleLinear<string>()
  .domain([0, 50, 200]) // Adjust these values based on typical demand
  .range(["#10b981", "#eab308", "#dc2626"]) // Emerald -> Yellow -> Red
  .interpolate(interpolateRgb);

interface MapViewProps {
  zones: ZoneResponse[];
  predictions: PredictionResponse[];
  selectedZoneId: number | null;
  onZoneSelect: (id: number) => void;
}

// Component to handle map resizing/invalidation
function MapUpdater() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

export function MapView({ zones, predictions, selectedZoneId, onZoneSelect }: MapViewProps) {
  // Map predictions to zones for O(1) lookup
  const predictionMap = useMemo(() => {
    const map = new Map<number, number>();
    predictions.forEach(p => map.set(p.zoneId, p.predictedDemand));
    return map;
  }, [predictions]);

  // Default center (NYC)
  const center: [number, number] = [40.7128, -74.0060];

  return (
    <div className="w-full h-full relative bg-black/20">
      <MapContainer 
        center={center} 
        zoom={11} 
        style={{ height: "100%", width: "100%", background: "transparent" }}
        className="z-0"
        zoomControl={false}
      >
        <MapUpdater />
        {/* Dark theme tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {zones.map((zone) => {
          // Parse GeoJSON geometry
          // Note: In a real app we'd validate this. Assuming schema ensures valid JSON.
          let coordinates: [number, number][][] | [number, number][][][] = [];
          try {
            const geo = zone.geometry as any;
            if (geo && geo.type === "Polygon") {
              coordinates = L.GeoJSON.coordsToLatLngs(geo.coordinates, 1) as any;
            } else if (geo && geo.type === "MultiPolygon") {
              coordinates = L.GeoJSON.coordsToLatLngs(geo.coordinates, 2) as any;
            }
          } catch (e) {
            console.error("Failed to parse geometry for zone", zone.id);
            return null;
          }

          const demand = predictionMap.get(zone.zoneId) || 0;
          const isSelected = selectedZoneId === zone.zoneId;

          return (
            <Polygon
              key={zone.id}
              positions={coordinates as any}
              pathOptions={{
                fillColor: getColor(demand),
                fillOpacity: isSelected ? 0.9 : 0.6,
                color: isSelected ? "#3b82f6" : "#ffffff", // Blue border if selected
                weight: isSelected ? 2 : 0.5,
                opacity: 0.8,
              }}
              eventHandlers={{
                click: () => onZoneSelect(zone.zoneId),
              }}
            >
              <Popup className="bg-card text-card-foreground border-border">
                <div className="p-2 min-w-[150px]">
                  <h3 className="font-bold text-sm mb-1">{zone.zoneName}</h3>
                  <div className="text-xs text-muted-foreground mb-2">{zone.borough}</div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/50">
                    <span className="text-xs font-mono uppercase">Demand</span>
                    <span className="font-bold text-primary">{Math.round(demand)} trips</span>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}
