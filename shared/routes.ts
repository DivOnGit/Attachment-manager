import { z } from 'zod';
import { insertZoneSchema, insertPredictionSchema, zones, predictions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  zones: {
    list: {
      method: 'GET' as const,
      path: '/api/zones' as const,
      responses: {
        200: z.array(z.custom<typeof zones.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/zones/:id' as const,
      responses: {
        200: z.custom<typeof zones.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  predictions: {
    list: {
      method: 'GET' as const,
      path: '/api/predictions' as const,
      input: z.object({
        startTime: z.string().optional(), // ISO string
        endTime: z.string().optional(),   // ISO string
        zoneId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof predictions.$inferSelect>()),
      },
    },
  },
  // We will likely interact with the chat via the integration's routes, 
  // but we can define custom analytics endpoints here if needed.
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ZoneResponse = z.infer<typeof api.zones.list.responses[200]>[number];
export type PredictionResponse = z.infer<typeof api.predictions.list.responses[200]>[number];
