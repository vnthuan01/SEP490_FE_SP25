import { apiClient } from '@/lib/apiClients';

export interface Pagination<T> {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: T[];
}

export interface RescueRequestReportItem {
  requestId: string;
  address: string;
  rescueRequestType: string;
  status: string;
  teamName?: string | null;
  primaryVehicle?: string | null;
  createdAt: string;
}

export interface TeamWorkloadReportItem {
  teamId: string;
  teamName: string;
  assignedRequests: number;
  completedRequests: number;
  activeBatchCount: number;
  memberCount: number;
  pendingHouseholdCount: number;
  deliveredHouseholdCount: number;
  totalDeliveryCount: number;
  deliveredDeliveryCount: number;
}

export interface VehicleUtilizationReportItem {
  vehicleId: string;
  vehicleName: string;
  vehicleLicensePlate: string;
  busyCount: number;
  usedInOperations: number;
  isCurrentlyBusy: boolean;
}

export interface VehicleUtilizationReportResponse {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: VehicleUtilizationReportItem[];
}

export interface InventoryStockReportItem {
  inventoryStockId: string;
  supplyItemName: string;
  currentQuantity: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  inventoryStatus: string;
}

export interface ReliefDeliveryReportItem {
  householdCode: string;
  headOfHouseholdName: string;
  address: string;
  teamName?: string | null;
  deliveryMode: string;
  fulfillmentStatus: string;
  deliveryCount: number;
  latestScheduledAt?: string | null;
  latestDeliveredAt?: string | null;
  deliveredPackageNames: string[];
  pendingPackageNames: string[];
}

export interface ReliefMissionReportRowItem {
  campaignId: string;
  campaignName: string;
  campaignStatus: string;
  teamId: string;
  teamName: string;
  teamType: string;
  campaignTeamId: string;
  campaignTeamStatus: string;
  campaignTaskId: string;
  campaignTaskTitle: string;
  campaignTaskStatus: string;
  taskStartDate: string;
  taskDueDate?: string | null;
  totalSubTasks: number;
  assignedSubTasks: number;
  inProgressSubTasks: number;
  completedSubTasks: number;
  failedSubTasks: number;
  cancelledSubTasks: number;
  lastSubTaskUpdatedAt?: string | null;
}

export interface ReliefMissionCampaignSummaryItem {
  campaignId: string;
  campaignName: string;
  campaignStatus: string;
  teamCount: number;
  taskCount: number;
  blockedTaskCount: number;
  totalSubTaskCount: number;
  completedSubTaskCount: number;
  inProgressSubTaskCount: number;
  failedSubTaskCount: number;
  cancelledSubTaskCount: number;
  teamIds: Set<string>;
}

export interface ReportPagingParams {
  from?: string;
  to?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface RescueRequestReportParams extends ReportPagingParams {
  status?: string;
}

export interface InventoryStockReportParams extends ReportPagingParams {
  inventoryId?: string;
  status?: string;
}

export interface ReliefDeliveryReportParams extends ReportPagingParams {
  campaignId?: string;
  status?: string;
}

export interface ReliefMissionReportParams extends ReportPagingParams {
  teamIds?: string[];
}

const unwrapData = <T>(response: any): T => response?.data?.data ?? response?.data ?? response;

const toPageParams = (params: ReportPagingParams) => ({
  ...(params.from ? { from: params.from } : {}),
  ...(params.to ? { to: params.to } : {}),
  ...(params.pageIndex ? { pageIndex: params.pageIndex } : {}),
  ...(params.pageSize ? { pageSize: params.pageSize } : {}),
});

export const stationReportService = {
  getRescueRequests: async (params: RescueRequestReportParams) => {
    const response = await apiClient.get<Pagination<RescueRequestReportItem>>(
      '/station-reports/rescue-requests',
      {
        params: {
          ...toPageParams(params),
          ...(params.status ? { status: params.status } : {}),
        },
      },
    );
    return unwrapData<Pagination<RescueRequestReportItem>>(response);
  },

  getTeamWorkload: async (params: ReportPagingParams) => {
    const response = await apiClient.get<TeamWorkloadReportItem[]>(
      '/station-reports/team-workload',
      {
        params: toPageParams(params),
      },
    );
    return unwrapData<TeamWorkloadReportItem[]>(response);
  },

  getVehicleUtilization: async (params: ReportPagingParams) => {
    const response = await apiClient.get<VehicleUtilizationReportResponse>(
      '/station-reports/vehicle-utilization',
      { params: toPageParams(params) },
    );
    return unwrapData<VehicleUtilizationReportResponse>(response);
  },

  getInventoryStock: async (params: InventoryStockReportParams) => {
    const response = await apiClient.get<Pagination<InventoryStockReportItem>>(
      '/station-reports/inventory-stock',
      {
        params: {
          ...toPageParams(params),
          ...(params.inventoryId ? { inventoryId: params.inventoryId } : {}),
          ...(params.status ? { status: params.status } : {}),
        },
      },
    );
    return unwrapData<Pagination<InventoryStockReportItem>>(response);
  },

  getReliefDeliveries: async (params: ReliefDeliveryReportParams) => {
    const response = await apiClient.get<Pagination<ReliefDeliveryReportItem>>(
      '/station-reports/relief-deliveries',
      {
        params: {
          ...toPageParams(params),
          ...(params.campaignId ? { campaignId: params.campaignId } : {}),
          ...(params.status ? { status: params.status } : {}),
        },
      },
    );
    return unwrapData<Pagination<ReliefDeliveryReportItem>>(response);
  },

  getReliefMissions: async (params: ReliefMissionReportParams) => {
    const response = await apiClient.get<ReliefMissionReportRowItem[]>(
      '/station-reports/relief-missions',
      {
        params: {
          ...toPageParams(params),
          ...(params.teamIds?.length ? { teamIds: params.teamIds } : {}),
        },
      },
    );
    return unwrapData<ReliefMissionReportRowItem[]>(response);
  },
};
