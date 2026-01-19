import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TimeTracker({ className }: { className?: string }) {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime((time) => time + 1);
      }, 1000);
    } else if (!isActive && time !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const stopTimer = () => {
    setIsActive(false);
    setTime(0);
  };

  return (
    <Card
      className={cn(
        'bg-primary text-primary-foreground border-none overflow-hidden relative',
        className,
      )}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M0 100 Q 25 50 50 100 T 100 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          <path
            d="M0 100 Q 30 40 60 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.5"
          />
        </svg>
      </div>
      <CardHeader className="relative z-10 pb-2">
        <CardTitle className="text-sm font-medium text-primary-foreground/80">
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col items-center justify-center gap-6 pb-8">
        <div className="text-5xl font-mono font-bold tracking-wider">{formatTime(time)}</div>
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            onClick={toggleTimer}
            className={cn(
              'rounded-full w-12 h-12 transition-all border-2',
              isActive
                ? 'bg-transparent border-white text-white hover:bg-white/10'
                : 'bg-primary text-primary-foreground  border-white',
            )}
          >
            {isActive ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
          </Button>
          <Button
            size="icon"
            onClick={stopTimer}
            className="rounded-full w-12 h-12 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30"
          >
            <Square className="fill-current size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
