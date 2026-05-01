import { apiClient } from '@/lib/apiClients';

export type StationDashboardGroupBy = 'day' | 'week' | 'month';

export interface StationOverview {
  stationId: string;
  stationName: string;
  pendingRescueRequests: number;
  verifiedRescueRequests: number;
  assignedRescueRequests: number;
  inProgressRescueRequests: number;
  completedToday: number;
  activeTeams: number;
  availableVehicles: number;
  busyVehicles: number;
  unreadNotifications: number;
  lowStockItems: number;
  pendingShortageRequests: number;
}

export interface RescueRequestStatusSummary {
  total: number;
  pending: number;
  verified: number;
  assigned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface TeamPerformanceItem {
  teamId: string;
  teamName: string;
  teamType?: string | null;
  assignedRequests: number;
  activeBatch: boolean;
  inProgressRequests: number;
  completedRequests: number;
  lastTrackedAt?: string | null;
}

export interface VehicleSummaryByTypeItem {
  vehicleTypeName: string;
  total: number;
  available: number;
  busy: number;
}

export interface VehicleSummary {
  total: number;
  available: number;
  busy: number;
  byType: VehicleSummaryByTypeItem[];
}

export interface StationAlerts {
  unreadNotifications: number;
  pendingVolunteerApplications: number;
  pendingJoinRequests: number;
  pendingShortageRequests: number;
  criticalStockItems: number;
  vehiclesUnavailable: number;
}

export interface CriticalStockItem {
  supplyItemId: string;
  supplyItemName: string;
  currentQuantity: number;
  minimumStockLevel: number;
}

export interface InventorySummary {
  inventoryCount: number;
  totalStockItems: number;
  safeItems: number;
  needRestockItems: number;
  criticalItems: number;
  topCriticalItems: CriticalStockItem[];
}

export interface RescueRequestTrendItem {
  label: string;
  created: number;
  assigned: number;
  completed: number;
}

export interface RescueRequestTrend {
  groupBy: StationDashboardGroupBy;
  data: RescueRequestTrendItem[];
}

export interface ActiveDispatchVehicle {
  vehicleId: string;
  vehicleName?: string | null;
  vehicleLicensePlate?: string | null;
  isPrimary: boolean;
}

export interface ActiveDispatchItem {
  requestId: string;
  operationId: string;
  teamName: string;
  status: string;
  address?: string | null;
  lastTrackedAt?: string | null;
  vehicles: ActiveDispatchVehicle[];
}

export interface ActiveDispatchSnapshot {
  activeOperations: ActiveDispatchItem[];
}

const unwrapData = <T>(response: any): T => response?.data?.data ?? response?.data ?? response;

const toQueryParams = (from?: string, to?: string, groupBy?: StationDashboardGroupBy) => ({
  ...(from ? { from } : {}),
  ...(to ? { to } : {}),
  ...(groupBy ? { groupBy } : {}),
});

export const stationDashboardService = {
  getOverview: async () => {
    const response = await apiClient.get<StationOverview>('/station-dashboard/overview');
    return unwrapData<StationOverview>(response);
  },

  getRescueRequestStatus: async (from?: string, to?: string) => {
    const response = await apiClient.get<RescueRequestStatusSummary>(
      '/station-dashboard/rescue-request-status',
      { params: toQueryParams(from, to) },
    );
    return unwrapData<RescueRequestStatusSummary>(response);
  },

  getTeamPerformance: async (from?: string, to?: string) => {
    const response = await apiClient.get<{ data: TeamPerformanceItem[] }>(
      '/station-dashboard/team-performance',
      { params: toQueryParams(from, to) },
    );
    const payload = unwrapData<{ data?: TeamPerformanceItem[] } | TeamPerformanceItem[]>(response);
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },

  getVehicleSummary: async () => {
    const response = await apiClient.get<VehicleSummary>('/station-dashboard/vehicle-summary');
    return unwrapData<VehicleSummary>(response);
  },

  getAlerts: async () => {
    const response = await apiClient.get<StationAlerts>('/station-dashboard/alerts');
    return unwrapData<StationAlerts>(response);
  },

  getInventorySummary: async () => {
    const response = await apiClient.get<InventorySummary>('/station-dashboard/inventory-summary');
    return unwrapData<InventorySummary>(response);
  },

  getRescueRequestTrend: async (from?: string, to?: string, groupBy?: StationDashboardGroupBy) => {
    const response = await apiClient.get<RescueRequestTrend>(
      '/station-dashboard/rescue-request-trend',
      {
        params: toQueryParams(from, to, groupBy),
      },
    );
    return unwrapData<RescueRequestTrend>(response);
  },

  getActiveDispatch: async () => {
    const response = await apiClient.get<ActiveDispatchSnapshot>(
      '/station-dashboard/active-dispatch',
    );
    return unwrapData<ActiveDispatchSnapshot>(response);
  },
};
