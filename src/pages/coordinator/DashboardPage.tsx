import { useMemo, useState } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CoordinatorListPagination } from './components/CoordinatorListPagination';
import { RescueRequestLocationsMapCard } from './components/RescueRequestLocationsMapCard';
import { coordinatorNavGroups } from './components/sidebarConfig';
import { formatNumberVN, cn } from '@/lib/utils';
import { useMyReliefStation } from '@/hooks/useReliefStation';
import { useInventories } from '@/hooks/useInventory';
import { useStationDashboard, type StationDashboardRange } from '../../hooks/useStationDashboard';
import {
  useRescueRequestsReport,
  useTeamWorkloadReport,
  useVehicleUtilizationReport,
  useInventoryStockReport,
  useReliefDeliveriesReport,
} from '@/hooks/useStationReports';
import type {
  InventoryStockReportItem,
  RescueRequestReportItem,
  ReliefDeliveryReportItem,
  TeamWorkloadReportItem,
  VehicleUtilizationReportItem,
} from '@/services/stationReportService';
import type {
  ActiveDispatchItem,
  CriticalStockItem,
  ActiveDispatchVehicle,
  VehicleSummaryByTypeItem,
} from '@/services/stationDashboardService';

type PageSection = 'dashboard' | 'reports';
type ReportTab =
  | 'rescue-requests'
  | 'team-workload'
  | 'vehicle-utilization'
  | 'inventory-stock'
  | 'relief-deliveries';

const REPORT_TABS: Array<{ value: ReportTab; label: string }> = [
  { value: 'rescue-requests', label: 'Yêu cầu cứu hộ' },
  { value: 'team-workload', label: 'Tải đội' },
  { value: 'vehicle-utilization', label: 'Hiệu suất xe' },
  { value: 'inventory-stock', label: 'Tồn kho' },
  { value: 'relief-deliveries', label: 'Giao cứu trợ' },
];

const RESCUE_STATUS_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xử lý', value: 'Pending' },
  { label: 'Đã xác minh', value: 'Verified' },
  { label: 'Đã gán', value: 'Assigned' },
  { label: 'Đang xử lý', value: 'InProgress' },
  { label: 'Hoàn thành', value: 'Completed' },
  { label: 'Đã hủy', value: 'Cancelled' },
];

const INVENTORY_STATUS_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Nguy cấp', value: 'Critical' },
  { label: 'Cần bổ sung', value: 'NeedRestock' },
  { label: 'An toàn', value: 'Safe' },
];

const DELIVERY_STATUS_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xử lý', value: 'Pending' },
  { label: 'Đã gán', value: 'Assigned' },
  { label: 'Hoàn thành', value: 'Completed' },
  { label: 'Đã hủy', value: 'Cancelled' },
];

const today = new Date();
const defaultFromDate = new Date(today);
defaultFromDate.setDate(today.getDate() - 29);

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);
const toStartOfDayIso = (value: string) => new Date(`${value}T00:00:00`).toISOString();
const toEndOfDayIso = (value: string) => new Date(`${value}T23:59:59`).toISOString();

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';
  return date.toLocaleString('vi-VN');
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';
  return date.toLocaleDateString('vi-VN');
};

const statusToneClass = (value?: string | null) => {
  const normalized = String(value || '').toLowerCase();
  if (
    normalized.includes('complete') ||
    normalized.includes('safe') ||
    normalized.includes('busy')
  ) {
    return 'success';
  }
  if (normalized.includes('critical') || normalized.includes('cancel')) {
    return 'destructive';
  }
  if (normalized.includes('pending') || normalized.includes('restock')) {
    return 'warning';
  }
  return 'info';
};

const translateRescueRequestType = (value?: string | null) => {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'normal') return 'Thường';
  if (normalized === 'emergency') return 'Khẩn cấp';
  return value || 'Chưa rõ';
};

const translateStatusLabel = (value?: string | null) => {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('pending')) return 'Chờ xử lý';
  if (normalized.includes('verified')) return 'Đã xác minh';
  if (normalized.includes('assigned')) return 'Đã gán';
  if (normalized.includes('inprogress')) return 'Đang xử lý';
  if (normalized.includes('completed')) return 'Hoàn thành';
  if (normalized.includes('cancel')) return 'Đã hủy';
  if (normalized.includes('critical')) return 'Nguy cấp';
  if (normalized.includes('needrestock')) return 'Cần bổ sung';
  if (normalized.includes('safe')) return 'An toàn';
  if (normalized.includes('busy')) return 'Đang bận';
  if (normalized.includes('available')) return 'Sẵn sàng';
  return value || 'Không rõ';
};

const chartColors = ['#2563eb', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#22c55e'];

function MetricCard({
  title,
  value,
  note,
  icon,
  tone = 'info',
}: {
  title: string;
  value: string;
  note?: string;
  icon: string;
  tone?: 'info' | 'success' | 'warning' | 'destructive';
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-500/15 text-emerald-600'
      : tone === 'warning'
        ? 'bg-amber-500/15 text-amber-600'
        : tone === 'destructive'
          ? 'bg-rose-500/15 text-rose-600'
          : 'bg-sky-500/15 text-sky-600';

  return (
    <Card className="border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
            <p className="text-3xl font-black text-foreground leading-none">{value}</p>
          </div>
          <div
            className={cn(
              'size-10 rounded-2xl flex items-center justify-center shrink-0',
              toneClass,
            )}
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
        </div>
        {note ? <p className="text-xs text-muted-foreground leading-relaxed">{note}</p> : null}
      </CardContent>
    </Card>
  );
}

function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-[136px] rounded-2xl" />
      ))}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StatusChip({ value }: { value?: string | null }) {
  const displayValue = translateStatusLabel(value);
  const tone = statusToneClass(value);
  const variant =
    tone === 'success'
      ? 'success'
      : tone === 'warning'
        ? 'warning'
        : tone === 'destructive'
          ? 'destructive'
          : 'info';
  return (
    <Badge variant={variant} appearance="outline" size="sm" className="gap-1.5">
      {displayValue}
    </Badge>
  );
}

const resetPageState = (
  nextValue: string,
  setValue: (value: string) => void,
  resetPages: Array<() => void>,
) => {
  setValue(nextValue);
  resetPages.forEach((resetPage) => resetPage());
};

export default function CoordinatorDashboardPage() {
  const [section, setSection] = useState<PageSection>('dashboard');
  const [fromDate, setFromDate] = useState(toDateInputValue(defaultFromDate));
  const [toDate, setToDate] = useState(toDateInputValue(today));
  const [groupBy, setGroupBy] = useState<StationDashboardRange['groupBy']>('day');
  const [reportTab, setReportTab] = useState<ReportTab>('rescue-requests');
  const [rescueStatus, setRescueStatus] = useState('');
  const [inventoryId, setInventoryId] = useState('');
  const [inventoryStatus, setInventoryStatus] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [rescuePage, setRescuePage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [deliveryPage, setDeliveryPage] = useState(1);

  const { station, isLoading: isLoadingStation, refetch: refetchStation } = useMyReliefStation();
  const stationKey = station?.reliefStationId ?? undefined;
  const { data: inventoriesData, isLoading: isLoadingInventories } = useInventories(
    { reliefStationId: stationKey, pageIndex: 1, pageSize: 100 },
    { enabled: Boolean(stationKey) },
  );

  const dashboardRange = useMemo<StationDashboardRange>(
    () => ({ from: toStartOfDayIso(fromDate), to: toEndOfDayIso(toDate), groupBy }),
    [fromDate, groupBy, toDate],
  );

  const dashboard = useStationDashboard(dashboardRange, stationKey);

  const inventoryOptions = useMemo(
    () => [
      { label: 'Tất cả inventories', value: 'all' },
      ...(inventoriesData?.items || []).map((inventory) => ({
        label:
          [inventory.levelName, inventory.reliefStationName].filter(Boolean).join(' - ') ||
          inventory.inventoryId,
        value: inventory.inventoryId,
      })),
    ],
    [inventoriesData],
  );

  const reportRange = useMemo(
    () => ({ from: toStartOfDayIso(fromDate), to: toEndOfDayIso(toDate) }),
    [fromDate, toDate],
  );

  const rescueRequestsReport = useRescueRequestsReport(
    {
      ...reportRange,
      status: rescueStatus || undefined,
      pageIndex: rescuePage,
      pageSize: 10,
    },
    section === 'reports' && reportTab === 'rescue-requests',
  );

  const teamWorkloadReport = useTeamWorkloadReport(
    reportRange,
    section === 'reports' && reportTab === 'team-workload',
  );

  const vehicleUtilizationReport = useVehicleUtilizationReport(
    reportRange,
    section === 'reports' && reportTab === 'vehicle-utilization',
  );

  const inventoryStockReport = useInventoryStockReport(
    {
      ...reportRange,
      inventoryId: inventoryId || undefined,
      status: inventoryStatus || undefined,
      pageIndex: inventoryPage,
      pageSize: 20,
    },
    section === 'reports' && reportTab === 'inventory-stock',
  );

  const reliefDeliveriesReport = useReliefDeliveriesReport(
    {
      ...reportRange,
      campaignId: campaignId || undefined,
      status: deliveryStatus || undefined,
      pageIndex: deliveryPage,
      pageSize: 20,
    },
    section === 'reports' && reportTab === 'relief-deliveries' && Boolean(campaignId),
  );

  const overview = dashboard.overviewQuery.data;
  const rescueStatusSummary = dashboard.rescueStatusQuery.data;
  const rescueTypeSummary = dashboard.rescueTypeSummaryQuery.data;
  const rescueLocations = dashboard.rescueLocationsQuery.data || [];
  const teamPerformance = dashboard.teamPerformanceQuery.data || [];
  const vehicleSummary = dashboard.vehicleSummaryQuery.data;
  const alerts = dashboard.alertsQuery.data;
  const inventorySummary = dashboard.inventorySummaryQuery.data;
  const activeDispatch = dashboard.activeDispatchQuery.data?.activeOperations || [];

  const rescueStatusChart = rescueStatusSummary
    ? [
        { name: 'Chờ xử lý', value: rescueStatusSummary.pending },
        { name: 'Đã xác minh', value: rescueStatusSummary.verified },
        { name: 'Đã gán', value: rescueStatusSummary.assigned },
        { name: 'Đang xử lý', value: rescueStatusSummary.inProgress },
        { name: 'Hoàn thành', value: rescueStatusSummary.completed },
        { name: 'Đã hủy', value: rescueStatusSummary.cancelled },
      ].filter((item) => item.value > 0)
    : [];

  const rescueTypeChart = rescueTypeSummary
    ? [
        { name: 'Cứu hộ thường', value: rescueTypeSummary.normal },
        { name: 'Cứu hộ khẩn cấp', value: rescueTypeSummary.emergency },
      ].filter((item) => item.value > 0)
    : [];

  const vehicleTypeChart = (vehicleSummary?.byType || []).map((item: VehicleSummaryByTypeItem) => ({
    name: item.vehicleTypeName,
    available: item.available,
    busy: item.busy,
    total: item.total,
  }));

  const teamTable = [...teamPerformance].sort(
    (left, right) => right.assignedRequests - left.assignedRequests,
  );

  const rescueRows = (rescueRequestsReport.data?.items || []) as RescueRequestReportItem[];
  const workloadRows = (teamWorkloadReport.data || []) as TeamWorkloadReportItem[];
  const utilizationRows = (vehicleUtilizationReport.data || []) as VehicleUtilizationReportItem[];
  const stockRows = (inventoryStockReport.data?.items || []) as InventoryStockReportItem[];
  const deliveryRows = (reliefDeliveriesReport.data?.items || []) as ReliefDeliveryReportItem[];

  const isDashboardLoading =
    isLoadingStation ||
    dashboard.isLoading ||
    (section === 'reports' &&
      ((reportTab === 'rescue-requests' && rescueRequestsReport.isLoading) ||
        (reportTab === 'team-workload' && teamWorkloadReport.isLoading) ||
        (reportTab === 'vehicle-utilization' && vehicleUtilizationReport.isLoading) ||
        (reportTab === 'inventory-stock' && inventoryStockReport.isLoading) ||
        (reportTab === 'relief-deliveries' && reliefDeliveriesReport.isLoading)));

  return (
    <DashboardLayout navGroups={coordinatorNavGroups}>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-sky-500/10 p-6 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_35%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" appearance="outline" size="sm" className="gap-1.5">
                  <span className="material-symbols-outlined text-xs">dashboard</span>
                  Trạm hiện tại
                </Badge>
                <Badge variant="info" appearance="outline" size="sm" className="gap-1.5">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {formatDate(fromDate)} - {formatDate(toDate)}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-primary">
                {overview?.stationName || station?.name || 'Báo cáo & Thống kê'}
              </h1>
              <p className="max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
                Tổng quan hoạt động của trạm theo đúng phạm vi điều phối hiện tại, bao gồm card tóm
                tắt, biểu đồ vận hành và bảng báo cáo chi tiết cho cứu hộ, đội, phương tiện, tồn kho
                và cứu trợ.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="md"
                className="gap-2"
                onClick={() => void refetchStation()}
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Làm mới trạm
              </Button>
              <Button
                variant="outline"
                size="md"
                className="gap-2"
                onClick={() => setSection('reports')}
              >
                <span className="material-symbols-outlined text-sm">table_view</span>
                Mở báo cáo
              </Button>
            </div>
          </div>
        </section>

        <Tabs
          value={section}
          onValueChange={(value) => setSection(value as PageSection)}
          className="space-y-6"
        >
          <TabsList
            variant="button"
            shape="pill"
            className="w-fit bg-card border border-border p-1"
          >
            <TabsTrigger value="dashboard">Tổng quan trạm</TabsTrigger>
            <TabsTrigger value="reports">Báo cáo chi tiết</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {dashboard.isError ? (
              <EmptyState
                title="Không tải được dữ liệu dashboard"
                description="Kiểm tra quyền truy cập hoặc thử tải lại. Các API station-dashboard có thể chưa sẵn sàng trên backend."
              />
            ) : isDashboardLoading ? (
              <LoadingGrid count={6} />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                  <MetricCard
                    title="Chờ cứu hộ"
                    value={formatNumberVN(overview?.pendingRescueRequests || 0)}
                    note="Yêu cầu chưa xử lý trong trạm"
                    icon="local_police"
                    tone="warning"
                  />
                  <MetricCard
                    title="Đang cứu hộ"
                    value={formatNumberVN(overview?.inProgressRescueRequests || 0)}
                    note="Các yêu cầu đang được đội xử lý"
                    icon="route"
                    tone="info"
                  />
                  <MetricCard
                    title="Đội hoạt động"
                    value={formatNumberVN(overview?.activeTeams || 0)}
                    note="Đội đang trực hoặc có batch hoạt động"
                    icon="groups"
                    tone="success"
                  />
                  <MetricCard
                    title="Xe sẵn sàng"
                    value={formatNumberVN(overview?.availableVehicles || 0)}
                    note="Phương tiện có thể điều động ngay"
                    icon="local_shipping"
                    tone="success"
                  />
                  <MetricCard
                    title="Thông báo chưa đọc"
                    value={formatNumberVN(overview?.unreadNotifications || 0)}
                    note="Tin nhắn và cảnh báo cần kiểm tra"
                    icon="notifications"
                    tone="warning"
                  />
                  <MetricCard
                    title="Tồn kho thấp"
                    value={formatNumberVN(overview?.lowStockItems || 0)}
                    note="Số vật tư cần xem lại"
                    icon="inventory_2"
                    tone="destructive"
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-4">
                  <Card className="border-border bg-card xl:col-span-1">
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
                                  <Cell
                                    key={entry.name}
                                    fill={chartColors[index % chartColors.length]}
                                  />
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

                  <Card className="border-border bg-card xl:col-span-1">
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
                                  <Cell
                                    key={entry.name}
                                    fill={chartColors[index % chartColors.length]}
                                  />
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

                  <RescueRequestLocationsMapCard items={rescueLocations} isLoading={false} />
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                  <Card className="border-border bg-card xl:col-span-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base font-bold">
                        <span className="material-symbols-outlined text-violet-600">
                          local_shipping
                        </span>
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
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                  stroke="#e2e8f0"
                                />
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
                                <Legend
                                  iconType="circle"
                                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                                />
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
                                  Sẵn sàng {formatNumberVN(item.available)} / Bận{' '}
                                  {formatNumberVN(item.busy)}
                                </span>
                              </div>
                            ))}
                            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2">
                              <span className="material-symbols-outlined text-sm text-muted-foreground">
                                garage
                              </span>
                              <span className="text-muted-foreground">Tổng xe trong trạm</span>
                              <span className="ml-auto font-semibold text-foreground">
                                {formatNumberVN(vehicleSummary?.total || 0)}
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

                  <Card className="border-border bg-card xl:col-span-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base font-bold">
                        <span className="material-symbols-outlined text-amber-600">warning</span>
                        Cảnh báo trạm
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {alerts ? (
                        <>
                          <div className="rounded-2xl border border-border bg-muted/20 p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-2xl text-sky-600">
                              notifications
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">Thông báo chưa đọc</p>
                              <p className="text-sm text-muted-foreground">
                                {formatNumberVN(alerts.unreadNotifications)} tin chưa mở
                              </p>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-border bg-muted/20 p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-2xl text-amber-600">
                              group_add
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">
                                Tình nguyện viên chờ duyệt
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatNumberVN(alerts.pendingVolunteerApplications)} hồ sơ
                              </p>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-border bg-muted/20 p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-2xl text-rose-600">
                              inventory_2
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">Vật tư khẩn</p>
                              <p className="text-sm text-muted-foreground">
                                {formatNumberVN(alerts.criticalStockItems)} mục cần xử lý
                              </p>
                            </div>
                          </div>
                        </>
                      ) : null}

                      {inventorySummary?.topCriticalItems?.length ? (
                        <div className="space-y-3 pt-2">
                          <p className="text-sm font-semibold text-foreground">
                            Mặt hàng cần restock
                          </p>
                          {inventorySummary.topCriticalItems.map((item: CriticalStockItem) => (
                            <div
                              key={item.supplyItemId}
                              className="rounded-2xl border border-border bg-background p-4"
                            >
                              <p className="font-semibold text-foreground">{item.supplyItemName}</p>
                              <p className="text-sm text-muted-foreground">
                                Còn {formatNumberVN(item.currentQuantity)} / mức tối thiểu{' '}
                                {formatNumberVN(item.minimumStockLevel)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>

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
                          {activeDispatch.map((item: ActiveDispatchItem) => (
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
                                <StatusChip value={item.status} />
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs">
                                {item.vehicles.map((vehicle: ActiveDispatchVehicle) => (
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
                </div>

                <Card className="border-border bg-card">
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
                              <TableCell>{item.teamType || 'Chưa rõ'}</TableCell>
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
              </>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-border bg-card">
              <CardContent className="p-4 md:p-5 space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Từ ngày
                    </p>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(event) =>
                        resetPageState(event.target.value, setFromDate, [
                          () => setRescuePage(1),
                          () => setInventoryPage(1),
                          () => setDeliveryPage(1),
                        ])
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Đến ngày
                    </p>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(event) =>
                        resetPageState(event.target.value, setToDate, [
                          () => setRescuePage(1),
                          () => setInventoryPage(1),
                          () => setDeliveryPage(1),
                        ])
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Nhóm xu hướng
                    </p>
                    <Select
                      value={groupBy}
                      onValueChange={(value) =>
                        setGroupBy(value as StationDashboardRange['groupBy'])
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn nhóm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Theo ngày</SelectItem>
                        <SelectItem value="week">Theo tuần</SelectItem>
                        <SelectItem value="month">Theo tháng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => void dashboard.refetchAll()}
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      Làm mới dữ liệu
                    </Button>
                    <Button
                      variant="primary"
                      className="gap-2"
                      onClick={() => setSection('dashboard')}
                    >
                      <span className="material-symbols-outlined text-sm">monitoring</span>
                      Về tổng quan
                    </Button>
                  </div>
                </div>

                <Tabs value={reportTab} onValueChange={(value) => setReportTab(value as ReportTab)}>
                  <TabsList
                    variant="button"
                    shape="pill"
                    className="flex flex-wrap bg-muted/40 p-1"
                  >
                    {REPORT_TABS.map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="rescue-requests" className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">Bộ lọc trạng thái</p>
                        <Select
                          value={rescueStatus || 'all'}
                          onValueChange={(value) =>
                            resetPageState(value === 'all' ? '' : value, setRescueStatus, [
                              () => setRescuePage(1),
                            ])
                          }
                        >
                          <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            {RESCUE_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value || option.label} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Badge variant="info" appearance="outline" size="sm">
                        {rescueRequestsReport.data?.totalCount
                          ? formatNumberVN(rescueRequestsReport.data.totalCount)
                          : '0'}{' '}
                        kết quả
                      </Badge>
                    </div>

                    {rescueRequestsReport.isLoading ? (
                      <LoadingGrid count={1} />
                    ) : rescueRequestsReport.isError ? (
                      <EmptyState
                        title="Không tải được báo cáo cứu hộ"
                        description="Kiểm tra lại tham số ngày hoặc quyền truy cập API station-reports."
                      />
                    ) : rescueRows.length > 0 ? (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Mã yêu cầu</TableHead>
                              <TableHead>Loại</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead>Đội</TableHead>
                              <TableHead>Xe chính</TableHead>
                              <TableHead>Ngày tạo</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rescueRows.map((item) => (
                              <TableRow key={item.requestId}>
                                <TableCell className="font-medium">{item.requestId}</TableCell>
                                <TableCell>
                                  {translateRescueRequestType(item.rescueRequestType)}
                                </TableCell>
                                <TableCell>
                                  <StatusChip value={item.status} />
                                </TableCell>
                                <TableCell>{item.teamName || 'Chưa gán'}</TableCell>
                                <TableCell>{item.primaryVehicle || 'Chưa gán'}</TableCell>
                                <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {rescueRequestsReport.data ? (
                          <CoordinatorListPagination
                            currentPage={rescueRequestsReport.data.currentPage}
                            totalPages={rescueRequestsReport.data.totalPages}
                            onPageChange={setRescuePage}
                            summary={`Hiển thị ${rescueRows.length} / ${formatNumberVN(rescueRequestsReport.data.totalCount)} yêu cầu`}
                          />
                        ) : null}
                      </>
                    ) : (
                      <EmptyState
                        title="Không có dữ liệu"
                        description="Không có yêu cầu nào trong khoảng ngày đã chọn."
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="team-workload" className="space-y-4">
                    {teamWorkloadReport.isLoading ? (
                      <LoadingGrid count={1} />
                    ) : teamWorkloadReport.isError ? (
                      <EmptyState
                        title="Không tải được báo cáo tải đội"
                        description="Thử làm mới hoặc kiểm tra lại API."
                      />
                    ) : workloadRows.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Đội</TableHead>
                            <TableHead className="text-right">Đã gán</TableHead>
                            <TableHead className="text-right">Đã hoàn thành</TableHead>
                            <TableHead className="text-right">Batch đang hoạt động</TableHead>
                            <TableHead className="text-right">Thành viên</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workloadRows.map((item) => (
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
                              <TableCell className="text-right">
                                {formatNumberVN(item.memberCount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <EmptyState
                        title="Không có dữ liệu"
                        description="Báo cáo tải đội sẽ xuất hiện khi backend trả kết quả."
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="vehicle-utilization" className="space-y-4">
                    {vehicleUtilizationReport.isLoading ? (
                      <LoadingGrid count={1} />
                    ) : vehicleUtilizationReport.isError ? (
                      <EmptyState
                        title="Không tải được báo cáo xe"
                        description="Kiểm tra quyền truy cập hoặc cấu hình API."
                      />
                    ) : utilizationRows.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Phương tiện</TableHead>
                            <TableHead>Biển số</TableHead>
                            <TableHead className="text-right">Số lần bận</TableHead>
                            <TableHead className="text-right">Sử dụng trong chiến dịch</TableHead>
                            <TableHead>Trạng thái</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {utilizationRows.map((item) => (
                            <TableRow key={item.vehicleId}>
                              <TableCell className="font-medium">{item.vehicleName}</TableCell>
                              <TableCell>{item.vehicleLicensePlate}</TableCell>
                              <TableCell className="text-right">
                                {formatNumberVN(item.busyCount)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumberVN(item.usedInOperations)}
                              </TableCell>
                              <TableCell>
                                <StatusChip value={item.isCurrentlyBusy ? 'Busy' : 'Available'} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <EmptyState
                        title="Không có dữ liệu"
                        description="Báo cáo hiệu suất phương tiện sẽ hiển thị tại đây."
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="inventory-stock" className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">Inventory</p>
                        <Select
                          value={inventoryId || 'all'}
                          onValueChange={(value) =>
                            resetPageState(value === 'all' ? '' : value, setInventoryId, [
                              () => setInventoryPage(1),
                            ])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn kho" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingInventories ? (
                              <SelectItem value="all">Đang tải danh sách kho...</SelectItem>
                            ) : (
                              inventoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">Trạng thái kho</p>
                        <Select
                          value={inventoryStatus || 'all'}
                          onValueChange={(value) =>
                            resetPageState(value === 'all' ? '' : value, setInventoryStatus, [
                              () => setInventoryPage(1),
                            ])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            {INVENTORY_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value || option.label} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {inventoryStockReport.isLoading ? (
                      <LoadingGrid count={1} />
                    ) : inventoryStockReport.isError ? (
                      <EmptyState
                        title="Không tải được báo cáo tồn kho"
                        description="Kiểm tra bộ lọc kho hoặc quyền truy cập API."
                      />
                    ) : stockRows.length > 0 ? (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Vật tư</TableHead>
                              <TableHead className="text-right">Tồn hiện tại</TableHead>
                              <TableHead className="text-right">Mức tối thiểu</TableHead>
                              <TableHead className="text-right">Mức tối đa</TableHead>
                              <TableHead>Trạng thái</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stockRows.map((item) => (
                              <TableRow key={item.inventoryStockId}>
                                <TableCell className="font-medium">{item.supplyItemName}</TableCell>
                                <TableCell className="text-right">
                                  {formatNumberVN(item.currentQuantity)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatNumberVN(item.minimumStockLevel)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatNumberVN(item.maximumStockLevel)}
                                </TableCell>
                                <TableCell>
                                  <StatusChip value={item.inventoryStatus} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {inventoryStockReport.data ? (
                          <CoordinatorListPagination
                            currentPage={inventoryStockReport.data.currentPage}
                            totalPages={inventoryStockReport.data.totalPages}
                            onPageChange={setInventoryPage}
                            summary={`Hiển thị ${stockRows.length} / ${formatNumberVN(inventoryStockReport.data.totalCount)} vật tư`}
                          />
                        ) : null}
                      </>
                    ) : (
                      <EmptyState
                        title="Không có dữ liệu"
                        description="Báo cáo tồn kho không trả về vật tư phù hợp."
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="relief-deliveries" className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">Campaign ID</p>
                        <Input
                          value={campaignId}
                          onChange={(event) =>
                            resetPageState(event.target.value, setCampaignId, [
                              () => setDeliveryPage(1),
                            ])
                          }
                          placeholder="Nhập campaignId"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">Trạng thái</p>
                        <Select
                          value={deliveryStatus || 'all'}
                          onValueChange={(value) =>
                            resetPageState(value === 'all' ? '' : value, setDeliveryStatus, [
                              () => setDeliveryPage(1),
                            ])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            {DELIVERY_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value || option.label} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {!campaignId ? (
                      <EmptyState
                        title="Cần campaignId"
                        description="Nhập mã chiến dịch để xem bảng giao cứu trợ."
                      />
                    ) : reliefDeliveriesReport.isLoading ? (
                      <LoadingGrid count={1} />
                    ) : reliefDeliveriesReport.isError ? (
                      <EmptyState
                        title="Không tải được báo cáo giao cứu trợ"
                        description="Kiểm tra campaignId hoặc quyền truy cập API."
                      />
                    ) : deliveryRows.length > 0 ? (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Mã hộ</TableHead>
                              <TableHead>Chủ hộ</TableHead>
                              <TableHead>Địa chỉ</TableHead>
                              <TableHead>Đội</TableHead>
                              <TableHead>Phương thức</TableHead>
                              <TableHead>Trạng thái</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deliveryRows.map((item) => (
                              <TableRow key={`${item.householdCode}-${item.headOfHouseholdName}`}>
                                <TableCell className="font-medium">{item.householdCode}</TableCell>
                                <TableCell>{item.headOfHouseholdName}</TableCell>
                                <TableCell>{item.address}</TableCell>
                                <TableCell>{item.teamName || 'Chưa gán'}</TableCell>
                                <TableCell>{translateStatusLabel(item.deliveryMode)}</TableCell>
                                <TableCell>
                                  <StatusChip value={item.fulfillmentStatus} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {reliefDeliveriesReport.data ? (
                          <CoordinatorListPagination
                            currentPage={reliefDeliveriesReport.data.currentPage}
                            totalPages={reliefDeliveriesReport.data.totalPages}
                            onPageChange={setDeliveryPage}
                            summary={`Hiển thị ${deliveryRows.length} / ${formatNumberVN(reliefDeliveriesReport.data.totalCount)} bản ghi`}
                          />
                        ) : null}
                      </>
                    ) : (
                      <EmptyState
                        title="Không có dữ liệu"
                        description="Báo cáo giao cứu trợ sẽ hiển thị khi API có kết quả."
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
