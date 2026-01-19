import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CampaignProgressProps {
  completed: number;
  inProgress: number;
  pending: number;
  className?: string;
}

export function CampaignProgress({
  completed,
  inProgress,
  pending,
  className,
}: CampaignProgressProps) {
  const R = 40;
  const C = 2 * Math.PI * R;

  const completedOffset = C * (1 - completed / 100);
  const inProgressOffset = C * (1 - (completed + inProgress) / 100);

  return (
    <Card className={cn('bg-card border-border h-full p-4 flex flex-col items-center', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 w-full">
        <span className="material-symbols-outlined text-xl text-primary">azm</span>
        <h3 className="font-bold text-foreground">Tiến độ chiến dịch</h3>
      </div>

      {/* Chart */}
      <div className="relative size-40">
        {/* SVG DRAW */}
        <svg viewBox="0 0 100 100" className="size-full">
          {/* Pending */}
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            strokeWidth="10"
            stroke="currentColor"
            className="text-muted/30"
          />

          {/* In progress */}
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            strokeWidth="10"
            strokeDasharray={C}
            strokeDashoffset={inProgressOffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            stroke="currentColor"
            className="text-amber-400"
          />

          {/* Completed */}
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            strokeWidth="10"
            strokeDasharray={C}
            strokeDashoffset={completedOffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            stroke="currentColor"
            className="text-primary"
          />
        </svg>

        {/* TOOLTIP OVERLAY (HTML) */}
        <TooltipProvider>
          {/* Pending */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute inset-0 rounded-full cursor-help" />
            </TooltipTrigger>
            <TooltipContent>Chưa bắt đầu: {pending}%</TooltipContent>
          </Tooltip>

          {/* In progress */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute inset-2 rounded-full cursor-help" />
            </TooltipTrigger>
            <TooltipContent>Đang thực hiện: {inProgress}%</TooltipContent>
          </Tooltip>

          {/* Completed */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute inset-4 rounded-full cursor-help" />
            </TooltipTrigger>
            <TooltipContent>Đã hoàn thành: {completed}%</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-foreground">{completed}%</span>
          <span className="text-[10px] text-muted-foreground">Đã hoàn thành</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-6">
        <Legend color="bg-primary" label="Hoàn thành" value={completed} />
        <Legend color="bg-amber-400" label="Đang thực hiện" value={inProgress} />
        <Legend color="bg-muted" label="Chưa bắt đầu" value={pending} />
      </div>
    </Card>
  );
}

/* ===== Legend item ===== */
function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 text-xs p-1 cursor-help">
          <span className={cn('size-2 rounded-full p-1', color)} />
          <span className="text-muted-foreground">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {value}% {label}
      </TooltipContent>
    </Tooltip>
  );
}
