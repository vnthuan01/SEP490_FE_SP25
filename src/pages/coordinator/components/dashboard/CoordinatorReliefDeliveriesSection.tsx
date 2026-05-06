import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CoordinatorListPagination } from '../CoordinatorListPagination';

type ReliefDeliveryItem = {
  householdCode: string;
  headOfHouseholdName: string;
  address: string;
  teamName?: string | null;
  deliveryMode: string;
  deliveredPackageNames: string[];
  pendingPackageNames: string[];
  fulfillmentStatus: string;
};

type PaginationData = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function CoordinatorReliefDeliveriesSection({
  rows,
  pagination,
  onPageChange,
  translateDeliveryModeLabel,
  renderStatusChip,
  formatNumberVN,
}: {
  rows: ReliefDeliveryItem[];
  pagination: PaginationData | null;
  onPageChange: any;
  translateDeliveryModeLabel: any;
  renderStatusChip: any;
  formatNumberVN: any;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Không có dữ liệu"
        description="Báo cáo giao cứu trợ sẽ hiển thị khi API có kết quả."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã hộ</TableHead>
            <TableHead>Chủ hộ</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Đội</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Đã giao</TableHead>
            <TableHead>Còn thiếu</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={`${item.householdCode}-${item.headOfHouseholdName}`}>
              <TableCell className="font-medium">{item.householdCode}</TableCell>
              <TableCell>{item.headOfHouseholdName}</TableCell>
              <TableCell>{item.address}</TableCell>
              <TableCell>{item.teamName || 'Chưa gán'}</TableCell>
              <TableCell>{translateDeliveryModeLabel(item.deliveryMode)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {item.deliveredPackageNames.length > 0 ? (
                    item.deliveredPackageNames.map((name) => (
                      <Badge key={name} variant="success" appearance="outline" size="sm">
                        {name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Chưa có</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {item.pendingPackageNames.length > 0 ? (
                    item.pendingPackageNames.map((name) => (
                      <Badge key={name} variant="warning" appearance="outline" size="sm">
                        {name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Không còn thiếu</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{renderStatusChip(item.fulfillmentStatus)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination ? (
        <CoordinatorListPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          summary={`Hiển thị ${rows.length} / ${formatNumberVN(pagination.totalCount)} hộ`}
        />
      ) : null}
    </>
  );
}
