import { useEffect, useMemo, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGoongMap } from '@/hooks/useGoongMap';
import {
  getRiskHeadlineVN,
  type AnalyzeDisasterRiskResponse,
} from '@/services/disasterAnalysisService';
import { DisasterType, ReliefStationLevel } from '@/enums/beEnums';

type Station = {
  id: string | null | undefined;
  name: string;
  latitude: number;
  longitude: number;
  coverageRadiusKm?: number | null;
  address?: string | null;
  contactNumber?: string | null;
  level?: number;
};

type Theme = { color: string; light: string; cardClass: string; icon: string };

const weatherIcon = (condition?: string | null) => {
  const normalized = String(condition || '').toLowerCase();
  if (normalized.includes('clear') || normalized.includes('sunny')) return 'wb_sunny';
  if (normalized.includes('cloud')) return 'partly_cloudy_day';
  if (normalized.includes('rain') || normalized.includes('drizzle')) return 'rainy';
  if (normalized.includes('storm') || normalized.includes('thunder')) return 'thunderstorm';
  return 'cloud';
};

const evaluateTemperatureVN = (tempC?: number | null) => {
  const t = Number(tempC);
  if (!Number.isFinite(t)) return { label: 'Chưa rõ', className: '#475569' };
  if (t >= 37) return { label: 'Rất nóng', className: '#b91c1c' };
  if (t >= 32) return { label: 'Nóng', className: '#ea580c' };
  if (t >= 27) return { label: 'Khá', className: '#d97706' };
  if (t >= 20) return { label: 'Mát', className: '#0284c7' };
  return { label: 'Lạnh', className: '#1d4ed8' };
};

const getForecastTemperatureRange = (analysis: AnalyzeDisasterRiskResponse) => {
  const days = analysis.forecast?.days || [];
  if (days.length > 0) {
    return {
      highestTemp: Math.max(...days.map((day) => Number(day.tempMaxC || 0))),
      lowestTemp: Math.min(...days.map((day) => Number(day.tempMinC || 0))),
    };
  }

  const currentTemp = Number(analysis.weather?.temperatureC || 0);
  return { highestTemp: currentTemp, lowestTemp: currentTemp };
};

const hasUsableWeatherData = (analysis: AnalyzeDisasterRiskResponse) => {
  const hasCurrentWeather =
    Number(analysis.weather?.temperatureC || 0) > 0 ||
    Number(analysis.weather?.humidity || 0) > 0 ||
    Number(analysis.weather?.windKph || 0) > 0 ||
    Number(analysis.weather?.precipMm || 0) > 0 ||
    String(analysis.weather?.condition || '').trim().length > 0;
  const hasForecastDays = (analysis.forecast?.days || []).length > 0;
  return hasCurrentWeather || hasForecastDays;
};

export function DisasterForecastMapPanel(props: {
  mapStations: Station[];
  analyses: AnalyzeDisasterRiskResponse[];
  filteredAnalyses: AnalyzeDisasterRiskResponse[];
  selectedAnalysis: AnalyzeDisasterRiskResponse | null;
  highlightedAnalysisId?: string | null;
  disasterFilter: string;
  isLoadingDisaster: boolean;
  hasMissingNearestData?: boolean;
  setDisasterFilter: (...args: [string]) => void;
  setSelectedAnalysis: (...args: [AnalyzeDisasterRiskResponse | null]) => void;
  onOpenMap: () => void;
  onRefreshLatest?: () => void;
  isRefreshingLatest?: boolean;
  onSelectStation: (...args: [string | null]) => void;
  parseRiskLevelVN: (...args: [string | null | undefined]) => { label: string; class: string };
  parseWeatherConditionVN: (...args: [string | null | undefined]) => string;
  getEffectiveDisasterType: (...args: [AnalyzeDisasterRiskResponse]) => string;
  getDisasterTheme: (...args: [string | null | undefined]) => Theme;
  renderMode?: 'panel' | 'mapOnly';
}) {
  const {
    mapStations,
    analyses,
    filteredAnalyses,
    selectedAnalysis,
    highlightedAnalysisId,
    disasterFilter,
    isLoadingDisaster,
    hasMissingNearestData = false,
    setDisasterFilter,
    setSelectedAnalysis,
    onOpenMap,
    onRefreshLatest,
    isRefreshingLatest = false,
    onSelectStation,
    parseRiskLevelVN,
    parseWeatherConditionVN,
    getEffectiveDisasterType,
    getDisasterTheme,
    renderMode = 'panel',
  } = props;

  const mapHeightClass = renderMode === 'mapOnly' ? 'h-full min-h-[68vh] lg:min-h-0' : 'h-[520px]';

  const mapRef = useRef<any>(null);
  const stationMarkersRef = useRef<any[]>([]);
  const riskMarkersRef = useRef<any[]>([]);
  const center = useMemo(
    () =>
      mapStations[0]
        ? { lat: mapStations[0].latitude, lng: mapStations[0].longitude }
        : { lat: 16.0544, lng: 108.2022 },
    [mapStations],
  );
  const { mapRef: domRef, map } = useGoongMap({
    center,
    zoom: mapStations[0] ? 9 : 6,
    apiKey: import.meta.env.VITE_GOONG_MAP_KEY || '',
    enabled: true,
    onMapLoad: (m) => (mapRef.current = m),
  });

  useEffect(() => {
    const mapImpl = map || mapRef.current;
    if (!mapImpl) return;
    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];
    mapStations.forEach((station) => {
      const markerColor =
        station.level === ReliefStationLevel.Regional
          ? '#7c3aed'
          : station.level === ReliefStationLevel.Provincial
            ? '#2563eb'
            : '#16a34a';
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'bg-transparent border-0 p-0 cursor-pointer';
      el.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#fff;border:2px solid ${markerColor};border-radius:10px;"><span class="material-symbols-outlined" style="font-size:18px;color:${markerColor};">home_work</span></span>`;
      el.addEventListener('click', () => {
        onSelectStation(station.id ?? null);
        (mapImpl as any).flyTo({
          center: [station.longitude, station.latitude],
          zoom: 11,
          speed: 1.1,
          essential: true,
        });
      });
      stationMarkersRef.current.push(
        new goongjs.Marker({ element: el })
          .setLngLat([station.longitude, station.latitude])
          .addTo(mapImpl),
      );
    });
  }, [map, mapStations, onSelectStation]);

  useEffect(() => {
    const mapImpl = map || mapRef.current;
    if (!mapImpl) return;
    riskMarkersRef.current.forEach((m) => m.remove());
    riskMarkersRef.current = [];
    if (isRefreshingLatest) return;
    filteredAnalyses.filter(hasUsableWeatherData).forEach((analysis) => {
      const theme = getDisasterTheme(getEffectiveDisasterType(analysis));
      const icon = weatherIcon(analysis.weather?.condition);
      const probability = Math.round(Number(analysis.heuristic?.overallRiskScore || 0));
      const currentTemp = Number(analysis.weather?.temperatureC);
      const safeCurrentTemp = Number.isFinite(currentTemp) ? currentTemp : null;
      const forecastDays = analysis.forecast?.days || [];
      const highestTemp =
        forecastDays.length > 0
          ? Math.max(...forecastDays.map((day) => Number(day.tempMaxC || 0)))
          : Number(analysis.weather?.temperatureC || 0);
      const lowestTemp =
        forecastDays.length > 0
          ? Math.min(...forecastDays.map((day) => Number(day.tempMinC || 0)))
          : Number(analysis.weather?.temperatureC || 0);
      const tempLevel = evaluateTemperatureVN(safeCurrentTemp);
      const riskHeadline = getRiskHeadlineVN(analysis);
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'bg-transparent border-0 p-0 cursor-pointer';
      const isSelected = analysis.analysisLogId === selectedAnalysis?.analysisLogId;
      const isHighlighted = analysis.analysisLogId === highlightedAnalysisId;
      el.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:${theme.color};border:2px solid #fff;border-radius:999px;box-shadow:0 0 0 ${isHighlighted ? 13 : isSelected ? 9 : 5}px ${theme.light};animation:${isHighlighted ? 'managerRiskPulseStrong 1.2s cubic-bezier(0.22,1,0.36,1) infinite' : isSelected ? 'managerRiskBreathing 1.8s ease-in-out infinite' : 'none'};will-change:transform;"><span class="material-symbols-outlined" style="font-size:16px;color:#fff;">${icon}</span></span><div style="display:flex;flex-direction:column;align-items:center;background:#fff;border:1px solid ${theme.color};border-radius:8px;padding:4px 6px;box-shadow:0 6px 16px rgba(15,23,42,0.16);min-width:116px;"><span style="font-size:12px;line-height:1.1;font-weight:800;color:${theme.color};">${probability}%</span><span style="font-size:10px;line-height:1.1;color:#334155;white-space:nowrap;">${riskHeadline}</span><span style="margin-top:2px;font-size:10px;line-height:1.1;color:#b45309;white-space:nowrap;display:flex;align-items:center;gap:2px;"><span class="material-symbols-outlined" style="font-size:12px;">arrow_upward</span>${highestTemp.toFixed(1)}°C</span><span style="font-size:10px;line-height:1.1;color:#1d4ed8;white-space:nowrap;display:flex;align-items:center;gap:2px;"><span class="material-symbols-outlined" style="font-size:12px;">arrow_downward</span>${lowestTemp.toFixed(1)}°C</span><span style="font-size:10px;line-height:1.1;font-weight:700;color:${tempLevel.className};white-space:nowrap;">${tempLevel.label}${safeCurrentTemp !== null ? ` (${safeCurrentTemp.toFixed(1)}°C)` : ''}</span></div></div>`;
      el.addEventListener('click', () => {
        setSelectedAnalysis(analysis);
        (mapImpl as any).flyTo({
          center: [analysis.longitude, analysis.latitude],
          zoom: 11,
          speed: 1.1,
          essential: true,
        });
      });
      riskMarkersRef.current.push(
        new goongjs.Marker({ element: el })
          .setLngLat([analysis.longitude, analysis.latitude])
          .addTo(mapImpl),
      );
    });
  }, [
    map,
    filteredAnalyses,
    getDisasterTheme,
    getEffectiveDisasterType,
    setSelectedAnalysis,
    selectedAnalysis,
    highlightedAnalysisId,
  ]);

  useEffect(() => {
    const mapImpl = map || mapRef.current;
    if (!mapImpl || !selectedAnalysis) return;
    (mapImpl as any).flyTo({
      center: [selectedAnalysis.longitude, selectedAnalysis.latitude],
      zoom: 11,
      speed: 1.1,
      essential: true,
    });
  }, [map, selectedAnalysis]);

  const mapBlock = (
    <div
      className={`${mapHeightClass} rounded-2xl border border-border overflow-hidden bg-muted/20 relative`}
    >
      <div ref={domRef} className="h-full w-full" />
      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2 max-w-[calc(100%-2rem)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur">
          <span className="inline-flex size-5 items-center justify-center rounded-md border-2 border-violet-600 text-violet-600">
            <span className="material-symbols-outlined text-[12px]">home_work</span>
          </span>
          Trạm cứu trợ
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur">
          <span className="inline-flex size-5 items-center justify-center rounded-md border-2 border-blue-600 bg-blue-50 text-blue-700">
            <span className="material-symbols-outlined text-[12px]">location_city</span>
          </span>
          Cấp tỉnh
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur">
          <span className="inline-flex size-5 items-center justify-center rounded-[4px] bg-red-500 text-white rotate-45">
            <span className="material-symbols-outlined -rotate-45 text-[12px]">warning</span>
          </span>
          Nguy cơ thiên tai
        </div>
      </div>
      <div className="absolute left-4 bottom-4 z-10 rounded-xl bg-background/95 border border-border p-3 text-xs space-y-2">
        <div className="font-semibold">Chú thích thời tiết</div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">wb_sunny</span> Trời đẹp
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">partly_cloudy_day</span> Có mây
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">rainy</span> Có mưa
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">thunderstorm</span> Dông bão
        </div>
      </div>
    </div>
  );

  if (renderMode === 'mapOnly') {
    return mapBlock;
  }

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-violet-600">map</span>
            <CardTitle>Bản đồ trạm &amp; Dự báo thiên tai AI</CardTitle>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={disasterFilter} onValueChange={setDisasterFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc loại thiên tai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thiên tai</SelectItem>
                <SelectItem value={String(DisasterType.Flood)}>Lũ lụt</SelectItem>
                <SelectItem value={String(DisasterType.Storm)}>Bão</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={onOpenMap}>
              Mở bản đồ lớn
            </Button>
            <Button
              variant="primary"
              className="gap-2"
              onClick={onRefreshLatest}
              disabled={!onRefreshLatest || isRefreshingLatest}
            >
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              {isRefreshingLatest ? 'Đang dự đoán...' : 'Dự đoán mới nhất'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mapBlock}
        {selectedAnalysis && hasUsableWeatherData(selectedAnalysis) && (
          <div
            className={`rounded-2xl border p-4 ${getDisasterTheme(getEffectiveDisasterType(selectedAnalysis)).cardClass}`}
          >
            {(() => {
              const currentTemp = Number(selectedAnalysis.weather?.temperatureC);
              const safeCurrentTemp = Number.isFinite(currentTemp) ? currentTemp : null;
              const tempLevel = evaluateTemperatureVN(safeCurrentTemp);
              const { highestTemp, lowestTemp } = getForecastTemperatureRange(selectedAnalysis);
              const riskHeadline = getRiskHeadlineVN(selectedAnalysis);
              const hasAiSummary = Boolean(
                selectedAnalysis.ai?.sections?.danhGiaTongQuan ||
                selectedAnalysis.ai?.summary?.trim(),
              );
              const hasAiDetail = Boolean(
                selectedAnalysis.ai?.sections?.hienTrangThoiTiet ||
                selectedAnalysis.ai?.sections?.xuHuongNhieuNgay ||
                selectedAnalysis.ai?.sections?.ngayTrongDiem ||
                selectedAnalysis.ai?.sections?.yeuToRuiRo ||
                selectedAnalysis.ai?.sections?.tacDongVanHanh ||
                selectedAnalysis.ai?.sections?.khuyenNghiTheoDoi ||
                selectedAnalysis.ai?.sections?.confidence ||
                selectedAnalysis.ai?.detailedAnalysis?.trim(),
              );

              return (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold">{selectedAnalysis.locationName}</div>
                      <div className="text-xs font-semibold mt-1">{riskHeadline}</div>
                    </div>
                    <Badge variant="outline" appearance="outline" size="xs">
                      {Math.round(Number(selectedAnalysis.heuristic?.overallRiskScore || 0))}%
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg border border-border/60 bg-background/60 px-2.5 py-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-amber-600">
                        arrow_upward
                      </span>
                      <span>Nhiệt độ cao nhất: {highestTemp.toFixed(1)}°C</span>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/60 px-2.5 py-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-blue-700">
                        arrow_downward
                      </span>
                      <span>Nhiệt độ thấp nhất: {lowestTemp.toFixed(1)}°C</span>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/60 px-2.5 py-2">
                      <span className="font-semibold" style={{ color: tempLevel.className }}>
                        Đánh giá nhiệt độ: {tempLevel.label}
                        {safeCurrentTemp !== null ? ` (${safeCurrentTemp.toFixed(1)}°C)` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    Thời tiết: {parseWeatherConditionVN(selectedAnalysis.weather?.condition)}
                  </div>
                  <div
                    className={`mt-1 text-sm font-semibold ${parseRiskLevelVN(selectedAnalysis.heuristic?.riskLevel).class}`}
                  >
                    {parseRiskLevelVN(selectedAnalysis.heuristic?.riskLevel).label}
                  </div>
                  <div className="mt-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2">
                    <p className="text-xs font-semibold mb-1">Nhận định tạm thời từ dữ liệu</p>
                    <ul className="space-y-1 text-sm list-disc pl-5">
                      <li>
                        Điểm rủi ro hiện tại:{' '}
                        {Number(selectedAnalysis.heuristic?.overallRiskScore ?? 0)}/100
                      </li>
                      <li>
                        Mưa cao nhất dự báo:{' '}
                        {selectedAnalysis.forecast?.maxDailyPrecipMm?.toFixed(1) ?? '0.0'} mm vào{' '}
                        {selectedAnalysis.forecast?.peakRainDate
                          ? new Date(selectedAnalysis.forecast.peakRainDate).toLocaleDateString(
                              'vi-VN',
                            )
                          : '--/--'}
                      </li>
                      <li>
                        Điều kiện hiện tại:{' '}
                        {parseWeatherConditionVN(selectedAnalysis.weather?.condition)},{' '}
                        {selectedAnalysis.weather?.temperatureC?.toFixed(1) ?? '0.0'}°C
                      </li>
                    </ul>
                  </div>
                  {hasAiSummary && (
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
                        <p className="text-xs font-semibold mb-1">Tóm tắt từ AI</p>
                        <div>
                          {selectedAnalysis.ai.sections?.danhGiaTongQuan ||
                            selectedAnalysis.ai.summary}
                        </div>
                      </div>
                      {selectedAnalysis.ai.sections?.khuyenNghiTheoDoi && (
                        <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs">
                          <span className="font-semibold">Khuyến nghị theo dõi: </span>
                          {selectedAnalysis.ai.sections.khuyenNghiTheoDoi}
                        </div>
                      )}
                    </div>
                  )}
                  {hasAiDetail && (
                    <div className="mt-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 space-y-2 text-xs leading-6">
                      <p className="text-xs font-semibold">Chi tiết AI</p>
                      {selectedAnalysis.ai.sections?.hienTrangThoiTiet && (
                        <div>
                          <span className="font-semibold">Hiện trạng thời tiết: </span>
                          {selectedAnalysis.ai.sections.hienTrangThoiTiet}
                        </div>
                      )}
                      {selectedAnalysis.ai.sections?.xuHuongNhieuNgay && (
                        <div>
                          <span className="font-semibold">Xu hướng nhiều ngày: </span>
                          {selectedAnalysis.ai.sections.xuHuongNhieuNgay}
                        </div>
                      )}
                      {selectedAnalysis.ai.sections?.ngayTrongDiem && (
                        <div>
                          <span className="font-semibold">Ngày trọng điểm: </span>
                          {selectedAnalysis.ai.sections.ngayTrongDiem}
                        </div>
                      )}
                      {selectedAnalysis.ai.sections?.yeuToRuiRo && (
                        <div>
                          <span className="font-semibold">Yếu tố rủi ro: </span>
                          {selectedAnalysis.ai.sections.yeuToRuiRo}
                        </div>
                      )}
                      {selectedAnalysis.ai.sections?.tacDongVanHanh && (
                        <div>
                          <span className="font-semibold">Tác động vận hành: </span>
                          {selectedAnalysis.ai.sections.tacDongVanHanh}
                        </div>
                      )}
                      {selectedAnalysis.ai.sections?.confidence && (
                        <div>
                          <span className="font-semibold">Độ tin cậy: </span>
                          {selectedAnalysis.ai.sections.confidence}
                        </div>
                      )}
                      {!selectedAnalysis.ai.sections?.hienTrangThoiTiet &&
                        !selectedAnalysis.ai.sections?.xuHuongNhieuNgay &&
                        !selectedAnalysis.ai.sections?.ngayTrongDiem &&
                        !selectedAnalysis.ai.sections?.yeuToRuiRo &&
                        !selectedAnalysis.ai.sections?.tacDongVanHanh &&
                        !selectedAnalysis.ai.sections?.confidence &&
                        selectedAnalysis.ai?.detailedAnalysis?.trim() && (
                          <div>{selectedAnalysis.ai.detailedAnalysis}</div>
                        )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
        {isLoadingDisaster && (
          <div className="text-xs text-muted-foreground">Đang phân tích dữ liệu AI...</div>
        )}
        {!isLoadingDisaster && hasMissingNearestData && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Chưa có dữ liệu dự báo đã lưu cho một số điểm. Hãy bấm <b>Dự đoán mới nhất</b> để cập
            nhật.
          </div>
        )}
        {analyses.filter(hasUsableWeatherData).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {analyses
              .filter(hasUsableWeatherData)
              .slice(0, 6)
              .map((analysis) => (
                <button
                  key={analysis.analysisLogId}
                  type="button"
                  className="rounded-full border px-3 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setSelectedAnalysis(analysis)}
                  disabled={isRefreshingLatest}
                >
                  {analysis.locationName}
                </button>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
