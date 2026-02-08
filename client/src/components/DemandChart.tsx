import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { format, parseISO } from "date-fns";
import type { PredictionResponse } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface DemandChartProps {
  data: PredictionResponse[];
  zoneName?: string;
}

export function DemandChart({ data, zoneName }: DemandChartProps) {
  const chartData = data.map(d => ({
    time: parseISO(d.timestamp as unknown as string),
    value: d.predictedDemand,
    low: d.confidenceLow,
    high: d.confidenceHigh,
  })).sort((a, b) => a.time.getTime() - b.time.getTime());

  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed border-muted">
        Select a zone to view forecast
      </div>
    );
  }

  return (
    <Card className="shadow-lg border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span>24h Demand Forecast</span>
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {zoneName || "Select Zone"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="time" 
                tickFormatter={(date) => format(date, "HH:mm")}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))"
                }}
                labelFormatter={(label) => format(label, "MMM d, HH:mm")}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
