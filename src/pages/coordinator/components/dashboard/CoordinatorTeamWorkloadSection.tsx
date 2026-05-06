import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type TeamWorkloadItem = {
  teamId: string;
  teamName: string;
  assignedRequests: number;
  completedRequests: number;
  activeBatchCount: number;
  memberCount: number;
  pendingHouseholdCount: number;
  deliveredHouseholdCount: number;
  totalDeliveryCount: number;
  deliveredDeliveryCount: number;
};

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function CoordinatorTeamWorkloadSection({
  rescueRows,
  reliefRows,
  formatNumberVN,
}: {
  rescueRows: TeamWorkloadItem[];
  reliefRows: TeamWorkloadItem[];
  formatNumberVN: (value: number) => string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-600">emergency</span>
          <h3 className="text-sm font-bold text-foreground">Đội cứu hộ</h3>
        </div>
        {rescueRows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đội</TableHead>
                <TableHead className="text-right">Yêu cầu đã gán</TableHead>
                <TableHead className="text-right">Yêu cầu hoàn thành</TableHead>
                <TableHead className="text-right">Batch hoạt động</TableHead>
                <TableHead className="text-right">Thành viên</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rescueRows.map((item) => (
                <TableRow key={item.teamId}>
                  <TableCell className="font-medium">{item.teamName}</TableCell>
                  <TableCell className="text-right">
                    {formatNumberVN(item.assignedRequests)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumberVN(item.completedRequests)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumberVN(item.activeBatchCount)}
                  </TableCell>
                  <TableCell className="text-right">{formatNumberVN(item.memberCount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="Chưa có đội cứu hộ"
            description="Không có dữ liệu tải đội cứu hộ trong khoảng thời gian đã chọn."
          />
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">volunteer_activism</span>
          <h3 className="text-sm font-bold text-foreground">Đội cứu trợ</h3>
        </div>
        {reliefRows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đội</TableHead>
                <TableHead className="text-right">Hộ chờ giao</TableHead>
                <TableHead className="text-right">Hộ đã giao</TableHead>
                <TableHead className="text-right">Lượt giao</TableHead>
                <TableHead className="text-right">Đã giao xong</TableHead>
                <TableHead className="text-right">Thành viên</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reliefRows.map((item) => (
                <TableRow key={item.teamId}>
                  <TableCell className="font-medium">{item.teamName}</TableCell>
                  <TableCell className="text-right">
                    {formatNumberVN(item.pendingHouseholdCount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumberVN(item.deliveredHouseholdCount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumberVN(item.totalDeliveryCount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumberVN(item.deliveredDeliveryCount)}
                  </TableCell>
                  <TableCell className="text-right">{formatNumberVN(item.memberCount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="Chưa có đội cứu trợ"
            description="Không có dữ liệu tải đội cứu trợ trong khoảng thời gian đã chọn."
          />
        )}
      </div>
    </div>
  );
}
