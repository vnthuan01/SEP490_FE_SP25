import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ReliefTeamMissionSnapshotItem = {
  campaignTeamId: string;
  teamId: string;
  teamName: string;
  teamType?: string | null;
  campaignName: string;
  campaignStatus: string;
  campaignTeamStatus: string;
  totalTasks: number;
  plannedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  totalSubTasks: number;
  assignedSubTasks: number;
  inProgressSubTasks: number;
  completedSubTasks: number;
  failedSubTasks: number;
  cancelledSubTasks: number;
  householdCount: number;
  pendingHouseholdCount: number;
  deliveredHouseholdCount: number;
  totalDeliveryCount: number;
  pendingDeliveryCount: number;
  deliveredDeliveryCount: number;
  defaultReliefPackageName?: string | null;
  lastTaskUpdatedAt?: string | null;
};

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function CoordinatorReliefTeamMissionsSection({
  items,
  translateTeamTypeLabel,
  formatNumberVN,
  formatDateTime,
  renderStatusChip,
  renderEmphasisNumber,
}: {
  items: ReliefTeamMissionSnapshotItem[];
  translateTeamTypeLabel: (value?: string | null) => string;
  formatNumberVN: (value: number) => string;
  formatDateTime: (value?: string | null) => string;
  renderStatusChip: (value?: string | null) => ReactNode;
  renderEmphasisNumber: (
    value: string,
    tone: 'success' | 'warning' | 'destructive' | 'info',
  ) => ReactNode;
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <span className="material-symbols-outlined text-emerald-600">volunteer_activism</span>
          Nhiệm vụ cứu trợ theo đội
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đội</TableHead>
                <TableHead>Chiến dịch</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Nhiệm vụ</TableHead>
                <TableHead className="text-right">Tiến độ hoàn thành</TableHead>
                <TableHead className="text-right">Đang xử lý</TableHead>
                <TableHead className="text-right">Bị chặn</TableHead>
                <TableHead className="text-right">Cập nhật cuối</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                return (
                  <TableRow key={`${item.campaignTeamId}-${item.teamId}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.teamName}</div>
                        <div className="text-xs text-muted-foreground">
                          {translateTeamTypeLabel(item.teamType) || 'Chưa rõ'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.campaignName}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatNumberVN(item.totalTasks)} nhiệm vụ /{' '}
                          {formatNumberVN(item.totalSubTasks)} công việc con
                        </div>
                        {item.householdCount > 0 || item.totalDeliveryCount > 0 ? (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {item.householdCount > 0
                              ? `${formatNumberVN(item.householdCount)} hộ`
                              : null}
                            {item.pendingHouseholdCount > 0
                              ? ` • ${formatNumberVN(item.pendingHouseholdCount)} hộ chờ giao`
                              : null}
                            {item.deliveredHouseholdCount > 0
                              ? ` • ${formatNumberVN(item.deliveredHouseholdCount)} hộ đã giao`
                              : null}
                            {item.totalDeliveryCount > 0
                              ? ` • ${formatNumberVN(item.totalDeliveryCount)} lượt giao`
                              : null}
                          </div>
                        ) : null}
                        {item.defaultReliefPackageName ? (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Gói mặc định: {item.defaultReliefPackageName}
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2 [&>*]:whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                          <span className="font-semibold">Chiến dịch:</span>
                          {renderStatusChip(item.campaignStatus)}
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                          <span className="font-semibold">Đội:</span>
                          {renderStatusChip(item.campaignTeamStatus)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {renderEmphasisNumber(
                        `${formatNumberVN(item.completedTasks)} / ${formatNumberVN(item.totalTasks)}`,
                        'success',
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderEmphasisNumber(
                        `${formatNumberVN(item.completedSubTasks)} / ${formatNumberVN(item.totalSubTasks)}`,
                        'success',
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        {renderEmphasisNumber(
                          `${formatNumberVN(item.inProgressTasks)} nhiệm vụ`,
                          'info',
                        )}
                        {item.assignedSubTasks > 0 || item.inProgressSubTasks > 0 ? (
                          <span className="text-xs text-muted-foreground">
                            {item.assignedSubTasks > 0
                              ? `${formatNumberVN(item.assignedSubTasks)} đã giao`
                              : 'Chưa có phần việc ở trạng thái đã giao'}
                            {item.inProgressSubTasks > 0
                              ? ` • ${formatNumberVN(item.inProgressSubTasks)} công việc con đang được xử lý`
                              : ''}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Chưa có công việc con đang hoạt động
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {renderEmphasisNumber(
                        formatNumberVN(item.blockedTasks),
                        item.blockedTasks > 0 ? 'warning' : 'info',
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDateTime(item.lastTaskUpdatedAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="Chưa có nhiệm vụ cứu trợ"
            description="Khi các đội cứu trợ được gán campaign task, bảng này sẽ hiển thị chiến dịch đang làm và tiến độ subtask hoàn thành."
          />
        )}
      </CardContent>
    </Card>
  );
}
