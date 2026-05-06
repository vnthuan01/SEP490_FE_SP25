import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface TeamOverviewItem {
  id: string;
  name: string;
  role: string;
  statusLabel: string;
  memberCount: number;
  note?: string;
  campaignName?: string;
  taskSummary?: string;
  rescueSummary?: string;
  topContributor?: string;
  badgeLabel?: string;
  badgeClassName?: string;
  tone?: 'busy' | 'ready' | 'warning';
}

const DEFAULT_TEAMS: TeamOverviewItem[] = [
  {
    id: 'team-1',
    name: 'Đội Cứu hộ 1',
    role: 'Tìm kiếm cứu nạn',
    statusLabel: 'Đang điều phối',
    memberCount: 12,
    note: 'Cập nhật từ đội hiện trường',
    tone: 'busy',
  },
  {
    id: 'team-2',
    name: 'Đội Y tế Hà Nội',
    role: 'Sơ cứu & Y tế',
    statusLabel: 'Sẵn sàng',
    memberCount: 8,
    note: 'Sẵn sàng tiếp nhận điều động',
    tone: 'ready',
  },
  {
    id: 'team-3',
    name: 'Đội Vận chuyển',
    role: 'Hậu cần',
    statusLabel: 'Cần theo dõi',
    memberCount: 15,
    note: 'Khối lượng điều phối cao',
    tone: 'warning',
  },
];

export function TeamOverview({
  className,
  title = 'Đội phản ứng nhanh',
  icon = 'groups_3',
  teams = DEFAULT_TEAMS,
}: {
  className?: string;
  title?: string;
  icon?: string;
  teams?: TeamOverviewItem[];
}) {
  return (
    <Card className={cn('bg-card border-border h-full overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className="material-symbols-outlined text-violet-600">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-2xl border border-border bg-gradient-to-br from-background to-muted/25 p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
                <div className="min-w-0 flex-[1.35] space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h4 className="line-clamp-2 cursor-help text-sm font-bold text-foreground">
                          {team.name}
                        </h4>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[320px] break-words">
                        {team.name}
                      </TooltipContent>
                    </Tooltip>
                    {team.badgeLabel ? (
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          team.badgeClassName || 'bg-slate-100 text-slate-700',
                        )}
                      >
                        {team.badgeLabel}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {team.role}
                  </p>

                  {team.campaignName ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="line-clamp-2 cursor-help text-xs text-foreground/80">
                          {team.campaignName}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[320px] break-words">
                        {team.campaignName}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}

                  <p className="text-sm font-semibold text-foreground">{team.statusLabel}</p>

                  {team.topContributor ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex max-w-full cursor-help items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2">
                          <span className="material-symbols-outlined text-[16px] text-amber-600">
                            military_tech
                          </span>
                          <p className="line-clamp-2 text-xs font-semibold text-amber-900">
                            {team.topContributor}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[320px] break-words">
                        {team.topContributor}
                      </TooltipContent>
                    </Tooltip>
                  ) : team.note ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="line-clamp-2 cursor-help text-[11px] text-muted-foreground">
                          {team.note}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[320px] break-words">
                        {team.note}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-border/80 bg-background/80 p-3 lg:max-w-[220px]">
                  <div className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    {team.memberCount} thành viên
                  </div>

                  {team.taskSummary ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-emerald-600">
                          assignment
                        </span>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Nhiệm vụ
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="mt-1 line-clamp-2 cursor-help text-xs font-semibold text-foreground">
                            {team.taskSummary}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[280px] break-words">
                          {team.taskSummary}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ) : null}
                  {team.rescueSummary ? (
                    <div className="rounded-xl border border-red-200 bg-red-50/70 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-red-600">
                          emergency
                        </span>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Cứu hộ
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="mt-1 line-clamp-2 cursor-help text-xs font-semibold text-foreground">
                            {team.rescueSummary}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[280px] break-words">
                          {team.rescueSummary}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
