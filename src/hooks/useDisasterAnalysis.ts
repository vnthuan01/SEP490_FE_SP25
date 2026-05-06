import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import {
  disasterAnalysisService,
  type AnalyzeDisasterRiskPayload,
  type AnalyzeDisasterRiskResponse,
  normalizeDisasterAnalysisResponse,
} from '@/services/disasterAnalysisService';

export const DISASTER_ANALYSIS_QUERY_KEYS = {
  all: ['disaster-analysis'] as const,
  analyze: (payload: AnalyzeDisasterRiskPayload) =>
    ['disaster-analysis', 'analyze', payload] as const,
};

export function useAnalyzeDisasterRisks(payloads: AnalyzeDisasterRiskPayload[]) {
  const queryClient = useQueryClient();
  const queries = useQueries({
    queries: payloads.map((payload) => ({
      queryKey: DISASTER_ANALYSIS_QUERY_KEYS.analyze(payload),
      queryFn: async () => {
        try {
          const response = await disasterAnalysisService.getNearest(
            payload.latitude,
            payload.longitude,
          );
          return normalizeDisasterAnalysisResponse(response.data);
        } catch (error: any) {
          if (error?.response?.status === 404) {
            return null as any;
          }
          if (error?.message === 'INVALID_DISASTER_ANALYSIS_COORDINATE') {
            return null as any;
          }
          throw error;
        }
      },
      enabled:
        Number.isFinite(payload.latitude) &&
        Number.isFinite(payload.longitude) &&
        !(payload.latitude === 0 && payload.longitude === 0),
      staleTime: 5 * 60 * 1000,
      retry: 0,
    })),
  });

  const refreshAnalysisMutation = useMutation({
    mutationFn: async (payload: AnalyzeDisasterRiskPayload) => {
      const response = await disasterAnalysisService.analyzeRisk(payload);
      try {
        return normalizeDisasterAnalysisResponse(response.data as any);
      } catch (error: any) {
        if (error?.message === 'INVALID_DISASTER_ANALYSIS_COORDINATE') {
          return null;
        }
        throw error;
      }
    },
    onSuccess: (normalized, payload) => {
      if (normalized) {
        queryClient.setQueryData(DISASTER_ANALYSIS_QUERY_KEYS.analyze(payload), normalized);
      }
    },
  });

  return {
    queries,
    analyses: queries.map((query) => query.data).filter(Boolean) as AnalyzeDisasterRiskResponse[],
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    hasMissingNearestData:
      payloads.length > 0 &&
      queries.some((query) => query.data == null) &&
      queries.every((query) => !query.isLoading),
    refreshAnalysis: refreshAnalysisMutation.mutateAsync,
    refreshStatus: refreshAnalysisMutation.status,
  };
}
