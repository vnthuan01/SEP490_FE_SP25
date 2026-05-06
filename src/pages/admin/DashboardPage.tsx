import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LargeDisasterMapSheet } from '@/components/shared/disaster/LargeDisasterMapSheet';
import { StatsCard } from '@/pages/admin/components/StatsCard';
import { DonationChart } from '@/pages/admin/components/DonationChart';
import { VisitorChart } from '@/pages/admin/components/VisitorChart';
import { CampaignProgress } from '@/pages/admin/components/CampaignProgress';
import { TeamOverview } from '@/pages/admin/components/TeamOverview';
import { InventoryStats } from '@/pages/admin/components/InventoryStats';
import { SystemAlertsCard } from '@/pages/admin/components/SystemAlertsCard';
import { RequestHighlightsCard } from '@/pages/admin/components/RequestHighlightsCard';
import { RecentActivityCard } from '@/pages/admin/components/RecentActivityCard';
import { UpcomingCampaignsCard } from '@/pages/admin/components/UpcomingCampaignsCard';
import { LogisticsOverviewCard } from '@/pages/admin/components/LogisticsOverviewCard';
import { adminNavItems, adminProjects } from './components/sidebarConfig';
import { formatNumberVN } from '@/lib/utils';
import {
  useAdminDashboardOverview,
  type AdminDashboardTimeRange,
} from '@/hooks/useAdminDashboardOverview';
import { useProvincialStations } from '@/hooks/useReliefStations';
import { useAnalyzeDisasterRisks } from '@/hooks/useDisasterAnalysis';
import { getAdministrativeBoundary, reverseGeocodeV2 } from '@/services/goongService';
import {
  getRiskHeadlineVN,
  type AnalyzeDisasterRiskResponse,
} from '@/services/disasterAnalysisService';
import {
  buildStationAnalysisPoints,
  isPointInBoundaryPolygon,
  isPointWithinStationFallbackArea,
  toAnalysisCoordKey,
} from '@/lib/disasterAnalysisPoints';
import { DisasterForecastMapPanel } from '@/pages/manager/components/DisasterForecastMapPanel';
import { DisasterType, EntityStatus, getDisasterTypeLabel } from '@/enums/beEnums';
import { useDonationAdminExport } from '@/hooks/useDonations';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const GOONG_API_KEY =
  import.meta.env.VITE_GOONG_API_KEY || import.meta.env.VITE_GOONG_MAP_KEY || '';

const DISASTER_TYPE_LOOKUP: Record<string, number> = {
  flood: DisasterType.Flood,
  landslide: DisasterType.Landslide,
  earthquake: DisasterType.Earthquake,
  fire: DisasterType.Fire,
  storm: DisasterType.Storm,
  other: DisasterType.Other,
};

const resolveDisasterTypeValue = (value?: string | null) => {
  const key = String(value || '')
    .trim()
    .toLowerCase();
  return key in DISASTER_TYPE_LOOKUP ? DISASTER_TYPE_LOOKUP[key] : DisasterType.Other;
};

const getEffectiveDisasterType = (analysis: AnalyzeDisasterRiskResponse) =>
  analysis.primaryDisasterType ||
  analysis.ai?.primaryRiskType ||
  analysis.ai?.requestedRiskType ||
  analysis.requestedDisasterType ||
  analysis.riskRanking?.[0]?.disasterType ||
  String(DisasterType.Other);

const getDisasterTheme = (value?: string | null) => {
  const numericValue = resolveDisasterTypeValue(value);
  if (numericValue === DisasterType.Flood) {
    return {
      color: '#2563eb',
      light: 'rgba(37,99,235,0.18)',
      cardClass: 'border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-300',
      icon: 'water',
    };
  }
  if (numericValue === DisasterType.Storm) {
    return {
      color: '#7c3aed',
      light: 'rgba(124,58,237,0.18)',
      cardClass: 'border-violet-500/30 bg-violet-500/5 text-violet-700 dark:text-violet-300',
      icon: 'thunderstorm',
    };
  }
  return {
    color: '#475569',
    light: 'rgba(71,85,105,0.18)',
    cardClass: 'border-slate-500/30 bg-slate-500/5 text-slate-700 dark:text-slate-300',
    icon: 'warning',
  };
};

const parseRiskLevelVN = (level?: string | null) => {
  const normalized = String(level || '')
    .trim()
    .toLowerCase();
  if (normalized.includes('critical') || normalized.includes('very high')) {
    return { label: 'Cực kỳ nguy hiểm', class: 'text-red-600' };
  }
  if (normalized.includes('high') || normalized.includes('cao')) {
    return { label: 'Nguy hiểm cao', class: 'text-orange-600' };
  }
  if (normalized.includes('medium') || normalized.includes('trung')) {
    return { label: 'Nguy hiểm trung bình', class: 'text-amber-600' };
  }
  return { label: 'Nguy hiểm thấp', class: 'text-emerald-600' };
};

const parseWeatherConditionVN = (condition?: string | null) => {
  const normalized = String(condition || '')
    .trim()
    .toLowerCase();
  if (normalized.includes('clear') || normalized.includes('sunny')) return 'Trời quang';
  if (normalized.includes('cloudy') || normalized.includes('overcast')) return 'Nhiều mây';
  if (normalized.includes('rain') || normalized.includes('drizzle')) return 'Có mưa';
  if (normalized.includes('storm') || normalized.includes('thunder')) return 'Dông bão';
  return condition || 'Không rõ';
};

const getDisplayDisasterLabel = (analysis: AnalyzeDisasterRiskResponse) => {
  const numericValue = resolveDisasterTypeValue(getEffectiveDisasterType(analysis));
  if (numericValue === DisasterType.Other) {
    return analysis.weather?.baseWeatherRiskLevel?.toLowerCase() === 'low'
      ? 'Thời tiết ổn định'
      : 'Thời tiết cần theo dõi';
  }
  return getDisasterTypeLabel(numericValue);
};

const getAnalysisPriorityScore = (analysis: AnalyzeDisasterRiskResponse) => {
  const heuristicScore = Number(analysis.heuristic?.overallRiskScore || 0);
  const severeRisk = Math.max(
    0,
    ...(analysis.forecast?.days?.map((day) => Number(day.severeRisk || 0)) || [0]),
  );
  const maxDailyPrecip = Number(analysis.forecast?.maxDailyPrecipMm || 0);
  return heuristicScore + severeRisk * 0.8 + maxDailyPrecip * 2;
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<AdminDashboardTimeRange>('30d');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalyzeDisasterRiskResponse | null>(
    null,
  );
  const [highlightedAnalysisId, setHighlightedAnalysisId] = useState<string | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const [disasterFilter, setDisasterFilter] = useState<string>('all');
  const [openMapSheet, setOpenMapSheet] = useState(false);
  const [analysisRenderKey, setAnalysisRenderKey] = useState(0);
  const [customAnalyses, setCustomAnalyses] = useState<AnalyzeDisasterRiskResponse[]>([]);
  const [focusedStationId, setFocusedStationId] = useState<string | null>(null);
  const [selectedCustomPoint, setSelectedCustomPoint] = useState<{
    latitude: number;
    longitude: number;
    stationId: string | null;
    stationName: string;
    distanceKm: number;
  } | null>(null);
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const { mutateAsync: exportDonations, status: exportStatus } = useDonationAdminExport();
  const {
    isLoading,
    formatCurrencyVN,
    formatDateTimeVN,
    metrics,
    campaignProgress,
    donationByRange,
    requestByTime,
    topTeams,
    teamFilterOptions,
    inventoryStats,
    activityFeed,
    requestHighlights,
    upcomingCampaigns,
    systemAlerts,
    logisticsOverview,
    widgets,
  } = useAdminDashboardOverview(timeRange, {
    teamId: teamFilter === 'all' ? undefined : teamFilter,
    campaignId: campaignFilter === 'all' ? undefined : campaignFilter,
  });

  const { data: stationsData } = useProvincialStations({ pageIndex: 1, pageSize: 200 });
  const stations = useMemo(() => stationsData?.items || [], [stationsData]);
  const mapStations = useMemo(
    () =>
      stations
        .filter(
          (station) =>
            typeof station.latitude === 'number' &&
            typeof station.longitude === 'number' &&
            Number(station.status) === EntityStatus.Active,
        )
        .map((station) => ({
          id: station.reliefStationId ?? station.stationId ?? station.id,
          name: station.name,
          latitude: Number(station.latitude || 0),
          longitude: Number(station.longitude || 0),
          coverageRadiusKm: station.coverageRadiusKm ?? null,
          address: station.address,
          contactNumber: station.contactNumber,
          level: station.level,
        })),
    [stations],
  );

  const areaLookupQueries = useQueries({
    queries: mapStations.map((station) => ({
      queryKey: [
        'admin-station-analysis-area',
        station.id ?? station.name,
        station.latitude,
        station.longitude,
      ],
      enabled: Boolean(GOONG_API_KEY),
      staleTime: 30 * 60 * 1000,
      retry: 1,
      queryFn: async () => {
        const response = await reverseGeocodeV2(station.latitude, station.longitude, { limit: 1 });
        const result = response.results?.[0];
        return {
          stationId: station.id ?? null,
          areaName:
            result?.compound?.district ||
            result?.compound?.province ||
            result?.formatted_address ||
            station.name,
        };
      },
    })),
  });
  const stationBoundaryQueries = useQueries({
    queries: mapStations.map((station) => ({
      queryKey: [
        'admin-station-boundary',
        station.id ?? station.name,
        station.latitude,
        station.longitude,
      ],
      enabled: Boolean(GOONG_API_KEY),
      staleTime: 6 * 60 * 60 * 1000,
      retry: 0,
      queryFn: async () => ({
        stationId: station.id ?? null,
        boundary: await getAdministrativeBoundary(
          station.latitude,
          station.longitude,
          GOONG_API_KEY,
        ),
      }),
    })),
  });
  const areaNameByStationId = useMemo(() => {
    const map = new Map<string | null, string>();
    areaLookupQueries.forEach((query) => {
      if (query.data?.stationId) map.set(query.data.stationId, query.data.areaName);
    });
    return map;
  }, [areaLookupQueries]);
  const stationBoundaryById = useMemo(() => {
    const lookup: Record<string, number[][][] | null | undefined> = {};
    stationBoundaryQueries.forEach((query) => {
      const stationId = query.data?.stationId;
      if (stationId) lookup[String(stationId)] = query.data?.boundary?.coordinates || null;
    });
    return lookup;
  }, [stationBoundaryQueries]);

  const disasterPayloadsWithMeta = useMemo(
    () =>
      mapStations.flatMap((station) => {
        const stationId = station.id ?? null;
        const analysisPoints = buildStationAnalysisPoints(
          { latitude: station.latitude, longitude: station.longitude },
          station.coverageRadiusKm,
        );
        const stationBoundary = stationId ? stationBoundaryById[String(stationId)] : null;
        const areaName = areaNameByStationId.get(stationId) || station.name;
        return analysisPoints
          .filter((point) => {
            const isInsideFallback = isPointWithinStationFallbackArea(point, station);
            const isInsideBoundary = stationBoundary?.length
              ? isPointInBoundaryPolygon(point, stationBoundary)
              : true;
            return isInsideFallback && isInsideBoundary;
          })
          .slice(0, 2)
          .map((point, index) => ({
            stationId,
            payload: {
              latitude: point.latitude,
              longitude: point.longitude,
              locationName: `${station.name} - ${point.label}`,
              additionalContext: `Phân tích nguy cơ thiên tai cho vị trí đại diện số ${index + 1} quanh trạm ${station.name}. Khu vực tham chiếu: ${areaName}. Ngữ cảnh địa bàn: ${point.context}.`,
            },
          }));
      }),
    [mapStations, areaNameByStationId, stationBoundaryById],
  );
  const disasterPayloads = useMemo(
    () => disasterPayloadsWithMeta.map(({ payload }) => payload),
    [disasterPayloadsWithMeta],
  );
  const {
    analyses: disasterAnalyses,
    isLoading: isLoadingDisaster,
    hasMissingNearestData,
    refreshAnalysis,
    refreshStatus,
  } = useAnalyzeDisasterRisks(disasterPayloads);
  const mergedDisasterAnalyses = useMemo(() => {
    const merged = new Map<string, AnalyzeDisasterRiskResponse>();
    [...disasterAnalyses, ...customAnalyses].forEach((analysis) => {
      merged.set(toAnalysisCoordKey(analysis.latitude, analysis.longitude), analysis);
    });
    return Array.from(merged.values());
  }, [customAnalyses, disasterAnalyses]);
  const handleRefreshLatestAnalysis = async () => {
    const target = selectedAnalysis
      ? {
          latitude: selectedAnalysis.latitude,
          longitude: selectedAnalysis.longitude,
          locationName: selectedAnalysis.locationName,
        }
      : disasterPayloads[0];
    if (!target) return;
    toast.info('Đang lấy dự đoán mới nhất...');
    try {
      setSelectedAnalysis(null);
      await refreshAnalysis(target);
      setAnalysisRenderKey((prev) => prev + 1);
      toast.success('Đã cập nhật dự đoán mới nhất thành công.');
    } catch {
      toast.error('Không thể lấy dự đoán mới nhất. Vui lòng thử lại.');
    }
  };
  const filteredAnalyses = useMemo(() => {
    if (disasterFilter === 'all') return mergedDisasterAnalyses;
    return mergedDisasterAnalyses.filter(
      (analysis) =>
        String(resolveDisasterTypeValue(getEffectiveDisasterType(analysis))) === disasterFilter,
    );
  }, [mergedDisasterAnalyses, disasterFilter]);
  const visibleDisasterAnalyses = refreshStatus === 'pending' ? [] : mergedDisasterAnalyses;
  const visibleFilteredAnalyses = refreshStatus === 'pending' ? [] : filteredAnalyses;
  const visibleSelectedAnalysis = refreshStatus === 'pending' ? null : selectedAnalysis;
  const topRisk = useMemo(() => {
    if (!mergedDisasterAnalyses.length) return null;
    return [...mergedDisasterAnalyses].sort(
      (a, b) => getAnalysisPriorityScore(b) - getAnalysisPriorityScore(a),
    )[0];
  }, [mergedDisasterAnalyses]);
  const shouldShowTopRiskBanner = useMemo(() => {
    if (!topRisk) return false;
    if (Number(topRisk.heuristic?.overallRiskScore || 0) < 50) return false;
    const typeValue = resolveDisasterTypeValue(getEffectiveDisasterType(topRisk));
    return !(
      typeValue === DisasterType.Other &&
      topRisk.weather?.baseWeatherRiskLevel?.toLowerCase() === 'low'
    );
  }, [topRisk]);
  const stationTopAnalysisMap = useMemo(() => {
    const byStation = new Map<string | null, AnalyzeDisasterRiskResponse>();
    disasterPayloadsWithMeta.forEach((meta) => {
      const analysis = mergedDisasterAnalyses.find(
        (item) =>
          toAnalysisCoordKey(item.latitude, item.longitude) ===
          toAnalysisCoordKey(meta.payload.latitude, meta.payload.longitude),
      );
      if (!analysis) return;
      const current = byStation.get(meta.stationId);
      if (
        !current ||
        Number(analysis.heuristic?.overallRiskScore || 0) >
          Number(current.heuristic?.overallRiskScore || 0)
      ) {
        byStation.set(meta.stationId, analysis);
      }
    });
    return byStation;
  }, [disasterPayloadsWithMeta, mergedDisasterAnalyses]);

  const handleAnalyzeCustomPoint = async (point: {
    latitude: number;
    longitude: number;
    stationId: string | null;
    stationName: string;
    distanceKm: number;
  }) => {
    const payload = {
      latitude: point.latitude,
      longitude: point.longitude,
      locationName: `${point.stationName} - Điểm chọn thủ công`,
      additionalContext: `Phân tích theo điểm người dùng chọn trên bản đồ, cách trạm ${point.stationName} khoảng ${point.distanceKm.toFixed(1)}km và vẫn nằm trong ranh giới tỉnh phụ trách của trạm.`,
    };

    toast.info('Đang phân tích điểm bạn chọn trên bản đồ...');
    try {
      const normalized = await refreshAnalysis(payload);
      if (!normalized) {
        toast.error('Điểm đã chọn không hợp lệ để phân tích.');
        return;
      }
      setCustomAnalyses((current) => {
        const next = current.filter((item) => {
          const isSameCoord =
            toAnalysisCoordKey(item.latitude, item.longitude) ===
            toAnalysisCoordKey(normalized.latitude, normalized.longitude);
          const isSameStationCustom = item.locationName === payload.locationName;
          return !isSameCoord && !isSameStationCustom;
        });
        return [...next, normalized];
      });
      selectAnalysisWithPulse(normalized);
      toast.success('Đã phân tích xong điểm bạn chọn.');
    } catch {
      toast.error('Không thể phân tích điểm đã chọn. Vui lòng thử lại.');
    }
  };

  const openMapSheetWithSelection = () => {
    if (!selectedAnalysis && filteredAnalyses.length > 0) {
      const preferred = topRisk
        ? filteredAnalyses.find((item) => item.analysisLogId === topRisk.analysisLogId)
        : null;
      setSelectedAnalysis(preferred || filteredAnalyses[0]);
    }
    setOpenMapSheet(true);
  };

  const selectAnalysisWithPulse = (analysis: AnalyzeDisasterRiskResponse | null) => {
    setSelectedAnalysis(analysis);
    if (!analysis?.analysisLogId) return;
    setHighlightedAnalysisId(analysis.analysisLogId);
    if (highlightTimerRef.current) window.clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedAnalysisId((current) => (current === analysis.analysisLogId ? null : current));
    }, 2000);
  };

  const rangeLabel =
    timeRange === '7d'
      ? '7 ngày gần nhất'
      : timeRange === '30d'
        ? '30 ngày gần nhất'
        : '12 tháng gần nhất';

  const campaignOptions = useMemo(
    () => upcomingCampaigns.map((campaign) => ({ id: campaign.id, name: campaign.name })),
    [upcomingCampaigns],
  );
  const teamOptions = useMemo(() => teamFilterOptions, [teamFilterOptions]);

  const handleExportDonationReport = async () => {
    const blob = await exportDonations();
    const csvText = await blob.text();
    const workbook = XLSX.read(csvText, { type: 'string' });
    XLSX.writeFile(
      workbook,
      `bao-cao-quyen-gop-tong-quan-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`,
    );
  };

  return (
    <DashboardLayout projects={adminProjects} navItems={adminNavItems}>
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="info" appearance="outline" size="sm" className="gap-1">
                  <span className="material-symbols-outlined text-[14px]">monitoring</span>
                  Toàn cảnh hệ thống cứu trợ
                </Badge>
                <Badge variant="success" appearance="outline" size="sm" className="gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {rangeLabel}
                </Badge>
              </div>
              <h1 className="mt-3 text-3xl font-black text-primary">Tổng quan điều hành</h1>
              <p className="text-muted-foreground mt-2 max-w-3xl">
                Theo dõi chiến dịch, yêu cầu cứu hộ, dòng tiền, tồn kho, đội ứng cứu và hoạt động
                vận hành của toàn hệ thống.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1">
                {(
                  [
                    { key: '7d', label: '7 ngày' },
                    { key: '30d', label: '30 ngày' },
                    { key: '12m', label: '12 tháng' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTimeRange(item.key)}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
                      timeRange === item.key
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2">
                <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                  <SelectTrigger className="h-10 min-w-[220px] border-0 bg-transparent shadow-none focus:ring-0">
                    <SelectValue placeholder="Lọc theo chiến dịch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả chiến dịch</SelectItem>
                    {campaignOptions.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="h-10 min-w-[220px] border-0 bg-transparent shadow-none focus:ring-0">
                    <SelectValue placeholder="Lọc theo đội" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả đội</SelectItem>
                    {teamOptions.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                className="bg-primary text-white gap-2 font-bold rounded-full"
                onClick={() => navigate('/portal/admin/donations')}
              >
                <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                Quản lý quyên góp
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full font-bold border-2 gap-2"
                onClick={() => window.open('/fundraising', '_blank', 'noopener,noreferrer')}
              >
                <span className="material-symbols-outlined text-lg">campaign</span>
                Mở Chiến dịch gây quỹ công khai
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full font-bold border-2 gap-2"
                onClick={() => void handleExportDonationReport()}
                disabled={exportStatus === 'pending'}
              >
                <span className="material-symbols-outlined text-lg">download</span>
                {exportStatus === 'pending' ? 'Đang xuất Excel...' : 'Xuất báo cáo Excel'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-stretch">
          {isLoading ? (
            <>
              <Skeleton className="h-[160px] rounded-2xl xl:col-span-3" />
              <Skeleton className="h-[160px] rounded-2xl xl:col-span-6" />
              <Skeleton className="h-[160px] rounded-2xl xl:col-span-3" />
              <Skeleton className="h-[148px] rounded-2xl xl:col-span-3" />
              <Skeleton className="h-[148px] rounded-2xl xl:col-span-3" />
              <Skeleton className="h-[148px] rounded-2xl xl:col-span-3" />
              <Skeleton className="h-[148px] rounded-2xl xl:col-span-3" />
            </>
          ) : (
            <>
              <StatsCard
                className="xl:col-span-3 h-[160px]"
                title="Tổng yêu cầu cứu hộ"
                value={formatNumberVN(metrics.requestCount)}
                icon="sos"
                trend={`${metrics.urgentRequestCount} yêu cầu ưu tiên cao / khẩn cấp`}
                variant="primary"
              />
              <StatsCard
                className="xl:col-span-6 h-[160px]"
                title="Quỹ hiện có"
                value={formatCurrencyVN(metrics.fundBalance)}
                icon="volunteer_activism"
                trend={`${formatNumberVN(metrics.contributionCount)} lượt đóng góp • ${formatNumberVN(metrics.fundSourceCampaigns)} chiến dịch tạo nguồn quỹ`}
                variant="success"
              />
              <StatsCard
                className="xl:col-span-3 h-[160px]"
                title="Chiến dịch đang hoạt động"
                value={formatNumberVN(metrics.activeCampaignCount)}
                icon="campaign"
                trend={`${metrics.completedCampaignCount} chiến dịch đã hoàn thành`}
                variant="info"
              />
              <StatsCard
                className="xl:col-span-3 h-[148px]"
                title="Người dùng hệ thống"
                value={formatNumberVN(metrics.usersCount)}
                icon="groups"
                trend={`${formatNumberVN(metrics.stationsCount)} trạm cứu trợ`}
                variant="warning"
              />
              <StatsCard
                className="xl:col-span-3 h-[148px]"
                title="Thông số kho hàng"
                value={formatNumberVN(metrics.criticalStockCount)}
                icon="inventory_2"
                trend={`${formatNumberVN(metrics.totalInventorySlots)} điểm chứa đang theo dõi`}
                variant="danger"
              />
              <StatsCard
                className="xl:col-span-3 h-[148px]"
                title="Đội cứu hộ"
                value={formatNumberVN(metrics.teamsCount)}
                icon="groups_3"
                trend={`${formatNumberVN(metrics.totalTeamMembers)} thành viên đã phân đội`}
                variant="purple"
              />
              <StatsCard
                className="xl:col-span-3 h-[148px]"
                title="Hoạt động logistics"
                value={formatNumberVN(metrics.transferCount + metrics.sessionCount)}
                icon="local_shipping"
                trend={`${formatNumberVN(metrics.pendingTransferCount)} phiếu chờ • ${formatNumberVN(metrics.inProgressSessionCount)} phiên đang chạy`}
                variant="teal"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          <div className="xl:col-span-12 min-w-0">
            {widgets.donation.isLoading ? (
              <Skeleton className="h-[480px] rounded-2xl" />
            ) : widgets.donation.isError ? (
              <Card className="border-border h-[480px]">
                <CardContent className="h-full flex flex-col items-center justify-center text-center px-8">
                  <span className="material-symbols-outlined text-4xl text-destructive">error</span>
                  <p className="mt-3 font-semibold text-foreground">Không tải được dữ liệu quỹ</p>
                  <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => void widgets.donation.retry()}
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Thử lại
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <DonationChart
                className="h-[480px] py-2"
                title="Dòng tiền quyên góp và quỹ hệ thống"
                subtitle="Tổng hợp từ API quỹ, nhóm theo thời gian bằng dữ liệu đóng góp hiện có"
                icon="payments"
                summaryLabel="Tổng quyên góp"
                trendLabel={`${formatNumberVN(metrics.fundSourceCampaigns)} chiến dịch tạo nguồn quỹ`}
                dataByRange={donationByRange}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          <RequestHighlightsCard
            className="xl:col-span-4 h-[340px]"
            requests={requestHighlights}
            isLoading={widgets.requestHighlights.isLoading}
            isError={widgets.requestHighlights.isError}
            onRetry={() => void widgets.requestHighlights.retry()}
          />

          <div className="xl:col-span-4 min-w-0">
            {widgets.requestsChart.isLoading ? (
              <Skeleton className="h-[340px] rounded-2xl" />
            ) : widgets.requestsChart.isError ? (
              <Card className="border-border h-[340px]">
                <CardContent className="h-full flex flex-col items-center justify-center text-center px-6">
                  <span className="material-symbols-outlined text-4xl text-destructive">error</span>
                  <p className="mt-3 font-semibold text-foreground">
                    Không tải được biểu đồ yêu cầu
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => void widgets.requestsChart.retry()}
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Thử lại
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <VisitorChart
                className="h-[340px]"
                data={requestByTime}
                title="Yêu cầu theo thời gian"
                subtitle="Dùng dữ liệu yêu cầu cứu hộ thay cho analytics/report riêng"
                icon="stacked_line_chart"
                trendLabel={requestHighlights.length ? 'Ưu tiên xử lý ngay' : undefined}
              />
            )}
          </div>

          <div className="xl:col-span-4 min-w-0">
            {isLoading ? (
              <Skeleton className="h-[340px] rounded-2xl" />
            ) : (
              <CampaignProgress
                className="h-[340px]"
                completed={campaignProgress.completed}
                inProgress={campaignProgress.inProgress}
                pending={campaignProgress.pending}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          <SystemAlertsCard
            className="xl:col-span-4 h-[360px]"
            alerts={systemAlerts}
            isLoading={widgets.alerts.isLoading}
            isError={widgets.alerts.isError}
            onRetry={() => void widgets.alerts.retry()}
          />
          <UpcomingCampaignsCard
            className="xl:col-span-5 h-[360px]"
            campaigns={upcomingCampaigns}
            isLoading={widgets.campaigns.isLoading}
            isError={widgets.campaigns.isError}
            onRetry={() => void widgets.campaigns.retry()}
          />
          <RecentActivityCard
            className="xl:col-span-3 h-[360px]"
            activities={activityFeed}
            isLoading={widgets.activity.isLoading}
            isError={widgets.activity.isError}
            onRetry={() => void widgets.activity.retry()}
            formatDateTime={formatDateTimeVN}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          <div className="xl:col-span-4 min-w-0">
            {widgets.inventory.isLoading ? (
              <Skeleton className="h-[360px] rounded-2xl" />
            ) : widgets.inventory.isError ? (
              <Card className="border-border h-[360px]">
                <CardContent className="h-full flex flex-col items-center justify-center text-center px-6">
                  <span className="material-symbols-outlined text-4xl text-destructive">error</span>
                  <p className="mt-3 font-semibold text-foreground">Không tải được thống kê kho</p>
                  <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => void widgets.inventory.retry()}
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Thử lại
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border h-[360px] overflow-hidden">
                <CardContent className="pt-6 h-full flex flex-col gap-4 overflow-hidden">
                  <InventoryStats
                    title="Tồn kho và vật tư thiết yếu"
                    items={inventoryStats.map((item) => ({
                      ...item,
                      textColorClass:
                        item.label === 'Điểm chứa kho'
                          ? 'text-primary'
                          : item.label === 'Mức thiếu hụt'
                            ? 'text-red-500'
                            : item.label === 'Danh mục vật tư'
                              ? 'text-emerald-600'
                              : 'text-amber-600',
                    }))}
                    className="border-0 shadow-none bg-transparent flex-1 min-h-0"
                  />
                  <div className="flex flex-wrap gap-2">
                    <div className="flex justify-between gap-2 rounded-full border border-border bg-primary/5 px-3 py-2 text-sm">
                      <span className="text-muted-foreground inline-flex items-center gap-1">
                        {' '}
                        <span className="material-symbols-outlined text-base text-primary">
                          warehouse
                        </span>
                        Kho đang quản lý:
                        <span className="font-black text-foreground">
                          {formatNumberVN(metrics.stationsCount)}
                        </span>
                      </span>

                      <span className="text-muted-foreground inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-base text-emerald-500">
                          inventory_2
                        </span>{' '}
                        Danh mục vật tư:
                        <span className="font-black text-foreground">
                          {formatNumberVN(metrics.supplyItemsCount)}
                        </span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <LogisticsOverviewCard
            className="xl:col-span-4 h-[360px]"
            cards={logisticsOverview.cards}
            isLoading={widgets.logistics.isLoading}
            isError={widgets.logistics.isError}
            onRetry={() => void widgets.logistics.retry()}
          />

          <div className="xl:col-span-4 min-w-0">
            {widgets.teamOverview.isLoading ? (
              <Skeleton className="h-[320px] rounded-2xl" />
            ) : widgets.teamOverview.isError ? (
              <Card className="border-border h-[320px]">
                <CardContent className="h-full flex flex-col items-center justify-center text-center px-6">
                  <span className="material-symbols-outlined text-4xl text-destructive">error</span>
                  <p className="mt-3 font-semibold text-foreground">Không tải được dữ liệu đội</p>
                  <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => void widgets.teamOverview.retry()}
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Thử lại
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <TeamOverview
                className="h-[360px]"
                title="Đội phản ứng nổi bật"
                icon="shield_person"
                teams={topTeams}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          {topRisk && !isLoadingDisaster && shouldShowTopRiskBanner && (
            <div
              className={`xl:col-span-12 rounded-2xl border p-5 ${getDisasterTheme(getEffectiveDisasterType(topRisk)).cardClass} cursor-pointer hover:shadow-sm transition-all`}
              onClick={() => {
                selectAnalysisWithPulse(topRisk);
                openMapSheetWithSelection();
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black">Nguy cơ {getDisplayDisasterLabel(topRisk)} cao nhất</p>
                  <p className="text-sm mt-1">{topRisk.locationName}</p>
                  <p className="text-xs font-semibold mt-1">{getRiskHeadlineVN(topRisk)}</p>
                </div>
                <Badge variant="outline" appearance="outline" size="sm" className="border gap-1">
                  {parseRiskLevelVN(topRisk.heuristic?.riskLevel).label}
                </Badge>
              </div>
            </div>
          )}

          <div className="xl:col-span-12">
            <DisasterForecastMapPanel
              mapStations={mapStations}
              analyses={visibleDisasterAnalyses}
              filteredAnalyses={visibleFilteredAnalyses}
              selectedAnalysis={visibleSelectedAnalysis}
              selectedCustomPoint={selectedCustomPoint}
              focusedStationId={focusedStationId}
              stationBoundaryById={stationBoundaryById}
              highlightedAnalysisId={highlightedAnalysisId}
              disasterFilter={disasterFilter}
              isLoadingDisaster={isLoadingDisaster}
              hasMissingNearestData={hasMissingNearestData}
              setDisasterFilter={setDisasterFilter}
              setSelectedAnalysis={selectAnalysisWithPulse}
              onOpenMap={openMapSheetWithSelection}
              onRefreshLatest={handleRefreshLatestAnalysis}
              onAnalyzeCustomPoint={handleAnalyzeCustomPoint}
              onSelectCustomPoint={setSelectedCustomPoint}
              isRefreshingLatest={refreshStatus === 'pending'}
              onSelectStation={(stationId) => {
                setFocusedStationId(stationId);
                if (!stationId) return;
                const topAnalysis = stationTopAnalysisMap.get(stationId);
                if (topAnalysis) selectAnalysisWithPulse(topAnalysis);
              }}
              parseRiskLevelVN={parseRiskLevelVN}
              parseWeatherConditionVN={parseWeatherConditionVN}
              getEffectiveDisasterType={getEffectiveDisasterType}
              getDisasterTheme={getDisasterTheme}
            />
          </div>

          <Card className="xl:col-span-12 bg-card border-border h-[260px]">
            <CardContent className="h-full flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">apartment</span>
                  <p className="text-lg font-bold text-foreground">Hạ tầng hệ thống hiện có</p>
                </div>
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs uppercase font-semibold text-muted-foreground">
                      Trạm cứu trợ
                    </p>
                    <p className="mt-2 text-xl font-black text-foreground">
                      {formatNumberVN(metrics.stationsCount)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs uppercase font-semibold text-muted-foreground">
                      Đội cứu hộ
                    </p>
                    <p className="mt-2 text-xl font-black text-foreground">
                      {formatNumberVN(metrics.teamsCount)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs uppercase font-semibold text-muted-foreground">
                      Vật tư cấu hình
                    </p>
                    <p className="mt-2 text-xl font-black text-foreground">
                      {formatNumberVN(metrics.supplyItemsCount)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs uppercase font-semibold text-muted-foreground">
                      Nguồn quỹ
                    </p>
                    <p className="mt-2 text-xl font-black text-foreground">
                      {formatNumberVN(metrics.fundSourceCampaigns)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <LargeDisasterMapSheet
        open={openMapSheet}
        onOpenChange={setOpenMapSheet}
        mapContent={
          <DisasterForecastMapPanel
            key={`admin-disaster-panel-${analysisRenderKey}`}
            mapStations={mapStations}
            analyses={visibleDisasterAnalyses}
            filteredAnalyses={visibleFilteredAnalyses}
            selectedAnalysis={visibleSelectedAnalysis}
            selectedCustomPoint={selectedCustomPoint}
            focusedStationId={focusedStationId}
            stationBoundaryById={stationBoundaryById}
            highlightedAnalysisId={highlightedAnalysisId}
            disasterFilter={disasterFilter}
            isLoadingDisaster={isLoadingDisaster}
            hasMissingNearestData={hasMissingNearestData}
            setDisasterFilter={setDisasterFilter}
            setSelectedAnalysis={selectAnalysisWithPulse}
            onOpenMap={() => setOpenMapSheet(false)}
            onRefreshLatest={handleRefreshLatestAnalysis}
            onAnalyzeCustomPoint={handleAnalyzeCustomPoint}
            onSelectCustomPoint={setSelectedCustomPoint}
            isRefreshingLatest={refreshStatus === 'pending'}
            onSelectStation={(stationId) => {
              setFocusedStationId(stationId);
              if (!stationId) return;
              const topAnalysis = stationTopAnalysisMap.get(stationId);
              if (topAnalysis) selectAnalysisWithPulse(topAnalysis);
            }}
            parseRiskLevelVN={parseRiskLevelVN}
            parseWeatherConditionVN={parseWeatherConditionVN}
            getEffectiveDisasterType={getEffectiveDisasterType}
            getDisasterTheme={getDisasterTheme}
            renderMode="mapOnly"
          />
        }
        selectedAnalysis={visibleSelectedAnalysis}
        filteredAnalyses={visibleFilteredAnalyses}
        isLoadingDisaster={isLoadingDisaster}
        onSelectAnalysis={selectAnalysisWithPulse}
        parseRiskLevelVN={parseRiskLevelVN}
        parseWeatherConditionVN={parseWeatherConditionVN}
        getEffectiveDisasterType={getEffectiveDisasterType}
        getDisasterTheme={getDisasterTheme}
      />
    </DashboardLayout>
  );
}
