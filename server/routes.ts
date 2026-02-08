import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register Integration Routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  // === API ROUTES ===

  app.get(api.zones.list.path, async (req, res) => {
    const zones = await storage.getZones();
    res.json(zones);
  });

  app.get(api.zones.get.path, async (req, res) => {
    const zone = await storage.getZone(Number(req.params.id));
    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }
    res.json(zone);
  });

  app.get(api.predictions.list.path, async (req, res) => {
    try {
      const input = api.predictions.list.input?.parse(req.query) || {};
      const startTime = input.startTime ? new Date(input.startTime) : undefined;
      const endTime = input.endTime ? new Date(input.endTime) : undefined;
      
      const predictions = await storage.getPredictions(
        input.zoneId,
        startTime,
        endTime
      );
      res.json(predictions);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid query params" });
      }
      throw err;
    }
  });

  // === SEED DATA ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const hasData = await storage.hasZones();
  if (hasData) return;

  console.log("Seeding database...");

  // Dummy Zones (based loosely on major NYC areas)
  const zonesData = [
    { zoneId: 1, borough: "Manhattan", zoneName: "Midtown Center", serviceZone: "Yellow Zone", geometry: { type: "Point", coordinates: [-73.9851, 40.7589] } },
    { zoneId: 2, borough: "Manhattan", zoneName: "Times Sq/Theatre District", serviceZone: "Yellow Zone", geometry: { type: "Point", coordinates: [-73.9855, 40.7580] } },
    { zoneId: 3, borough: "Queens", zoneName: "JFK Airport", serviceZone: "Airports", geometry: { type: "Point", coordinates: [-73.7781, 40.6413] } },
    { zoneId: 4, borough: "Brooklyn", zoneName: "Williamsburg (South Side)", serviceZone: "Boro Zone", geometry: { type: "Point", coordinates: [-73.9632, 40.7081] } },
    { zoneId: 5, borough: "Manhattan", zoneName: "Upper West Side South", serviceZone: "Yellow Zone", geometry: { type: "Point", coordinates: [-73.9780, 40.7736] } },
  ];

  const createdZones = [];
  for (const z of zonesData) {
    createdZones.push(await storage.createZone(z));
  }

  // Dummy Predictions for next 24 hours
  const now = new Date();
  for (const zone of createdZones) {
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      const baseDemand = zone.borough === "Manhattan" ? 500 : 100;
      const hourFactor = Math.sin((i + now.getHours()) / 24 * Math.PI * 2) + 1.5; // Simple daily cycle
      const demand = Math.round(baseDemand * hourFactor * (0.8 + Math.random() * 0.4));
      
      await storage.createPrediction({
        zoneId: zone.zoneId,
        timestamp: time,
        predictedDemand: demand,
        confidenceLow: demand * 0.9,
        confidenceHigh: demand * 1.1,
      });
    }
  }

  console.log("Seeding complete.");
}
