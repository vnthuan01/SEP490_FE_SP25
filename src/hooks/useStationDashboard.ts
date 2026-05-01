import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  stationDashboardService,
  type StationDashboardGroupBy,
} from '@/services/stationDashboardService';

export const STATION_DASHBOARD_QUERY_KEYS = {
  all: ['station-dashboard'] as const,
  overview: (stationKey?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'overview', stationKey] as const,
  rescueStatus: (stationKey?: string, from?: string, to?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'rescue-status', stationKey, from, to] as const,
  teamPerformance: (stationKey?: string, from?: string, to?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'team-performance', stationKey, from, to] as const,
  vehicleSummary: (stationKey?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'vehicle-summary', stationKey] as const,
  alerts: (stationKey?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'alerts', stationKey] as const,
  inventorySummary: (stationKey?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'inventory-summary', stationKey] as const,
  rescueTrend: (
    stationKey?: string,
    from?: string,
    to?: string,
    groupBy?: StationDashboardGroupBy,
  ) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'rescue-trend', stationKey, from, to, groupBy] as const,
  activeDispatch: (stationKey?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'active-dispatch', stationKey] as const,
};

export interface StationDashboardRange {
  from?: string;
  to?: string;
  groupBy?: StationDashboardGroupBy;
}

export function useStationDashboard(range: StationDashboardRange, stationKey?: string) {
  const overviewQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.overview(stationKey),
    queryFn: () => stationDashboardService.getOverview(),
  });

  const rescueStatusQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.rescueStatus(stationKey, range.from, range.to),
    queryFn: () => stationDashboardService.getRescueRequestStatus(range.from, range.to),
  });

  const teamPerformanceQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.teamPerformance(stationKey, range.from, range.to),
    queryFn: () => stationDashboardService.getTeamPerformance(range.from, range.to),
  });

  const vehicleSummaryQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.vehicleSummary(stationKey),
    queryFn: () => stationDashboardService.getVehicleSummary(),
  });

  const alertsQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.alerts(stationKey),
    queryFn: () => stationDashboardService.getAlerts(),
  });

  const inventorySummaryQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.inventorySummary(stationKey),
    queryFn: () => stationDashboardService.getInventorySummary(),
  });

  const rescueTrendQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.rescueTrend(
      stationKey,
      range.from,
      range.to,
      range.groupBy,
    ),
    queryFn: () =>
      stationDashboardService.getRescueRequestTrend(range.from, range.to, range.groupBy),
  });

  const activeDispatchQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.activeDispatch(stationKey),
    queryFn: () => stationDashboardService.getActiveDispatch(),
  });

  const isLoading =
    overviewQuery.isLoading ||
    rescueStatusQuery.isLoading ||
    teamPerformanceQuery.isLoading ||
    vehicleSummaryQuery.isLoading ||
    alertsQuery.isLoading ||
    inventorySummaryQuery.isLoading ||
    rescueTrendQuery.isLoading ||
    activeDispatchQuery.isLoading;

  const isError =
    overviewQuery.isError ||
    rescueStatusQuery.isError ||
    teamPerformanceQuery.isError ||
    vehicleSummaryQuery.isError ||
    alertsQuery.isError ||
    inventorySummaryQuery.isError ||
    rescueTrendQuery.isError ||
    activeDispatchQuery.isError;

  const refetchAll = useMemo(
    () => async () => {
      await Promise.all([
        overviewQuery.refetch(),
        rescueStatusQuery.refetch(),
        teamPerformanceQuery.refetch(),
        vehicleSummaryQuery.refetch(),
        alertsQuery.refetch(),
        inventorySummaryQuery.refetch(),
        rescueTrendQuery.refetch(),
        activeDispatchQuery.refetch(),
      ]);
    },
    [
      overviewQuery,
      rescueStatusQuery,
      teamPerformanceQuery,
      vehicleSummaryQuery,
      alertsQuery,
      inventorySummaryQuery,
      rescueTrendQuery,
      activeDispatchQuery,
    ],
  );

  return {
    overviewQuery,
    rescueStatusQuery,
    teamPerformanceQuery,
    vehicleSummaryQuery,
    alertsQuery,
    inventorySummaryQuery,
    rescueTrendQuery,
    activeDispatchQuery,
    isLoading,
    isError,
    refetchAll,
  };
}
