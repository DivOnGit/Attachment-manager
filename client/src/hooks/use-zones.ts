import { useQuery } from "@tanstack/react-query";
import { api, type ZoneResponse } from "@shared/routes";

export function useZones() {
  return useQuery({
    queryKey: [api.zones.list.path],
    queryFn: async () => {
      const res = await fetch(api.zones.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch zones");
      const data = await res.json();
      return api.zones.list.responses[200].parse(data);
    },
    staleTime: Infinity, // Zones don't change often
  });
}

export function useZone(id: number | null) {
  return useQuery({
    queryKey: [api.zones.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(api.zones.get.path.replace(":id", id.toString()), { 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to fetch zone");
      const data = await res.json();
      return api.zones.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}
