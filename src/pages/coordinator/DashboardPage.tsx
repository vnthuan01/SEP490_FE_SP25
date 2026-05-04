import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useQueries } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { CoordinatorReliefTeamMissionsSection } from './components/dashboard/CoordinatorReliefTeamMissionsSection';
import { CoordinatorTeamWorkloadSection } from './components/dashboard/CoordinatorTeamWorkloadSection';
import { CoordinatorReliefDeliveriesSection } from './components/dashboard/CoordinatorReliefDeliveriesSection';
import { CoordinatorDashboardOverviewSection } from './components/dashboard/CoordinatorDashboardOverviewSection';
import { CoordinatorDashboardReportControls } from './components/dashboard/CoordinatorDashboardReportControls';
import { CoordinatorReliefMissionCampaignSummarySection } from './components/dashboard/CoordinatorReliefMissionCampaignSummarySection';
import { CoordinatorReliefMissionReportSection } from './components/dashboard/CoordinatorReliefMissionReportSection';
import { CoordinatorReliefPlanSummaryCard } from './components/relief-distribution/CoordinatorReliefPlanSummaryCard';
import { coordinatorNavGroups } from './components/sidebarConfig';
import { formatNumberVN, cn } from '@/lib/utils';
import {
  CampaignStatus,
  CampaignStatusLabel,
  CampaignTaskStatus,
  CampaignTeamStatus,
  CampaignTeamStatusLabel,
  CampaignType,
  MemberTaskStatus,
  getCampaignStatusLabel,
} from '@/enums/beEnums';
import { useMyReliefStation } from '@/hooks/useReliefStation';
import { useTeamsInStation } from '@/hooks/useTeams';
import { useInventories } from '@/hooks/useInventory';
import { CAMPAIGN_QUERY_KEYS, useCampaigns } from '@/hooks/useCampaigns';
import { useReliefPlanSummary } from '@/hooks/useReliefDistribution';
import { useStationDashboard, type StationDashboardRange } from '../../hooks/useStationDashboard';
import {
  useRescueRequestsReport,
  useReliefMissionReport,
  useTeamWorkloadReport,
  useVehicleUtilizationReport,
  useInventoryStockReport,
  useReliefDeliveriesReport,
} from '@/hooks/useStationReports';
import type {
  InventoryStockReportItem,
  RescueRequestReportItem,
  ReliefDeliveryReportItem,
  ReliefMissionCampaignSummaryItem,
  ReliefMissionReportRowItem,
  TeamWorkloadReportItem,
  VehicleUtilizationReportItem,
  VehicleUtilizationReportResponse,
} from '@/services/stationReportService';
import type { VehicleSummaryByTypeItem } from '@/services/stationDashboardService';
import {
  campaignService,
  type CampaignTeam,
  type CampaignTaskDetailItem,
  type CampaignTaskSummaryItem,
} from '@/services/campaignService';

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
  { label: 'Đã giải quyết', value: 'Delivered' },
  { label: 'Đã hủy', value: 'Canceled' },
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
  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    if (numericValue in CampaignStatusLabel) {
      return CampaignStatusLabel[numericValue as keyof typeof CampaignStatusLabel];
    }
    if (numericValue in CampaignTeamStatusLabel) {
      return CampaignTeamStatusLabel[numericValue as keyof typeof CampaignTeamStatusLabel];
    }
  }
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'active') return 'Đang hoạt động';
  if (normalized === 'accepted') return 'Đã chấp nhận';
  if (normalized === 'invited') return 'Đã mời';
  if (normalized === 'withdrawn') return 'Đã rút lui';
  if (normalized === 'planned') return 'Kế hoạch';
  if (normalized === 'blocked') return 'Bị chặn';
  if (normalized.includes('pending')) return 'Chờ xử lý';
  if (normalized.includes('verified')) return 'Đã xác minh';
  if (normalized.includes('assigned')) return 'Đã gán';
  if (normalized.includes('inprogress')) return 'Đang xử lý';
  if (normalized.includes('completed')) return 'Hoàn thành';
  if (normalized.includes('delivered')) return 'Đã giao';
  if (normalized.includes('deliveryfailed')) return 'Giao thất bại';
  if (normalized.includes('failed')) return 'Thất bại';
  if (normalized.includes('cancel')) return 'Đã hủy';
  if (normalized.includes('critical')) return 'Nguy cấp';
  if (normalized.includes('needrestock')) return 'Cần bổ sung';
  if (normalized.includes('safe')) return 'An toàn';
  if (normalized.includes('busy')) return 'Đang bận';
  if (normalized.includes('available')) return 'Sẵn sàng';
  return value || 'Không rõ';
};

const translateDeliveryModeLabel = (value?: string | null) => {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('doortodoor')) return 'Giao tận nơi';
  if (normalized.includes('pickup')) return 'Nhận tại điểm phát';
  if (normalized.includes('onsite')) return 'Phát tại chỗ';
  return value || 'Không rõ';
};

const translateTeamTypeLabel = (value?: string | null) => {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('rescue')) return 'Cứu hộ';
  if (normalized.includes('relief')) return 'Cứu trợ';
  if (normalized.includes('other')) return 'Khác';
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
    <Card className="h-full border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full min-h-[152px] flex-col justify-between gap-4 p-5">
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
        {note ? <p className="text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
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
    <Badge
      variant={variant}
      appearance="outline"
      size="sm"
      className="inline-flex whitespace-nowrap gap-1.5 px-2.5 py-1"
    >
      {displayValue}
    </Badge>
  );
}

function EmphasisNumber({
  value,
  tone,
}: {
  value: string;
  tone: 'success' | 'warning' | 'destructive' | 'info';
}) {
  const className =
    tone === 'success'
      ? 'bg-emerald-500/15 text-emerald-700 border-emerald-300/40'
      : tone === 'warning'
        ? 'bg-amber-500/15 text-amber-700 border-amber-300/40'
        : tone === 'destructive'
          ? 'bg-rose-500/15 text-rose-700 border-rose-300/40'
          : 'bg-sky-500/15 text-sky-700 border-sky-300/40';

  return (
    <span
      className={cn(
        'inline-flex min-w-14 justify-center rounded-full border px-2.5 py-1 text-sm font-bold',
        className,
      )}
    >
      {value}
    </span>
  );
}

const resetPageState = (
  nextValue: string,
  setValue: Dispatch<SetStateAction<string>>,
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
  const [selectedReliefCampaignId, setSelectedReliefCampaignId] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [rescuePage, setRescuePage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [vehiclePage, setVehiclePage] = useState(1);

  const { station, isLoading: isLoadingStation, refetch: refetchStation } = useMyReliefStation();
  const stationKey = station?.reliefStationId ?? undefined;
  const { data: inventoriesData, isLoading: isLoadingInventories } = useInventories(
    { reliefStationId: stationKey, pageIndex: 1, pageSize: 100 },
    { enabled: Boolean(stationKey) },
  );
  const { teams: stationTeams, isLoading: isLoadingTeams } = useTeamsInStation(stationKey);
  const { campaigns: stationReliefCampaigns, isLoading: isLoadingReliefCampaigns } = useCampaigns(
    {
      reliefStationId: stationKey,
      type: CampaignType.Relief,
      pageIndex: 1,
      pageSize: 100,
    },
    { enabled: Boolean(stationKey) },
  );

  const activeReliefCampaigns = useMemo(
    () =>
      (stationReliefCampaigns || []).filter(
        (campaign) =>
          campaign.status === CampaignStatus.Active ||
          campaign.status === CampaignStatus.InProgress,
      ),
    [stationReliefCampaigns],
  );

  const effectiveSelectedReliefCampaignId =
    selectedReliefCampaignId ||
    (activeReliefCampaigns.length === 1 ? activeReliefCampaigns[0].campaignId : '');

  const dashboardRange = useMemo<StationDashboardRange>(
    () => ({
      from: toStartOfDayIso(fromDate),
      to: toEndOfDayIso(toDate),
      groupBy,
      teamIds: selectedTeamIds,
    }),
    [fromDate, groupBy, selectedTeamIds, toDate],
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
    {
      ...reportRange,
      pageIndex: vehiclePage,
      pageSize: 10,
    },
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
      campaignId: effectiveSelectedReliefCampaignId || undefined,
      status: deliveryStatus || undefined,
      pageIndex: deliveryPage,
      pageSize: 20,
    },
    section === 'reports' && reportTab === 'relief-deliveries',
  );

  const reliefMissionReport = useReliefMissionReport(
    {
      ...reportRange,
      teamIds: selectedTeamIds.length > 0 ? selectedTeamIds : undefined,
    },
    section === 'reports',
  );
  const { data: selectedReliefPlanSummary } = useReliefPlanSummary(
    effectiveSelectedReliefCampaignId,
  );
  const stationTeamIds = useMemo(
    () => (stationTeams || []).map((team) => team.teamId),
    [stationTeams],
  );
  const campaignTeamQueries = useQueries({
    queries: (stationReliefCampaigns || []).map((campaign) => ({
      queryKey: [...CAMPAIGN_QUERY_KEYS.teams(campaign.campaignId), 'station-dashboard'] as const,
      queryFn: async () => {
        const response = await campaignService.getTeams(campaign.campaignId);
        return (response.data || []) as CampaignTeam[];
      },
      enabled: section === 'dashboard' && (stationReliefCampaigns || []).length > 0,
    })),
  });
  const allowedCampaignTeamsByCampaignId = useMemo(() => {
    const map = new Map<string, CampaignTeam[]>();

    (stationReliefCampaigns || []).forEach((campaign, index) => {
      const campaignTeams = (campaignTeamQueries[index]?.data || []) as CampaignTeam[];
      const allowedTeams = campaignTeams.filter((team) =>
        selectedTeamIds.length > 0
          ? selectedTeamIds.includes(team.teamId)
          : stationTeamIds.includes(team.teamId),
      );
      map.set(campaign.campaignId, allowedTeams);
    });

    return map;
  }, [campaignTeamQueries, selectedTeamIds, stationReliefCampaigns, stationTeamIds]);
  const allowedCampaignIds = useMemo(
    () =>
      new Set(
        Array.from(allowedCampaignTeamsByCampaignId.entries())
          .filter(([, teams]) => teams.length > 0)
          .map(([campaignId]) => campaignId),
      ),
    [allowedCampaignTeamsByCampaignId],
  );
  const allowedCampaignTeamIds = useMemo(
    () =>
      new Set(
        Array.from(allowedCampaignTeamsByCampaignId.values())
          .flat()
          .map((team) => team.campaignTeamId),
      ),
    [allowedCampaignTeamsByCampaignId],
  );

  const rawReliefTaskQueries = useQueries({
    queries: (stationReliefCampaigns || []).map((campaign) => ({
      queryKey: [
        ...CAMPAIGN_QUERY_KEYS.list(),
        'raw-tasks',
        campaign.campaignId,
        selectedTeamIds,
      ] as const,
      queryFn: async () => {
        const allowedCampaignTeams =
          allowedCampaignTeamsByCampaignId.get(campaign.campaignId) || [];
        const response = await campaignService.getCampaignTasks(campaign.campaignId, {
          campaignTeamId:
            allowedCampaignTeams.length === 1 ? allowedCampaignTeams[0].campaignTeamId : undefined,
          pageIndex: 1,
          pageSize: 100,
        });
        return response.data?.items || [];
      },
      enabled:
        section === 'dashboard' &&
        (stationReliefCampaigns || []).length > 0 &&
        allowedCampaignIds.has(campaign.campaignId),
    })),
  });

  const rawReliefTaskDetailQueries = useQueries({
    queries: rawReliefTaskQueries
      .flatMap((query) => (query.data || []) as CampaignTaskSummaryItem[])
      .map((task) => ({
        queryKey: [...CAMPAIGN_QUERY_KEYS.list(), 'raw-task-detail', task.campaignTaskId] as const,
        queryFn: async () => {
          const response = await campaignService.getCampaignTaskDetail(task.campaignTaskId);
          return response.data as CampaignTaskDetailItem;
        },
        enabled: section === 'dashboard',
      })),
  });

  const overview = dashboard.overviewQuery.data;
  const rescueStatusSummary = dashboard.rescueStatusQuery.data;
  const rescueTypeSummary = dashboard.rescueTypeSummaryQuery.data;
  const teamPerformance = dashboard.teamPerformanceQuery.data || [];
  const vehicleSummary = dashboard.vehicleSummaryQuery.data;
  const activeDispatch = dashboard.activeDispatchQuery.data?.activeOperations || [];
  const rescueLocationItems = dashboard.rescueLocationsQuery.data || [];
  const reliefTeamMissions = dashboard.reliefTeamMissionsQuery.data || [];
  const fallbackReliefTeamMissions = useMemo(() => {
    const rawTasks = rawReliefTaskQueries.flatMap(
      (query) => (query.data || []) as CampaignTaskSummaryItem[],
    );
    const rawTaskDetails = new Map(
      rawReliefTaskDetailQueries
        .map((query) => query.data as CampaignTaskDetailItem | undefined)
        .filter(Boolean)
        .map((detail) => [detail!.campaignTaskId, detail!]),
    );
    const allowedCampaignTeams = new Map(
      Array.from(allowedCampaignTeamsByCampaignId.values())
        .flat()
        .map((team) => [team.campaignTeamId, team]),
    );

    const filteredTasks = rawTasks.filter(
      (task) =>
        allowedCampaignIds.has(task.campaignId) && allowedCampaignTeams.has(task.campaignTeamId),
    );

    const grouped = new Map<string, any>();

    filteredTasks.forEach((task) => {
      const detail = rawTaskDetails.get(task.campaignTaskId);
      const campaignTeam = allowedCampaignTeams.get(task.campaignTeamId);
      const key = task.campaignTeamId || task.campaignId;
      const existing = grouped.get(key);
      if (existing) {
        existing.totalTasks += 1;
        if (Number(task.status) === CampaignTaskStatus.Completed) {
          existing.completedTasks += 1;
        }
        if (Number(task.status) === CampaignTaskStatus.InProgress) {
          existing.inProgressTasks += 1;
        }
        if (Number(task.status) === CampaignTaskStatus.Blocked) {
          existing.blockedTasks += 1;
        }
        if (Number(task.status) === CampaignTaskStatus.Cancelled) {
          existing.cancelledTasks += 1;
        }
        if (Number(task.status) === CampaignTaskStatus.Planned) {
          existing.plannedTasks += 1;
        }
        existing.totalSubTasks += detail?.memberTaskCount || 0;
        existing.assignedSubTasks +=
          detail?.memberTasks?.filter(
            (memberTask) => memberTask.status === MemberTaskStatus.Assigned,
          ).length || 0;
        existing.completedSubTasks += detail?.completedMemberTaskCount || 0;
        existing.inProgressSubTasks +=
          detail?.memberTasks?.filter(
            (memberTask) => memberTask.status === MemberTaskStatus.InProgress,
          ).length || 0;
        existing.failedSubTasks +=
          detail?.memberTasks?.filter((memberTask) => memberTask.status === MemberTaskStatus.Failed)
            .length || 0;
        existing.cancelledSubTasks +=
          detail?.memberTasks?.filter(
            (memberTask) => memberTask.status === MemberTaskStatus.Cancelled,
          ).length || 0;
        return;
      }

      grouped.set(key, {
        teamId: task.campaignTeamId,
        campaignTeamId: task.campaignTeamId,
        campaignId: task.campaignId,
        teamName: campaignTeam?.teamName || task.campaignTeamName || 'Đội cứu trợ',
        teamType: 'Cứu trợ',
        campaignName:
          stationReliefCampaigns.find((campaign) => campaign.campaignId === task.campaignId)
            ?.name || 'Chiến dịch cứu trợ',
        campaignStatus:
          stationReliefCampaigns
            .find((campaign) => campaign.campaignId === task.campaignId)
            ?.status?.toString() || String(CampaignStatus.InProgress),
        campaignTeamStatus: String(campaignTeam?.status ?? CampaignTeamStatus.Active),
        totalTasks: 1,
        plannedTasks: Number(task.status) === CampaignTaskStatus.Planned ? 1 : 0,
        inProgressTasks: Number(task.status) === CampaignTaskStatus.InProgress ? 1 : 0,
        blockedTasks: Number(task.status) === CampaignTaskStatus.Blocked ? 1 : 0,
        completedTasks: Number(task.status) === CampaignTaskStatus.Completed ? 1 : 0,
        cancelledTasks: Number(task.status) === CampaignTaskStatus.Cancelled ? 1 : 0,
        totalSubTasks: detail?.memberTaskCount || 0,
        assignedSubTasks:
          detail?.memberTasks?.filter(
            (memberTask) => memberTask.status === MemberTaskStatus.Assigned,
          ).length || 0,
        inProgressSubTasks:
          detail?.memberTasks?.filter(
            (memberTask) => memberTask.status === MemberTaskStatus.InProgress,
          ).length || 0,
        completedSubTasks: detail?.completedMemberTaskCount || 0,
        failedSubTasks:
          detail?.memberTasks?.filter((memberTask) => memberTask.status === MemberTaskStatus.Failed)
            .length || 0,
        cancelledSubTasks:
          detail?.memberTasks?.filter(
            (memberTask) => memberTask.status === MemberTaskStatus.Cancelled,
          ).length || 0,
        householdCount: 0,
        pendingHouseholdCount: 0,
        deliveredHouseholdCount: 0,
        totalDeliveryCount: 0,
        pendingDeliveryCount: 0,
        deliveredDeliveryCount: 0,
        defaultReliefPackageName: null,
        lastTaskUpdatedAt: task.createdAt,
      });
    });

    return Array.from(grouped.values());
  }, [
    allowedCampaignIds,
    allowedCampaignTeamsByCampaignId,
    rawReliefTaskDetailQueries,
    rawReliefTaskQueries,
    stationReliefCampaigns,
  ]);
  const filteredReliefTeamMissions = useMemo(
    () =>
      reliefTeamMissions.filter(
        (item: any) =>
          allowedCampaignIds.has(item.campaignId) &&
          allowedCampaignTeamIds.has(item.campaignTeamId),
      ),
    [allowedCampaignIds, allowedCampaignTeamIds, reliefTeamMissions],
  );
  const effectiveReliefTeamMissions =
    filteredReliefTeamMissions.length > 0 ? filteredReliefTeamMissions : fallbackReliefTeamMissions;

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
  const utilizationData = (vehicleUtilizationReport.data ||
    null) as VehicleUtilizationReportResponse | null;
  const utilizationRows = (utilizationData?.items || []) as VehicleUtilizationReportItem[];
  const reliefWorkloadRows = workloadRows.filter(
    (item) =>
      item.teamName.toLowerCase().includes('cứu trợ') ||
      item.teamName.toLowerCase().includes('relief'),
  );
  const rescueWorkloadRows = workloadRows.filter((item) => !reliefWorkloadRows.includes(item));
  const stockRows = (inventoryStockReport.data?.items || []) as InventoryStockReportItem[];
  const deliveryRows = (reliefDeliveriesReport.data?.items || []) as ReliefDeliveryReportItem[];
  const reliefMissionRows = useMemo(
    () => (reliefMissionReport.data || []) as ReliefMissionReportRowItem[],
    [reliefMissionReport.data],
  );
  const reliefMissionCampaignSummary = useMemo<ReliefMissionCampaignSummaryItem[]>(() => {
    const summaryMap = new Map<string, ReliefMissionCampaignSummaryItem>();

    for (const item of reliefMissionRows) {
      const existing = summaryMap.get(item.campaignId);
      if (existing) {
        existing.teamIds.add(item.teamId);
        existing.taskCount += 1;
        existing.blockedTaskCount += item.campaignTaskStatus.toLowerCase().includes('blocked')
          ? 1
          : 0;
        existing.totalSubTaskCount += item.totalSubTasks;
        existing.completedSubTaskCount += item.completedSubTasks;
        existing.inProgressSubTaskCount += item.inProgressSubTasks;
        existing.failedSubTaskCount += item.failedSubTasks;
        existing.cancelledSubTaskCount += item.cancelledSubTasks;
      } else {
        summaryMap.set(item.campaignId, {
          campaignId: item.campaignId,
          campaignName: item.campaignName,
          campaignStatus: item.campaignStatus,
          teamCount: 1,
          taskCount: 1,
          blockedTaskCount: item.campaignTaskStatus.toLowerCase().includes('blocked') ? 1 : 0,
          totalSubTaskCount: item.totalSubTasks,
          completedSubTaskCount: item.completedSubTasks,
          inProgressSubTaskCount: item.inProgressSubTasks,
          failedSubTaskCount: item.failedSubTasks,
          cancelledSubTaskCount: item.cancelledSubTasks,
          teamIds: new Set([item.teamId]),
        });
      }
    }

    return Array.from(summaryMap.values())
      .map((item) => ({ ...item, teamCount: item.teamIds.size }))
      .sort((a, b) => b.completedSubTaskCount - a.completedSubTaskCount);
  }, [reliefMissionRows]);

  const teamOptions = useMemo(
    () =>
      (stationTeams || []).map((team) => ({
        label: team.name,
        value: team.teamId,
        note: team.teamTypeName || 'Chưa rõ',
      })),
    [stationTeams],
  );

  const reliefCampaignOptions = useMemo(
    () =>
      (stationReliefCampaigns || []).map((campaign) => ({
        label: campaign.name,
        value: campaign.campaignId,
        note: getCampaignStatusLabel(campaign.status),
      })),
    [stationReliefCampaigns],
  );

  const selectedTeamLabel =
    selectedTeamIds.length === 0
      ? 'Tất cả đội trong trạm'
      : selectedTeamIds.length === 1
        ? teamOptions.find((option) => option.value === selectedTeamIds[0])?.label ||
          '1 đội đã chọn'
        : `${selectedTeamIds.length} đội đã chọn`;

  const toggleTeamFilter = (teamId: string) => {
    setSelectedTeamIds((current) =>
      current.includes(teamId) ? current.filter((id) => id !== teamId) : [...current, teamId],
    );
  };

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
                <CoordinatorDashboardOverviewSection
                  metricCards={[
                    {
                      title: 'Chờ cứu hộ',
                      value: formatNumberVN(overview?.pendingRescueRequests || 0),
                      note: 'Số yêu cầu cứu hộ đang chờ trạm tiếp nhận và xử lý.',
                      icon: 'local_police',
                      tone: 'warning',
                    },
                    {
                      title: 'Đang cứu hộ',
                      value: formatNumberVN(overview?.inProgressRescueRequests || 0),
                      note: 'Các yêu cầu đang được đội cứu hộ của trạm xử lý.',
                      icon: 'route',
                      tone: 'info',
                    },
                    {
                      title: 'Đội hoạt động',
                      value: formatNumberVN(overview?.activeTeams || 0),
                      note: 'Số đội đang trực hoặc đang tham gia nhiệm vụ hiện tại.',
                      icon: 'groups',
                      tone: 'success',
                    },
                    {
                      title: 'Xe sẵn sàng',
                      value: formatNumberVN(overview?.availableVehicles || 0),
                      note: 'Phương tiện có thể điều động ngay cho nhiệm vụ cứu hộ, cứu trợ.',
                      icon: 'local_shipping',
                      tone: 'success',
                    },
                    {
                      title: 'Thông báo chưa xem',
                      value: formatNumberVN(overview?.unreadNotifications || 0),
                      note: 'Thông báo, cảnh báo và cập nhật vận hành chưa được mở xem.',
                      icon: 'notifications',
                      tone: 'warning',
                    },
                    {
                      title: 'Tồn kho thấp',
                      value: formatNumberVN(overview?.lowStockItems || 0),
                      note: 'Số vật tư đang ở mức thấp và cần theo dõi hoặc bổ sung thêm.',
                      icon: 'inventory_2',
                      tone: 'destructive',
                    },
                  ]}
                  rescueStatusChart={rescueStatusChart}
                  rescueTypeChart={rescueTypeChart}
                  rescueLocationItems={rescueLocationItems}
                  isRescueLocationsLoading={dashboard.rescueLocationsQuery.isLoading}
                  vehicleTypeChart={vehicleTypeChart}
                  totalVehicles={vehicleSummary?.total || 0}
                  activeDispatch={activeDispatch}
                  teamTable={teamTable}
                  chartColors={chartColors}
                  formatNumberVN={formatNumberVN}
                  formatDateTime={formatDateTime}
                  translateTeamTypeLabel={translateTeamTypeLabel}
                  renderMetricCard={(props) => <MetricCard {...props} />}
                  renderStatusChip={(value) => <StatusChip value={value} />}
                />

                <CoordinatorReliefTeamMissionsSection
                  items={effectiveReliefTeamMissions as any}
                  translateTeamTypeLabel={translateTeamTypeLabel}
                  formatNumberVN={formatNumberVN}
                  formatDateTime={formatDateTime}
                  renderStatusChip={(value) => <StatusChip value={value} />}
                  renderEmphasisNumber={(value, tone) => (
                    <EmphasisNumber value={value} tone={tone} />
                  )}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-border bg-card">
              <CardContent className="p-4 md:p-5 space-y-4">
                <CoordinatorDashboardReportControls
                  fromDate={fromDate}
                  toDate={toDate}
                  groupBy={(groupBy || 'day') as 'day' | 'week' | 'month'}
                  setGroupBy={(value) => setGroupBy(value)}
                  setSection={setSection}
                  onRefresh={() => void dashboard.refetchAll()}
                  onChangeFromDate={(value) =>
                    resetPageState(value, setFromDate, [
                      () => setRescuePage(1),
                      () => setInventoryPage(1),
                      () => setDeliveryPage(1),
                    ])
                  }
                  onChangeToDate={(value) =>
                    resetPageState(value, setToDate, [
                      () => setRescuePage(1),
                      () => setInventoryPage(1),
                      () => setDeliveryPage(1),
                    ])
                  }
                  selectedTeamLabel={selectedTeamLabel}
                  selectedTeamIds={selectedTeamIds}
                  setSelectedTeamIds={setSelectedTeamIds}
                  teamOptions={teamOptions}
                  isLoadingTeams={isLoadingTeams}
                  toggleTeamFilter={toggleTeamFilter}
                />

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
                      <div className="min-w-0 space-y-2">
                        <p className="text-sm font-semibold text-foreground">Bộ lọc trạng thái</p>
                        <Select
                          value={rescueStatus || 'all'}
                          onValueChange={(value) =>
                            resetPageState(value === 'all' ? '' : value, setRescueStatus, [
                              () => setRescuePage(1),
                            ])
                          }
                        >
                          <SelectTrigger className="w-full min-w-0 md:w-[240px]">
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
                    {selectedReliefPlanSummary ? (
                      <CoordinatorReliefPlanSummaryCard planSummary={selectedReliefPlanSummary} />
                    ) : null}

                    <CoordinatorReliefMissionCampaignSummarySection
                      items={reliefMissionCampaignSummary}
                      formatNumberVN={formatNumberVN}
                      renderStatusChip={(value: string | null | undefined) => (
                        <StatusChip value={value} />
                      )}
                      renderEmphasisNumber={(
                        value: string,
                        tone: 'success' | 'warning' | 'destructive' | 'info',
                      ) => <EmphasisNumber value={value} tone={tone} />}
                    />

                    <CoordinatorReliefMissionReportSection
                      isLoading={reliefMissionReport.isLoading}
                      rows={reliefMissionRows}
                      formatDate={formatDate}
                      formatNumberVN={formatNumberVN}
                      translateStatusLabel={translateStatusLabel}
                      renderStatusChip={(value: string | null | undefined) => (
                        <StatusChip value={value} />
                      )}
                      renderEmphasisNumber={(
                        value: string,
                        tone: 'success' | 'warning' | 'destructive' | 'info',
                      ) => <EmphasisNumber value={value} tone={tone} />}
                    />

                    {teamWorkloadReport.isLoading ? (
                      <LoadingGrid count={1} />
                    ) : teamWorkloadReport.isError ? (
                      <EmptyState
                        title="Không tải được báo cáo tải đội"
                        description="Thử làm mới hoặc kiểm tra lại API."
                      />
                    ) : workloadRows.length > 0 ? (
                      <CoordinatorTeamWorkloadSection
                        rescueRows={rescueWorkloadRows}
                        reliefRows={reliefWorkloadRows}
                        formatNumberVN={formatNumberVN}
                      />
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
                      <>
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
                        {utilizationData ? (
                          <CoordinatorListPagination
                            currentPage={utilizationData.currentPage}
                            totalPages={utilizationData.totalPages}
                            onPageChange={setVehiclePage}
                            summary={`Hiển thị ${utilizationRows.length} / ${formatNumberVN(utilizationData.totalCount)} phương tiện`}
                          />
                        ) : null}
                      </>
                    ) : (
                      <EmptyState
                        title="Không có dữ liệu"
                        description="Báo cáo hiệu suất phương tiện sẽ hiển thị tại đây."
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="inventory-stock" className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div className="min-w-0 space-y-2">
                        <p className="text-sm font-semibold text-foreground">Kho vật tư</p>
                        <Select
                          value={inventoryId || 'all'}
                          onValueChange={(value) =>
                            resetPageState(value === 'all' ? '' : value, setInventoryId, [
                              () => setInventoryPage(1),
                            ])
                          }
                        >
                          <SelectTrigger className="w-full min-w-0">
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
                      <div className="min-w-0 space-y-2">
                        <p className="text-sm font-semibold text-foreground">Trạng thái kho</p>
                        <Select
                          value={inventoryStatus || 'all'}
                          onValueChange={(value) =>
                            resetPageState(value === 'all' ? '' : value, setInventoryStatus, [
                              () => setInventoryPage(1),
                            ])
                          }
                        >
                          <SelectTrigger className="w-full min-w-0">
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
                    <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
                      <div className="min-w-0 space-y-2">
                        <p className="text-sm font-semibold text-foreground">Chiến dịch cứu trợ</p>
                        <Select
                          value={effectiveSelectedReliefCampaignId || 'all'}
                          onValueChange={(value) =>
                            resetPageState(
                              value === 'all' ? '' : value,
                              setSelectedReliefCampaignId,
                              [() => setDeliveryPage(1)],
                            )
                          }
                        >
                          <SelectTrigger className="w-full min-w-0">
                            <SelectValue placeholder="Chọn chiến dịch cứu trợ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả chiến dịch cứu trợ của trạm</SelectItem>
                            {isLoadingReliefCampaigns ? (
                              <SelectItem value="loading-campaigns" disabled>
                                Đang tải danh sách chiến dịch...
                              </SelectItem>
                            ) : (
                              reliefCampaignOptions.map((campaign) => (
                                <SelectItem key={campaign.value} value={campaign.value}>
                                  {campaign.label} - {campaign.note}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="min-w-0 space-y-2">
                        <p className="text-sm font-semibold text-foreground">Trạng thái</p>
                        <Select
                          value={deliveryStatus || 'all'}
                          onValueChange={(value) =>
                            resetPageState(value === 'all' ? '' : value, setDeliveryStatus, [
                              () => setDeliveryPage(1),
                            ])
                          }
                        >
                          <SelectTrigger className="w-full min-w-0">
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

                    {activeReliefCampaigns.length === 1 ? (
                      <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800">
                        Đã tự động chọn chiến dịch cứu trợ đang hoạt động của trạm:{' '}
                        <span className="font-semibold">{activeReliefCampaigns[0].name}</span>
                      </div>
                    ) : null}

                    {reliefDeliveriesReport.isLoading ? (
                      <LoadingGrid count={1} />
                    ) : reliefDeliveriesReport.isError ? (
                      <EmptyState
                        title="Không tải được báo cáo giao cứu trợ"
                        description="Kiểm tra bộ lọc chiến dịch hoặc quyền truy cập API."
                      />
                    ) : (
                      <CoordinatorReliefDeliveriesSection
                        rows={deliveryRows}
                        pagination={reliefDeliveriesReport.data ?? null}
                        onPageChange={setDeliveryPage}
                        translateDeliveryModeLabel={translateDeliveryModeLabel}
                        renderStatusChip={(value: string | null | undefined) => (
                          <StatusChip value={value} />
                        )}
                        formatNumberVN={formatNumberVN}
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
