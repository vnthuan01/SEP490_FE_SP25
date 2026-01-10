import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TimePickerProps {
  value?: string; // "HH:mm:ss.fffffff"
  onChange?: (timeString: string) => void;
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const parseTime = (timeStr?: string) => {
    if (!timeStr) return { hour: 9, minute: 0 };
    const match = timeStr.match(/^(\d{2}):(\d{2})/);
    if (match) return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) };
    return { hour: 9, minute: 0 };
  };

  const initial = parseTime(value);

  const [hour, setHour] = React.useState<number>(initial.hour);
  const [minute, setMinute] = React.useState<number>(initial.minute);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const emitChange = (h: number, m: number) => {
    const formatted = `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:00.0000000`;
    onChange?.(formatted);
  };

  const handleHourChange = (newHour: number) => {
    setHour(newHour);
    emitChange(newHour, minute);
  };

  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute);
    emitChange(hour, newMinute);
  };

  React.useEffect(() => {
    if (value) {
      const { hour: h, minute: m } = parseTime(value);
      setHour(h);
      setMinute(m);
    }
  }, [value]);

  return (
    <div className="w-full max-w-[200px]">
      <div className="border rounded-md p-3 shadow-sm w-full bg-background">
        <div className="flex items-center justify-center gap-4">
          {/* Hour */}
          <div className="flex flex-col items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleHourChange(Math.max(0, hour - 1))}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <select
              className="border rounded-md px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary w-16"
              value={hour}
              onChange={(e) => handleHourChange(Number(e.target.value))}
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleHourChange(Math.min(23, hour + 1))}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-lg font-bold">:</div>

          {/* Minute */}
          <div className="flex flex-col items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleMinuteChange(Math.max(0, minute - 1))}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <select
              className="border rounded-md px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary w-16"
              value={minute}
              onChange={(e) => handleMinuteChange(Number(e.target.value))}
            >
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleMinuteChange(Math.min(59, minute + 1))}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
