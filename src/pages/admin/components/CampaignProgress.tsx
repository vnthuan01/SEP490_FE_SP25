import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
    <Card
      className={cn(
        'bg-card border-border h-full flex flex-col items-center justify-center p-6',
        className,
      )}
    >
      <h3 className="text-left w-full font-bold mb-4 text-foreground">Tiến độ chiến dịch</h3>

      <div className="relative size-40">
        <svg viewBox="0 0 100 100" className="size-full">
          {/* Pending (base – xám nhạt) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                strokeWidth="10"
                stroke="currentColor"
                className="text-muted/30 cursor-help"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Chưa bắt đầu: {pending}%</p>
            </TooltipContent>
          </Tooltip>

          {/* In progress (vàng) */}
          <Tooltip>
            <TooltipTrigger asChild>
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
                className="text-amber-400 cursor-help"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Đang thực hiện: {inProgress}%</p>
            </TooltipContent>
          </Tooltip>

          {/* Completed (xanh) */}
          <Tooltip>
            <TooltipTrigger asChild>
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
                className="text-primary cursor-help"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Đã hoàn thành: {completed}%</p>
            </TooltipContent>
          </Tooltip>
        </svg>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-foreground">{completed}%</span>
          <span className="text-[10px] text-muted-foreground">Đã hoàn thành</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-xs cursor-help">
              <div className="size-2 rounded-full bg-primary"></div>
              <span className="text-muted-foreground">Completed</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{completed}% Đã hoàn thành</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-xs cursor-help">
              <div className="size-2 rounded-full bg-amber-400"></div>
              <span className="text-muted-foreground">In progress</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{inProgress}% Đang thực hiện</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-xs cursor-help">
              <div className="size-2 rounded-full bg-muted"></div>
              <span className="text-muted-foreground">Pending</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{pending}% Chưa bắt đầu</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </Card>
  );
}
