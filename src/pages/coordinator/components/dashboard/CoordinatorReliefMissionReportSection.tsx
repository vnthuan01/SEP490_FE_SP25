import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type ReliefMissionReportRowItem = {
  campaignTaskId: string;
  campaignName: string;
  campaignStatus: string;
  teamName: string;
  teamType: string;
  campaignTaskTitle: string;
  taskStartDate: string;
  taskDueDate?: string | null;
  campaignTaskStatus: string;
  campaignTeamStatus: string;
  assignedSubTasks: number;
  inProgressSubTasks: number;
  completedSubTasks: number;
  totalSubTasks: number;
  failedSubTasks: number;
  cancelledSubTasks: number;
};

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function CoordinatorReliefMissionReportSection({
  isLoading,
  rows,
  formatDate,
  formatNumberVN,
  translateStatusLabel,
  renderStatusChip,
  renderEmphasisNumber,
}: {
  isLoading: boolean;
  rows: ReliefMissionReportRowItem[];
  formatDate: any;
  formatNumberVN: any;
  translateStatusLabel: any;
  renderStatusChip: any;
  renderEmphasisNumber: any;
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <span className="material-symbols-outlined text-emerald-600">assignment</span>
          Báo cáo chi tiết nhiệm vụ cứu trợ
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? null : rows.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <Table className="min-w-[1080px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Chiến dịch</TableHead>
                  <TableHead className="min-w-[160px]">Đội</TableHead>
                  <TableHead className="min-w-[240px]">Nhiệm vụ</TableHead>
                  <TableHead className="min-w-[220px]">Trạng thái</TableHead>
                  <TableHead className="text-right min-w-[110px]">Đã giao</TableHead>
                  <TableHead className="text-right min-w-[110px]">Đang làm</TableHead>
                  <TableHead className="text-right min-w-[140px]">Đã hoàn thành</TableHead>
                  <TableHead className="text-right min-w-[110px]">Bị chặn</TableHead>
                  <TableHead className="text-right min-w-[140px]">Thất bại / Hủy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item) => (
                  <TableRow key={item.campaignTaskId} className="align-top">
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="font-medium leading-snug">{item.campaignName}</div>
                        <div className="text-xs text-muted-foreground">
                          {translateStatusLabel(item.campaignStatus)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="font-medium leading-snug">{item.teamName}</div>
                        <div className="text-xs text-muted-foreground">{item.teamType}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="font-medium leading-snug">{item.campaignTaskTitle}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(item.taskStartDate)} - {formatDate(item.taskDueDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-wrap gap-2 [&>*]:whitespace-nowrap">
                        {renderStatusChip(item.campaignTaskStatus)}
                        {renderStatusChip(item.campaignTeamStatus)}
                        {item.campaignTaskStatus.toLowerCase().includes('blocked') ? (
                          <Badge variant="warning" appearance="outline" size="sm">
                            Nhiệm vụ bị chặn
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      {renderEmphasisNumber(formatNumberVN(item.assignedSubTasks), 'warning')}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      {renderEmphasisNumber(formatNumberVN(item.inProgressSubTasks), 'info')}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      {renderEmphasisNumber(
                        `${formatNumberVN(item.completedSubTasks)} / ${formatNumberVN(item.totalSubTasks)}`,
                        'success',
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      {renderEmphasisNumber(
                        item.campaignTaskStatus.toLowerCase().includes('blocked') ? 'Có' : 'Không',
                        item.campaignTaskStatus.toLowerCase().includes('blocked')
                          ? 'warning'
                          : 'info',
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      {renderEmphasisNumber(
                        `${formatNumberVN(item.failedSubTasks)} / ${formatNumberVN(item.cancelledSubTasks)}`,
                        item.failedSubTasks > 0 || item.cancelledSubTasks > 0
                          ? 'destructive'
                          : 'info',
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            title="Không có báo cáo nhiệm vụ cứu trợ"
            description="Chưa có nhiệm vụ cứu trợ phù hợp với bộ lọc đội và khoảng ngày hiện tại của trạm."
          />
        )}
      </CardContent>
    </Card>
  );
}
