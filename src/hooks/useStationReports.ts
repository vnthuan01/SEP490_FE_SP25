import { useQuery } from '@tanstack/react-query';
import { stationReportService } from '@/services/stationReportService';

export const STATION_REPORT_QUERY_KEYS = {
  all: ['station-reports'] as const,
  rescueRequests: (params: Record<string, unknown>) =>
    [...STATION_REPORT_QUERY_KEYS.all, 'rescue-requests', params] as const,
  teamWorkload: (params: Record<string, unknown>) =>
    [...STATION_REPORT_QUERY_KEYS.all, 'team-workload', params] as const,
  vehicleUtilization: (params: Record<string, unknown>) =>
    [...STATION_REPORT_QUERY_KEYS.all, 'vehicle-utilization', params] as const,
  inventoryStock: (params: Record<string, unknown>) =>
    [...STATION_REPORT_QUERY_KEYS.all, 'inventory-stock', params] as const,
  reliefDeliveries: (params: Record<string, unknown>) =>
    [...STATION_REPORT_QUERY_KEYS.all, 'relief-deliveries', params] as const,
  reliefMissions: (params: Record<string, unknown>) =>
    [...STATION_REPORT_QUERY_KEYS.all, 'relief-missions', params] as const,
};

export function useRescueRequestsReport(
  params: {
    from?: string;
    to?: string;
    status?: string;
    pageIndex?: number;
    pageSize?: number;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: STATION_REPORT_QUERY_KEYS.rescueRequests(params),
    queryFn: () => stationReportService.getRescueRequests(params),
    enabled,
  });
}

export function useTeamWorkloadReport(params: { from?: string; to?: string } = {}, enabled = true) {
  return useQuery({
    queryKey: STATION_REPORT_QUERY_KEYS.teamWorkload(params),
    queryFn: () => stationReportService.getTeamWorkload(params),
    enabled,
  });
}

export function useVehicleUtilizationReport(
  params: { from?: string; to?: string; pageIndex?: number; pageSize?: number } = {},
  enabled = true,
) {
  return useQuery({
    queryKey: STATION_REPORT_QUERY_KEYS.vehicleUtilization(params),
    queryFn: () => stationReportService.getVehicleUtilization(params),
    enabled,
  });
}

export function useInventoryStockReport(
  params: {
    from?: string;
    to?: string;
    inventoryId?: string;
    status?: string;
    pageIndex?: number;
    pageSize?: number;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: STATION_REPORT_QUERY_KEYS.inventoryStock(params),
    queryFn: () => stationReportService.getInventoryStock(params),
    enabled,
  });
}

export function useReliefDeliveriesReport(
  params: {
    from?: string;
    to?: string;
    campaignId?: string;
    status?: string;
    pageIndex?: number;
    pageSize?: number;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: STATION_REPORT_QUERY_KEYS.reliefDeliveries(params),
    queryFn: () => stationReportService.getReliefDeliveries(params),
    enabled,
  });
}

export function useReliefMissionReport(
  params: {
    from?: string;
    to?: string;
    teamIds?: string[];
  },
  enabled = true,
) {
  return useQuery({
    queryKey: STATION_REPORT_QUERY_KEYS.reliefMissions(params),
    queryFn: () => stationReportService.getReliefMissions(params),
    enabled,
  });
}
