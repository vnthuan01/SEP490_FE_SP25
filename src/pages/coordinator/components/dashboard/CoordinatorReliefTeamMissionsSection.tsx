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

type ReliefTeamTaskSummaryTask = {
  status: string;
  totalSubTasks: number;
  completedSubTasks: number;
  inProgressSubTasks: number;
  lastUpdatedAt?: string | null;
};

type ReliefTeamTaskSummaryItem = {
  campaignTeamId: string;
  teamId: string;
  teamName: string;
  teamType?: string | null;
  campaignName: string;
  campaignStatus: string;
  campaignTeamStatus: string;
  householdCount: number;
  pendingHouseholdCount: number;
  deliveredHouseholdCount: number;
  totalDeliveryCount: number;
  defaultReliefPackageName?: string | null;
  tasks: ReliefTeamTaskSummaryTask[];
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
  items: ReliefTeamTaskSummaryItem[];
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
                const completedTasks = item.tasks.filter((task) =>
                  task.status.toLowerCase().includes('completed'),
                ).length;
                const inProgressTasks = item.tasks.filter((task) =>
                  task.status.toLowerCase().includes('inprogress'),
                ).length;
                const blockedTasks = item.tasks.filter((task) =>
                  task.status.toLowerCase().includes('blocked'),
                ).length;
                const totalSubTasks = item.tasks.reduce((sum, task) => sum + task.totalSubTasks, 0);
                const completedSubTasks = item.tasks.reduce(
                  (sum, task) => sum + task.completedSubTasks,
                  0,
                );
                const inProgressSubTasks = item.tasks.reduce(
                  (sum, task) => sum + task.inProgressSubTasks,
                  0,
                );
                const lastUpdatedAt =
                  item.tasks
                    .map((task) => task.lastUpdatedAt)
                    .filter(Boolean)
                    .sort()
                    .slice(-1)[0] || null;

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
                          {formatNumberVN(item.tasks.length)} nhiệm vụ /{' '}
                          {formatNumberVN(totalSubTasks)} công việc con
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatNumberVN(item.householdCount)} hộ •{' '}
                          {formatNumberVN(item.pendingHouseholdCount)} hộ chờ giao •{' '}
                          {formatNumberVN(item.deliveredHouseholdCount)} hộ đã giao
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatNumberVN(item.totalDeliveryCount)} lượt giao • Gói mặc định:{' '}
                          {item.defaultReliefPackageName || 'Chưa cấu hình'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {renderStatusChip(item.campaignStatus)}
                        {renderStatusChip(item.campaignTeamStatus)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {renderEmphasisNumber(
                        `${formatNumberVN(completedTasks)} / ${formatNumberVN(item.tasks.length)}`,
                        'success',
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderEmphasisNumber(
                        `${formatNumberVN(completedSubTasks)} / ${formatNumberVN(totalSubTasks)}`,
                        'success',
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        {renderEmphasisNumber(
                          `${formatNumberVN(inProgressTasks)} nhiệm vụ`,
                          'info',
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatNumberVN(inProgressSubTasks)} công việc con
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {renderEmphasisNumber(
                        formatNumberVN(blockedTasks),
                        blockedTasks > 0 ? 'warning' : 'info',
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDateTime(lastUpdatedAt)}
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
