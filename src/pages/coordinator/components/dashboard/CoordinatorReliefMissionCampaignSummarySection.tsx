import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ReliefMissionCampaignSummaryItem = {
  campaignId: string;
  campaignName: string;
  campaignStatus: string;
  teamCount: number;
  taskCount: number;
  blockedTaskCount: number;
  totalSubTaskCount: number;
  completedSubTaskCount: number;
  inProgressSubTaskCount: number;
};

export function CoordinatorReliefMissionCampaignSummarySection({
  items,
  formatNumberVN,
  renderStatusChip,
  renderEmphasisNumber,
}: {
  items: ReliefMissionCampaignSummaryItem[];
  formatNumberVN: any;
  renderStatusChip: any;
  renderEmphasisNumber: any;
}) {
  if (items.length === 0) return null;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <span className="material-symbols-outlined text-primary">campaign</span>
          Tổng hợp theo chiến dịch
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.campaignId}
              className="rounded-2xl border border-border bg-muted/20 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-base font-bold text-foreground">{item.campaignName}</p>
                  <div className="flex flex-wrap gap-2">
                    {renderStatusChip(item.campaignStatus)}
                  </div>
                </div>
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <span className="material-symbols-outlined text-[20px]">campaign</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Số đội</p>
                  <div className="mt-2">
                    {renderEmphasisNumber(formatNumberVN(item.teamCount), 'info')}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Số nhiệm vụ</p>
                  <div className="mt-2">
                    {renderEmphasisNumber(formatNumberVN(item.taskCount), 'info')}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Nhiệm vụ bị chặn</p>
                  <div className="mt-2">
                    {renderEmphasisNumber(
                      formatNumberVN(item.blockedTaskCount),
                      item.blockedTaskCount > 0 ? 'warning' : 'info',
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background px-3 py-3">
                  <p className="text-xs text-muted-foreground">Công việc con đang làm</p>
                  <div className="mt-2">
                    {renderEmphasisNumber(formatNumberVN(item.inProgressSubTaskCount), 'info')}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-emerald-200/60 bg-emerald-50/60 px-3 py-3">
                <p className="text-xs text-emerald-700">Tiến độ công việc con</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  {renderEmphasisNumber(
                    `${formatNumberVN(item.completedSubTaskCount)} / ${formatNumberVN(item.totalSubTaskCount)}`,
                    'success',
                  )}
                  <p className="text-xs text-muted-foreground">Hoàn thành / Tổng</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
