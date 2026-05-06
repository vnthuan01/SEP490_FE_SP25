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

const firstDefined = (...values: any[]) =>
  values.find((value) => value !== undefined && value !== null);

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
  const source = raw?.data || raw?.result || raw?.analysis || raw;
  if (source?.weather && source?.heuristic) return source as AnalyzeDisasterRiskResponse;

  const current =
    source?.weatherSnapshot?.current ||
    source?.weatherSnapshot?.Current ||
    source?.currentWeather ||
    source?.weather ||
    source?.current ||
    {};
  const forecast =
    source?.weatherSnapshot?.forecast ||
    source?.weatherSnapshot?.Forecast ||
    source?.forecast ||
    {};
  const days = asArray(forecast?.Days || forecast?.days);
  const heuristicSource = source?.heuristic || source?.heuristicRisk || source?.risk || {};
  const llmResponse = source?.llmResponse || source?.ai?.llmResponse || source?.ai || {};
  const llmText = extractLlmText(llmResponse);
  const llmSections = extractLlmSectionsVN(llmResponse);
  const peakRainDay = [...days].sort(
    (a: any, b: any) => toNumber(b?.PrecipMm) - toNumber(a?.PrecipMm),
  )[0];
  const requestedLatitude = toNumber(source?.requestedLatitude ?? source?.latitude, NaN);
  const requestedLongitude = toNumber(source?.requestedLongitude ?? source?.longitude, NaN);
  const matchedLatitude = toNumber(source?.matchedLatitude ?? source?.latitude, NaN);
  const matchedLongitude = toNumber(source?.matchedLongitude ?? source?.longitude, NaN);
  const normalizedLatitude = isVietnamCoordinate(requestedLatitude, requestedLongitude)
    ? requestedLatitude
    : matchedLatitude;
  const normalizedLongitude = isVietnamCoordinate(requestedLatitude, requestedLongitude)
    ? requestedLongitude
    : matchedLongitude;

  if (!isVietnamCoordinate(normalizedLatitude, normalizedLongitude)) {
    throw new Error('INVALID_DISASTER_ANALYSIS_COORDINATE');
  }

  return {
    analysisLogId: String(
      source?.analysisLogId || source?.id || `${normalizedLatitude},${normalizedLongitude}`,
    ),
    latitude: normalizedLatitude,
    longitude: normalizedLongitude,
    locationName: String(source?.locationName || 'Khu vực dự báo'),
    analysisMode: String(source?.heuristicRiskLevel || 'AI-First'),
    requestedDisasterType: source?.disasterType || null,
    primaryDisasterType: String(source?.disasterType || 'Other'),
    weather: {
      observedAt: String(
        firstDefined(
          current?.ObservedAt,
          current?.observedAt,
          current?.datetime,
          new Date().toISOString(),
        ),
      ),
      condition: String(
        firstDefined(current?.Condition, current?.condition, current?.conditions, ''),
      ),
      temperatureC: toNumber(
        firstDefined(current?.TemperatureC, current?.temperatureC, current?.tempC, current?.temp),
      ),
      windKph: toNumber(
        firstDefined(current?.WindKph, current?.windKph, current?.windSpeedKph, current?.windspeed),
      ),
      precipMm: toNumber(
        firstDefined(
          current?.PrecipMm,
          current?.precipMm,
          current?.precip,
          current?.precipitationMm,
        ),
      ),
      visibilityKm: toNumber(
        firstDefined(current?.VisibilityKm, current?.visibilityKm, current?.visibility),
      ),
      humidity: toNumber(firstDefined(current?.Humidity, current?.humidity)),
      baseWeatherRiskScore: toNumber(
        firstDefined(
          current?.WeatherRiskScore,
          current?.weatherRiskScore,
          current?.baseWeatherRiskScore,
        ),
      ),
      baseWeatherRiskLevel: String(
        firstDefined(
          current?.WeatherRiskLevel,
          current?.weatherRiskLevel,
          current?.baseWeatherRiskLevel,
          'Low',
        ),
      ),
    },
    forecast: {
      resolvedAddress: firstDefined(forecast?.ResolvedAddress, forecast?.resolvedAddress),
      timeZone: firstDefined(forecast?.TimeZone, forecast?.timeZone),
      requestedDays: toNumber(firstDefined(forecast?.RequestedDays, forecast?.requestedDays)),
      generatedAt: firstDefined(forecast?.GeneratedAt, forecast?.generatedAt),
      queryCost: toNumber(firstDefined(forecast?.QueryCost, forecast?.queryCost)),
      maxDailyPrecipMm: Math.max(
        ...days.map((d: any) => toNumber(firstDefined(d?.PrecipMm, d?.precipMm, d?.precip))),
        0,
      ),
      peakRainDate:
        firstDefined(peakRainDay?.Date, peakRainDay?.date, forecast?.peakRainDate) || null,
      days: days.map((d: any) => ({
        date: firstDefined(d?.Date, d?.date, d?.datetime),
        tempMaxC: toNumber(firstDefined(d?.TempMaxC, d?.tempMaxC, d?.tempmax, d?.tempMax)),
        tempMinC: toNumber(firstDefined(d?.TempMinC, d?.tempMinC, d?.tempmin, d?.tempMin)),
        precipMm: toNumber(firstDefined(d?.PrecipMm, d?.precipMm, d?.precip)),
        precipProbability: toNumber(
          firstDefined(d?.PrecipProbability, d?.precipProbability, d?.precipprob),
        ),
        precipCover: toNumber(firstDefined(d?.PrecipCover, d?.precipCover, d?.precipcover)),
        humidity: toNumber(firstDefined(d?.Humidity, d?.humidity)),
        pressure: toNumber(firstDefined(d?.Pressure, d?.pressure)),
        windSpeedKph: toNumber(firstDefined(d?.WindSpeedKph, d?.windSpeedKph, d?.windspeed)),
        windGustKph: toNumber(firstDefined(d?.WindGustKph, d?.windGustKph, d?.windgust)),
        visibilityKm: toNumber(firstDefined(d?.VisibilityKm, d?.visibilityKm, d?.visibility)),
        severeRisk: toNumber(firstDefined(d?.SevereRisk, d?.severeRisk)),
        conditions: firstDefined(d?.Conditions, d?.conditions),
        description: firstDefined(d?.Description, d?.description),
        precipTypes: asArray(firstDefined(d?.PrecipTypes, d?.precipTypes, d?.preciptype)),
      })),
    },
    riskRanking: [],
    heuristic: {
      overallRiskScore: toNumber(
        firstDefined(
          source?.heuristicRiskScore,
          source?.overallRiskScore,
          heuristicSource?.overallRiskScore,
          heuristicSource?.riskScore,
        ),
      ),
      riskLevel: String(
        firstDefined(
          source?.heuristicRiskLevel,
          source?.riskLevel,
          heuristicSource?.riskLevel,
          'Low',
        ),
      ),
      assessmentConfidence: String(
        firstDefined(
          source?.assessmentConfidence,
          heuristicSource?.assessmentConfidence,
          'ModelDependent',
        ),
      ),
      dataLimitationNote:
        firstDefined(source?.dataLimitationNote, heuristicSource?.dataLimitationNote) || null,
      triggerFactors: asArray(
        firstDefined(source?.triggerFactors, heuristicSource?.triggerFactors),
      ).map(String),
      potentialScenarios: asArray(
        firstDefined(source?.potentialScenarios, heuristicSource?.potentialScenarios),
      ).map(String),
      topThreats: asArray(firstDefined(source?.topThreats, heuristicSource?.topThreats)).map(
        String,
      ),
    },
    ai: {
      succeeded: !source?.errorMessage,
      provider: source?.llmProvider || null,
      model: source?.llmModel || null,
      promptVersion: source?.promptVersion || null,
      analyzedAt: source?.createdAt || null,
      primaryRiskType: source?.disasterType || null,
      requestedRiskType: source?.disasterType || null,
      summary: llmText.summary,
      detailedAnalysis: llmText.detail,
      recommendations: [],
      potentialScenarios: asArray(source?.potentialScenarios).map(String),
      detectedConcerns: [],
      errorMessage: source?.errorMessage || null,
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
