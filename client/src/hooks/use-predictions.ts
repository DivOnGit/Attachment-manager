import { useQuery } from "@tanstack/react-query";
import { api, type PredictionResponse, buildUrl } from "@shared/routes";

export function usePredictions(params: { startTime?: string; endTime?: string; zoneId?: number }) {
  // Create a stable query key based on params
  const queryKey = [api.predictions.list.path, params];

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query string manually since backend expects specific params
      const queryParams: Record<string, any> = {};
      if (params.startTime) queryParams.startTime = params.startTime;
      if (params.endTime) queryParams.endTime = params.endTime;
      if (params.zoneId) queryParams.zoneId = params.zoneId;

      const url = new URL(api.predictions.list.path, window.location.origin);
      Object.keys(queryParams).forEach(key => 
        url.searchParams.append(key, String(queryParams[key]))
      );

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch predictions");
      
      const data = await res.json();
      return api.predictions.list.responses[200].parse(data);
    },
  });
}
