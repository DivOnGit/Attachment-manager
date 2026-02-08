import { Slider } from "@/components/ui/slider";
import { format, addHours } from "date-fns";
import { Play, Pause, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

interface TimeSliderProps {
  currentDate: Date;
  onChange: (date: Date) => void;
}

export function TimeSlider({ currentDate, onChange }: TimeSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // 24h simulation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        onChange(addHours(currentDate, 1));
      }, 1000); // 1 sec = 1 hour in sim
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentDate, onChange]);

  // Convert current date to hour offset (0-23) for slider
  const currentHour = currentDate.getHours();

  const handleSliderChange = (value: number[]) => {
    const newDate = new Date(currentDate);
    newDate.setHours(value[0]);
    onChange(newDate);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[400px] z-[1000] bg-background/90 backdrop-blur-md border border-border/50 rounded-full shadow-2xl p-2 px-6 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </Button>

      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-muted-foreground px-1">
          <span>00:00</span>
          <span className="text-primary font-bold flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {format(currentDate, "HH:mm")}
          </span>
          <span>23:00</span>
        </div>
        <Slider
          value={[currentHour]}
          max={23}
          step={1}
          onValueChange={handleSliderChange}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}
