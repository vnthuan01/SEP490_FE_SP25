import { apiClient } from '@/lib/apiClients';

export interface AnalyzeDisasterRiskPayload {
  latitude: number;
  longitude: number;
  disasterType?: number;
  locationName?: string;
  additionalContext?: string;
  model?: string;
}

export interface AnalyzeDisasterRiskResponse {
  analysisLogId: string;
  latitude: number;
  longitude: number;
  locationName: string;
  analysisMode: string;
  requestedDisasterType?: string | null;
  primaryDisasterType: string;
  weather: {
    observedAt: string;
    condition: string;
    temperatureC: number;
    windKph: number;
    precipMm: number;
    visibilityKm: number;
    humidity: number;
    baseWeatherRiskScore: number;
    baseWeatherRiskLevel: string;
  };
  forecast?: {
    resolvedAddress?: string;
    timeZone?: string;
    requestedDays?: number;
    generatedAt?: string;
    queryCost?: number;
    totalPrecipMm?: number;
    maxDailyPrecipMm?: number;
    peakRainDate?: string;
    consecutiveRainyDaysPeak?: number;
    days?: Array<{
      date: string;
      tempMaxC?: number;
      tempMinC?: number;
      precipMm?: number;
      precipProbability?: number;
      precipCover?: number;
      humidity?: number;
      pressure?: number;
      windSpeedKph?: number;
      windGustKph?: number;
      visibilityKm?: number;
      severeRisk?: number;
      conditions?: string;
      description?: string;
      precipTypes?: string[];
    }>;
  };
  riskRanking: Array<{
    disasterType: string;
    riskScore: number;
    riskLevel: string;
    assessmentConfidence: string;
    triggerFactors: string[];
    topThreats: string[];
  }>;
  heuristic: {
    overallRiskScore: number;
    riskLevel: string;
    assessmentConfidence: string;
    dataLimitationNote?: string | null;
    triggerFactors: string[];
    potentialScenarios: string[];
    topThreats: string[];
  };
  ai: {
    succeeded: boolean;
    provider?: string | null;
    model?: string | null;
    promptVersion?: string | null;
    analyzedAt?: string | null;
    primaryRiskType?: string | null;
    requestedRiskType?: string | null;
    summary?: string | null;
    detailedAnalysis?: string | null;
    recommendations: string[];
    potentialScenarios: string[];
    detectedConcerns?: string[];
    errorMessage?: string | null;
    sections?: {
      danhGiaTongQuan?: string | null;
      hienTrangThoiTiet?: string | null;
      xuHuongNhieuNgay?: string | null;
      ngayTrongDiem?: string | null;
      yeuToRuiRo?: string | null;
      tacDongVanHanh?: string | null;
      khuyenNghiTheoDoi?: string | null;
      confidence?: string | null;
      riskLevel?: string | null;
    };
  };
}

type AnyRecord = Record<string, any>;

const toNumber = (value: any, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const asArray = (value: any): any[] => (Array.isArray(value) ? value : []);

export const isVietnamCoordinate = (latitude: number, longitude: number) => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  if (latitude === 0 && longitude === 0) return false;
  return latitude >= 7.5 && latitude <= 23.8 && longitude >= 102 && longitude <= 110;
};

const toDisplayText = (value: any): string | null => {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    const parts = value.map((item) => toDisplayText(item)).filter(Boolean) as string[];
    return parts.length ? parts.join(', ') : null;
  }
  if (typeof value === 'object') {
    if (typeof value.narrative === 'string') return value.narrative;
    if (typeof value.explanation === 'string') return value.explanation;
    if (typeof value.summary === 'string') return value.summary;
    if (typeof value.headline === 'string') return value.headline;
    if (typeof value.text === 'string') return value.text;
    if (typeof value.message === 'string') return value.message;
    return null;
  }
  return null;
};

const extractLlmText = (llmResponse: any) => {
  if (!llmResponse || typeof llmResponse !== 'object') return { summary: null, detail: null };
  const summary =
    toDisplayText(llmResponse.overall_risk_assessment) ||
    toDisplayText(llmResponse.current_conditions_interpretation) ||
    toDisplayText(llmResponse.forecast_reasoning) ||
    null;
  const detail =
    [
      toDisplayText(llmResponse.forecast_reasoning),
      toDisplayText(llmResponse.multi_day_trend_analysis),
      toDisplayText(llmResponse.key_date_assessment),
      toDisplayText(llmResponse.factors_increasing_risk),
      toDisplayText(llmResponse.factors_reducing_risk),
      toDisplayText(llmResponse.operational_implications),
      toDisplayText(llmResponse.recommended_monitoring_triggers),
      toDisplayText(llmResponse.confidence),
    ]
      .filter(Boolean)
      .join('\n\n') || null;
  return { summary, detail };
};

export const extractLlmSectionsVN = (llmResponse: any) => {
  if (!llmResponse || typeof llmResponse !== 'object') {
    return {
      danhGiaTongQuan: null,
      hienTrangThoiTiet: null,
      xuHuongNhieuNgay: null,
      ngayTrongDiem: null,
      yeuToRuiRo: null,
      tacDongVanHanh: null,
      khuyenNghiTheoDoi: null,
      confidence: null,
      riskLevel: null,
    };
  }

  const overallAssessment = llmResponse.overall_assessment;
  const currentConditions = llmResponse.current_conditions_analysis;
  const forecastTrend = llmResponse.forecast_trend_analysis;
  const criticalWindows = llmResponse.critical_windows;
  const riskDrivers = llmResponse.risk_drivers;
  const operationalImplications = llmResponse.operational_implications;
  const recommendedActions = llmResponse.recommended_actions;
  const confidenceBlock = llmResponse.confidence;

  return {
    danhGiaTongQuan:
      toDisplayText(overallAssessment?.summary) ||
      toDisplayText(llmResponse.overall_risk_assessment) ||
      toDisplayText(overallAssessment?.headline),
    hienTrangThoiTiet:
      toDisplayText(currentConditions?.narrative) ||
      toDisplayText(llmResponse.current_conditions_interpretation),
    xuHuongNhieuNgay:
      toDisplayText(forecastTrend?.narrative) ||
      toDisplayText(llmResponse.multi_day_trend_analysis) ||
      toDisplayText(llmResponse.forecast_reasoning),
    ngayTrongDiem:
      toDisplayText(criticalWindows?.narrative) || toDisplayText(llmResponse.key_date_assessment),
    yeuToRuiRo:
      toDisplayText(riskDrivers?.narrative) || toDisplayText(llmResponse.factors_increasing_risk),
    tacDongVanHanh:
      toDisplayText(operationalImplications?.narrative) ||
      toDisplayText(llmResponse.operational_implications),
    khuyenNghiTheoDoi:
      toDisplayText(recommendedActions?.narrative) ||
      toDisplayText(llmResponse.recommended_monitoring_triggers),
    confidence:
      toDisplayText(confidenceBlock?.explanation) || toDisplayText(llmResponse.confidence),
    riskLevel:
      toDisplayText(overallAssessment?.risk_level) || toDisplayText(confidenceBlock?.level),
  };
};

export const normalizeDisasterAnalysisResponse = (raw: AnyRecord): AnalyzeDisasterRiskResponse => {
  if (raw?.weather && raw?.heuristic) return raw as AnalyzeDisasterRiskResponse;

  const current = raw?.weatherSnapshot?.current || {};
  const forecast = raw?.weatherSnapshot?.forecast || {};
  const days = asArray(forecast?.Days || forecast?.days);
  const llmResponse = raw?.llmResponse || {};
  const llmText = extractLlmText(llmResponse);
  const llmSections = extractLlmSectionsVN(llmResponse);
  const peakRainDay = [...days].sort(
    (a: any, b: any) => toNumber(b?.PrecipMm) - toNumber(a?.PrecipMm),
  )[0];
  const normalizedLatitude = toNumber(raw?.matchedLatitude ?? raw?.requestedLatitude);
  const normalizedLongitude = toNumber(raw?.matchedLongitude ?? raw?.requestedLongitude);

  if (!isVietnamCoordinate(normalizedLatitude, normalizedLongitude)) {
    throw new Error('INVALID_DISASTER_ANALYSIS_COORDINATE');
  }

  return {
    analysisLogId: String(raw?.analysisLogId || ''),
    latitude: normalizedLatitude,
    longitude: normalizedLongitude,
    locationName: String(raw?.locationName || 'Khu vực dự báo'),
    analysisMode: String(raw?.heuristicRiskLevel || 'AI-First'),
    requestedDisasterType: raw?.disasterType || null,
    primaryDisasterType: String(raw?.disasterType || 'Other'),
    weather: {
      observedAt: String(current?.ObservedAt || new Date().toISOString()),
      condition: String(current?.Condition || ''),
      temperatureC: toNumber(current?.TemperatureC),
      windKph: toNumber(current?.WindKph),
      precipMm: toNumber(current?.PrecipMm),
      visibilityKm: toNumber(current?.VisibilityKm),
      humidity: toNumber(current?.Humidity),
      baseWeatherRiskScore: toNumber(current?.WeatherRiskScore),
      baseWeatherRiskLevel: String(current?.WeatherRiskLevel || 'Low'),
    },
    forecast: {
      resolvedAddress: forecast?.ResolvedAddress,
      timeZone: forecast?.TimeZone,
      requestedDays: toNumber(forecast?.RequestedDays),
      generatedAt: forecast?.GeneratedAt,
      queryCost: toNumber(forecast?.QueryCost),
      maxDailyPrecipMm: Math.max(...days.map((d: any) => toNumber(d?.PrecipMm)), 0),
      peakRainDate: peakRainDay?.Date || null,
      days: days.map((d: any) => ({
        date: d?.Date,
        tempMaxC: toNumber(d?.TempMaxC),
        tempMinC: toNumber(d?.TempMinC),
        precipMm: toNumber(d?.PrecipMm),
        precipProbability: toNumber(d?.PrecipProbability),
        precipCover: toNumber(d?.PrecipCover),
        humidity: toNumber(d?.Humidity),
        pressure: toNumber(d?.Pressure),
        windSpeedKph: toNumber(d?.WindSpeedKph),
        windGustKph: toNumber(d?.WindGustKph),
        visibilityKm: toNumber(d?.VisibilityKm),
        severeRisk: toNumber(d?.SevereRisk),
        conditions: d?.Conditions,
        description: d?.Description,
        precipTypes: asArray(d?.PrecipTypes),
      })),
    },
    riskRanking: [],
    heuristic: {
      overallRiskScore: toNumber(raw?.heuristicRiskScore),
      riskLevel: String(raw?.heuristicRiskLevel || 'Low'),
      assessmentConfidence: String(raw?.assessmentConfidence || 'ModelDependent'),
      dataLimitationNote: raw?.dataLimitationNote || null,
      triggerFactors: asArray(raw?.triggerFactors).map(String),
      potentialScenarios: asArray(raw?.potentialScenarios).map(String),
      topThreats: asArray(raw?.topThreats).map(String),
    },
    ai: {
      succeeded: !raw?.errorMessage,
      provider: raw?.llmProvider || null,
      model: raw?.llmModel || null,
      promptVersion: raw?.promptVersion || null,
      analyzedAt: raw?.createdAt || null,
      primaryRiskType: raw?.disasterType || null,
      requestedRiskType: raw?.disasterType || null,
      summary: llmText.summary,
      detailedAnalysis: llmText.detail,
      recommendations: [],
      potentialScenarios: asArray(raw?.potentialScenarios).map(String),
      detectedConcerns: [],
      errorMessage: raw?.errorMessage || null,
      sections: llmSections,
    },
  };
};

export const getRiskHeadlineVN = (analysis: AnalyzeDisasterRiskResponse) => {
  const maxDailyPrecip = Number(analysis.forecast?.maxDailyPrecipMm || 0);
  const severeMax = Math.max(
    ...(analysis.forecast?.days || []).map((day) => Number(day.severeRisk || 0)),
    0,
  );
  if (maxDailyPrecip >= 50) return 'Nguy cơ lũ cần theo dõi';
  if (maxDailyPrecip >= 20 || severeMax >= 60) return 'Nguy cơ ngập cục bộ';
  if (maxDailyPrecip >= 8 || severeMax >= 30) return 'Khả năng mưa lớn';
  return 'Theo dõi thời tiết';
};

export const disasterAnalysisService = {
  analyzeRisk: (data: AnalyzeDisasterRiskPayload) =>
    apiClient.post<AnalyzeDisasterRiskResponse>('/DisasterAnalysis/analyze', data),
  getNearest: (latitude: number, longitude: number) =>
    apiClient.get<any>('/DisasterAnalysis/nearest', { params: { latitude, longitude } }),
};
