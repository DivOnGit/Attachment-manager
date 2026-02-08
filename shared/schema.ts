import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/chat";

// === TABLE DEFINITIONS ===

export const zones = pgTable("zones", {
  id: serial("id").primaryKey(),
  zoneId: integer("zone_id").notNull().unique(), // TLC Zone ID
  borough: text("borough").notNull(),
  zoneName: text("zone_name").notNull(),
  serviceZone: text("service_zone").notNull(),
  // Storing geometry as GeoJSON string for simplicity in this demo
  geometry: jsonb("geometry"), 
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  zoneId: integer("zone_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  predictedDemand: doublePrecision("predicted_demand").notNull(), // Predicted trip count
  confidenceLow: doublePrecision("confidence_low"),
  confidenceHigh: doublePrecision("confidence_high"),
});

// === SCHEMAS ===

export const insertZoneSchema = createInsertSchema(zones).omit({ id: true });
export const insertPredictionSchema = createInsertSchema(predictions).omit({ id: true });

// === TYPES ===

export type Zone = typeof zones.$inferSelect;
export type InsertZone = z.infer<typeof insertZoneSchema>;

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;

export type ZoneWithPredictions = Zone & {
  currentPrediction?: number;
};
