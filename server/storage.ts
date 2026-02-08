import { db } from "./db";
import { 
  zones, predictions, 
  type Zone, type InsertZone, 
  type Prediction, type InsertPrediction 
} from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Zones
  getZones(): Promise<Zone[]>;
  getZone(id: number): Promise<Zone | undefined>;
  createZone(zone: InsertZone): Promise<Zone>;
  
  // Predictions
  getPredictions(zoneId?: number, startTime?: Date, endTime?: Date): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  
  // Seeding helper
  hasZones(): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getZones(): Promise<Zone[]> {
    return await db.select().from(zones);
  }

  async getZone(id: number): Promise<Zone | undefined> {
    const [zone] = await db.select().from(zones).where(eq(zones.id, id));
    return zone;
  }

  async createZone(zone: InsertZone): Promise<Zone> {
    const [newZone] = await db.insert(zones).values(zone).returning();
    return newZone;
  }

  async getPredictions(zoneId?: number, startTime?: Date, endTime?: Date): Promise<Prediction[]> {
    let query = db.select().from(predictions).$dynamic();
    
    const conditions = [];
    if (zoneId) conditions.push(eq(predictions.zoneId, zoneId));
    if (startTime) conditions.push(gte(predictions.timestamp, startTime));
    if (endTime) conditions.push(lte(predictions.timestamp, endTime));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query;
  }

  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const [newPrediction] = await db.insert(predictions).values(prediction).returning();
    return newPrediction;
  }

  async hasZones(): Promise<boolean> {
    const result = await db.select({ id: zones.id }).from(zones).limit(1);
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
