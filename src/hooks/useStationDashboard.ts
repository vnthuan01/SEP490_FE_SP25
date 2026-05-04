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
  rescueTypeSummary: (stationKey?: string, from?: string, to?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'rescue-type-summary', stationKey, from, to] as const,
  rescueLocations: (stationKey?: string, from?: string, to?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'rescue-locations', stationKey, from, to] as const,
  teamPerformance: (stationKey?: string, from?: string, to?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'team-performance', stationKey, from, to] as const,
  reliefTeamMissions: (stationKey?: string, teamIds?: string[]) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'relief-team-missions', stationKey, teamIds] as const,
  reliefTeamTaskSummary: (stationKey?: string, teamIds?: string[]) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'relief-team-task-summary', stationKey, teamIds] as const,
  vehicleSummary: (stationKey?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'vehicle-summary', stationKey] as const,
  alerts: (stationKey?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'alerts', stationKey] as const,
  inventorySummary: (stationKey?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'inventory-summary', stationKey] as const,
  activeDispatch: (stationKey?: string) =>
    [...STATION_DASHBOARD_QUERY_KEYS.all, 'active-dispatch', stationKey] as const,
};

export interface StationDashboardRange {
  from?: string;
  to?: string;
  groupBy?: StationDashboardGroupBy;
  teamIds?: string[];
}

const normalizeTeamIds = (teamIds?: string[]) =>
  teamIds && teamIds.length > 0 ? Array.from(new Set(teamIds)).sort() : undefined;

export function useStationDashboard(range: StationDashboardRange, stationKey?: string) {
  const normalizedTeamIds = normalizeTeamIds(range.teamIds);

  const overviewQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.overview(stationKey),
    queryFn: () => stationDashboardService.getOverview(),
  });

  const rescueStatusQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.rescueStatus(stationKey, range.from, range.to),
    queryFn: () => stationDashboardService.getRescueRequestStatus(range.from, range.to),
  });

  const rescueTypeSummaryQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.rescueTypeSummary(stationKey, range.from, range.to),
    queryFn: () => stationDashboardService.getRescueRequestTypeSummary(range.from, range.to),
  });

  const rescueLocationsQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.rescueLocations(stationKey, range.from, range.to),
    queryFn: () => stationDashboardService.getRescueRequestLocations(range.from, range.to),
  });

  const teamPerformanceQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.teamPerformance(stationKey, range.from, range.to),
    queryFn: () => stationDashboardService.getTeamPerformance(range.from, range.to),
  });

  const reliefTeamMissionsQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.reliefTeamMissions(stationKey, normalizedTeamIds),
    queryFn: () =>
      stationDashboardService.getReliefTeamMissions(undefined, undefined, normalizedTeamIds),
  });

  const reliefTeamTaskSummaryQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.reliefTeamTaskSummary(stationKey, normalizedTeamIds),
    queryFn: () =>
      stationDashboardService.getReliefTeamTaskSummary(undefined, undefined, normalizedTeamIds),
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

  const activeDispatchQuery = useQuery({
    queryKey: STATION_DASHBOARD_QUERY_KEYS.activeDispatch(stationKey),
    queryFn: () => stationDashboardService.getActiveDispatch(),
  });

  const isLoading =
    overviewQuery.isLoading ||
    rescueStatusQuery.isLoading ||
    rescueTypeSummaryQuery.isLoading ||
    rescueLocationsQuery.isLoading ||
    teamPerformanceQuery.isLoading ||
    reliefTeamMissionsQuery.isLoading ||
    reliefTeamTaskSummaryQuery.isLoading ||
    vehicleSummaryQuery.isLoading ||
    alertsQuery.isLoading ||
    inventorySummaryQuery.isLoading ||
    activeDispatchQuery.isLoading;

  const isError =
    overviewQuery.isError ||
    rescueStatusQuery.isError ||
    rescueTypeSummaryQuery.isError ||
    rescueLocationsQuery.isError ||
    teamPerformanceQuery.isError ||
    reliefTeamMissionsQuery.isError ||
    reliefTeamTaskSummaryQuery.isError ||
    vehicleSummaryQuery.isError ||
    alertsQuery.isError ||
    inventorySummaryQuery.isError ||
    activeDispatchQuery.isError;

  const refetchAll = useMemo(
    () => async () => {
      await Promise.all([
        overviewQuery.refetch(),
        rescueStatusQuery.refetch(),
        rescueTypeSummaryQuery.refetch(),
        rescueLocationsQuery.refetch(),
        teamPerformanceQuery.refetch(),
        reliefTeamMissionsQuery.refetch(),
        reliefTeamTaskSummaryQuery.refetch(),
        vehicleSummaryQuery.refetch(),
        alertsQuery.refetch(),
        inventorySummaryQuery.refetch(),
        activeDispatchQuery.refetch(),
      ]);
    },
    [
      overviewQuery,
      rescueStatusQuery,
      rescueTypeSummaryQuery,
      rescueLocationsQuery,
      teamPerformanceQuery,
      reliefTeamMissionsQuery,
      reliefTeamTaskSummaryQuery,
      vehicleSummaryQuery,
      alertsQuery,
      inventorySummaryQuery,
      activeDispatchQuery,
    ],
  );

  return {
    overviewQuery,
    rescueStatusQuery,
    rescueTypeSummaryQuery,
    rescueLocationsQuery,
    teamPerformanceQuery,
    reliefTeamMissionsQuery,
    reliefTeamTaskSummaryQuery,
    vehicleSummaryQuery,
    alertsQuery,
    inventorySummaryQuery,
    activeDispatchQuery,
    isLoading,
    isError,
    refetchAll,
  };
}
