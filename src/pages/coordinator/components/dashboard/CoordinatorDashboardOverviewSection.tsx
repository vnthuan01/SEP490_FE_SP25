import type { ReactNode } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RescueRequestLocationsMapCard } from '@/pages/coordinator/components/RescueRequestLocationsMapCard';
import type { RescueRequestLocationItem } from '@/services/stationDashboardService';

type MetricCardProps = {
  title: string;
  value: string;
  note?: string;
  icon: string;
  tone?: 'info' | 'success' | 'warning' | 'destructive';
};

type ActiveDispatchItem = {
  operationId: string;
  teamName: string;
  address?: string | null;
  status: string;
  lastTrackedAt?: string | null;
  vehicles: Array<{ vehicleId: string; vehicleName?: string | null; isPrimary: boolean }>;
};

type TeamPerformanceItem = {
  teamId: string;
  teamName: string;
  teamType?: string | null;
  assignedRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  lastTrackedAt?: string | null;
};

type VehicleTypeChartItem = {
  name: string;
  available: number;
  busy: number;
  total: number;
};

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function CoordinatorDashboardOverviewSection({
  metricCards,
  rescueStatusChart,
  rescueTypeChart,
  rescueLocationItems,
  isRescueLocationsLoading,
  vehicleTypeChart,
  totalVehicles,
  activeDispatch,
  teamTable,
  chartColors,
  formatNumberVN,
  formatDateTime,
  translateTeamTypeLabel,
  renderMetricCard,
  renderStatusChip,
}: {
  metricCards: MetricCardProps[];
  rescueStatusChart: Array<{ name: string; value: number }>;
  rescueTypeChart: Array<{ name: string; value: number }>;
  rescueLocationItems: RescueRequestLocationItem[];
  isRescueLocationsLoading?: boolean;
  vehicleTypeChart: VehicleTypeChartItem[];
  totalVehicles: number;
  activeDispatch: ActiveDispatchItem[];
  teamTable: TeamPerformanceItem[];
  chartColors: string[];
  formatNumberVN: (value: number) => string;
  formatDateTime: (value?: string | null) => string;
  translateTeamTypeLabel: (value?: string | null) => string;
  renderMetricCard: (props: MetricCardProps) => ReactNode;
  renderStatusChip: (value?: string | null) => ReactNode;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metricCards.map((card) => (
          <div key={card.title}>{renderMetricCard(card)}</div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <span className="material-symbols-outlined text-sky-600">donut_small</span>
              Tình trạng yêu cầu cứu hộ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rescueStatusChart.length > 0 ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rescueStatusChart}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={96}
                      paddingAngle={3}
                    >
                      {rescueStatusChart.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="Chưa có dữ liệu"
                description="Biểu đồ sẽ hiển thị khi API trả dữ liệu."
              />
            )}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {rescueStatusChart.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
                >
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-semibold text-foreground">
                    {formatNumberVN(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <span className="material-symbols-outlined text-emerald-600">category</span>
              Loại yêu cầu cứu hộ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rescueTypeChart.length > 0 ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rescueTypeChart}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={96}
                      paddingAngle={3}
                    >
                      {rescueTypeChart.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="Chưa có dữ liệu"
                description="Biểu đồ sẽ hiển thị khi API trả dữ liệu."
              />
            )}
            <div className="grid grid-cols-1 gap-2 text-xs">
              {rescueTypeChart.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
                >
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-semibold text-foreground">
                    {formatNumberVN(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <span className="material-symbols-outlined text-violet-600">local_shipping</span>
              Loại xe và số lượng
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicleTypeChart.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={vehicleTypeChart}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Bar
                        dataKey="available"
                        name="Sẵn sàng"
                        fill="#14b8a6"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={30}
                      />
                      <Bar
                        dataKey="busy"
                        name="Đang bận"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {vehicleTypeChart.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
                    >
                      <span className="material-symbols-outlined text-sm text-muted-foreground">
                        directions_car
                      </span>
                      <span className="text-muted-foreground">
                        {item.name} - {formatNumberVN(item.total)} xe
                      </span>
                      <span className="ml-auto font-semibold text-foreground">
                        Sẵn sàng {formatNumberVN(item.available)} / Bận {formatNumberVN(item.busy)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2">
                    <span className="material-symbols-outlined text-sm text-muted-foreground">
                      garage
                    </span>
                    <span className="text-muted-foreground">Tổng xe trong trạm</span>
                    <span className="ml-auto font-semibold text-foreground">
                      {formatNumberVN(totalVehicles)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Chưa có dữ liệu"
                description="Không có dữ liệu loại xe trong trạm."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <RescueRequestLocationsMapCard
        items={rescueLocationItems}
        isLoading={isRescueLocationsLoading}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border bg-card xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <span className="material-symbols-outlined text-primary">route</span>
              Điều phối đang hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeDispatch.length > 0 ? (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {activeDispatch.map((item) => (
                  <div
                    key={item.operationId}
                    className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{item.teamName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.address || 'Chưa có địa chỉ'}
                        </p>
                      </div>
                      {renderStatusChip(item.status)}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {item.vehicles.map((vehicle) => (
                        <Badge
                          key={vehicle.vehicleId}
                          variant={vehicle.isPrimary ? 'primary' : 'outline'}
                          appearance="outline"
                          size="sm"
                          className="gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[11px]">
                            local_shipping
                          </span>
                          {vehicle.vehicleName || 'Xe'}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cập nhật: {formatDateTime(item.lastTrackedAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Không có chiến dịch đang hoạt động"
                description="Khi có điều phối thực tế, danh sách sẽ hiển thị tại đây."
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <span className="material-symbols-outlined text-cyan-600">groups</span>
              Hiệu quả đội
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamTable.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Đội</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead className="text-right">Đã gán</TableHead>
                    <TableHead className="text-right">Đang xử lý</TableHead>
                    <TableHead className="text-right">Hoàn thành</TableHead>
                    <TableHead className="text-right">Cập nhật cuối</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamTable.map((item) => (
                    <TableRow key={item.teamId}>
                      <TableCell className="font-medium">{item.teamName}</TableCell>
                      <TableCell>{translateTeamTypeLabel(item.teamType) || 'Chưa rõ'}</TableCell>
                      <TableCell className="text-right">
                        {formatNumberVN(item.assignedRequests)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumberVN(item.inProgressRequests)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumberVN(item.completedRequests)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDateTime(item.lastTrackedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Chưa có đội nào"
                description="Bảng hiệu suất đội sẽ xuất hiện khi backend trả dữ liệu."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
