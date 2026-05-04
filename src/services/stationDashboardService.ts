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

export interface RescueRequestTypeSummary {
  total: number;
  normal: number;
  emergency: number;
}

export interface RescueRequestLocationItem {
  requestId: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  rescueRequestType: string;
  rescueRequestStatus: string;
  createdAt: string;
  weatherCondition?: string | null;
  weatherTempC?: number | null;
  weatherWindKph?: number | null;
  weatherPrecipMm?: number | null;
  weatherVisibilityKm?: number | null;
  weatherHumidity?: number | null;
  weatherRiskScore?: number | null;
  weatherRiskLevel?: string | null;
  weatherObservedAt?: string | null;
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

export interface ReliefTeamMissionSnapshotItem {
  teamId: string;
  campaignTeamId: string;
  campaignId: string;
  teamName: string;
  teamType?: string | null;
  campaignName: string;
  campaignStatus: string;
  campaignTeamStatus: string;
  totalTasks: number;
  plannedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  totalSubTasks: number;
  assignedSubTasks: number;
  inProgressSubTasks: number;
  completedSubTasks: number;
  failedSubTasks: number;
  cancelledSubTasks: number;
  householdCount: number;
  pendingHouseholdCount: number;
  deliveredHouseholdCount: number;
  totalDeliveryCount: number;
  pendingDeliveryCount: number;
  deliveredDeliveryCount: number;
  defaultReliefPackageName?: string | null;
  lastTaskUpdatedAt?: string | null;
}

export interface ReliefTeamTaskSummaryTaskItem {
  campaignTaskId: string;
  title: string;
  status: string;
  startDate: string;
  dueDate?: string | null;
  totalSubTasks: number;
  assignedSubTasks: number;
  inProgressSubTasks: number;
  completedSubTasks: number;
  failedSubTasks: number;
  cancelledSubTasks: number;
  deliveryCount: number;
  pendingDeliveryCount: number;
  deliveredDeliveryCount: number;
  lastUpdatedAt?: string | null;
}

export interface ReliefTeamTaskSummaryItem {
  teamId: string;
  teamName: string;
  teamType?: string | null;
  campaignId: string;
  campaignName: string;
  campaignStatus: string;
  campaignTeamId: string;
  campaignTeamStatus: string;
  householdCount: number;
  pendingHouseholdCount: number;
  deliveredHouseholdCount: number;
  totalDeliveryCount: number;
  defaultReliefPackageName?: string | null;
  tasks: ReliefTeamTaskSummaryTaskItem[];
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
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
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

const normalizeStringListParam = (values?: string[]) =>
  values && values.length > 0 ? Array.from(new Set(values)).sort() : undefined;

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

  getRescueRequestTypeSummary: async (from?: string, to?: string) => {
    const response = await apiClient.get<RescueRequestTypeSummary>(
      '/station-dashboard/rescue-request-type-summary',
      { params: toQueryParams(from, to) },
    );
    return unwrapData<RescueRequestTypeSummary>(response);
  },

  getRescueRequestLocations: async (from?: string, to?: string) => {
    const response = await apiClient.get<{ items: RescueRequestLocationItem[] }>(
      '/station-dashboard/rescue-request-locations',
      { params: toQueryParams(from, to) },
    );
    const payload = unwrapData<
      { items?: RescueRequestLocationItem[] } | RescueRequestLocationItem[]
    >(response);
    return Array.isArray(payload) ? payload : (payload?.items ?? []);
  },

  getTeamPerformance: async (from?: string, to?: string) => {
    const response = await apiClient.get<{ data: TeamPerformanceItem[] }>(
      '/station-dashboard/team-performance',
      { params: toQueryParams(from, to) },
    );
    const payload = unwrapData<{ data?: TeamPerformanceItem[] } | TeamPerformanceItem[]>(response);
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },

  getReliefTeamMissions: async (from?: string, to?: string, teamIds?: string[]) => {
    const response = await apiClient.get<{ data: ReliefTeamMissionSnapshotItem[] }>(
      '/station-dashboard/relief-team-missions',
      {
        params: {
          ...toQueryParams(from, to),
          ...(normalizeStringListParam(teamIds)?.length
            ? { teamIds: normalizeStringListParam(teamIds) }
            : {}),
        },
      },
    );
    const payload = unwrapData<
      { data?: ReliefTeamMissionSnapshotItem[] } | ReliefTeamMissionSnapshotItem[]
    >(response);
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },

  getReliefTeamTaskSummary: async (from?: string, to?: string, teamIds?: string[]) => {
    const response = await apiClient.get<{ data: ReliefTeamTaskSummaryItem[] }>(
      '/station-dashboard/relief-team-task-summary',
      {
        params: {
          ...toQueryParams(from, to),
          ...(normalizeStringListParam(teamIds)?.length
            ? { teamIds: normalizeStringListParam(teamIds) }
            : {}),
        },
      },
    );
    const payload = unwrapData<
      { data?: ReliefTeamTaskSummaryItem[] } | ReliefTeamTaskSummaryItem[]
    >(response);
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
