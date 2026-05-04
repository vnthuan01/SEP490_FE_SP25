import { useEffect, useMemo, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoongMap } from '@/hooks/useGoongMap';
import type { RescueRequestLocationItem } from '@/services/stationDashboardService';

const DEFAULT_CENTER = { lat: 16.0544, lng: 108.2022 };

const weatherIcon = (condition?: string | null) => {
  const normalized = String(condition || '').toLowerCase();
  if (normalized.includes('clear') || normalized.includes('sunny')) return 'wb_sunny';
  if (normalized.includes('cloud')) return 'partly_cloudy_day';
  if (normalized.includes('rain') || normalized.includes('drizzle')) return 'rainy';
  if (normalized.includes('storm') || normalized.includes('thunder')) return 'thunderstorm';
  return 'cloud';
};

const weatherLabel = (condition?: string | null) => {
  const normalized = String(condition || '').toLowerCase();
  if (normalized.includes('clear') || normalized.includes('sunny')) return 'Trời đẹp';
  if (normalized.includes('cloud')) return 'Có mây';
  if (normalized.includes('rain') || normalized.includes('drizzle')) return 'Có mưa';
  if (normalized.includes('storm') || normalized.includes('thunder')) return 'Dông bão';
  return condition || 'Không rõ';
};

const translateRescueRequestType = (value?: string | null) => {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'normal') return 'Cứu hộ thường';
  if (normalized === 'emergency') return 'Cứu hộ khẩn cấp';
  return value || 'Chưa rõ';
};

const translateRescueRequestStatus = (value?: string | null) => {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('pending')) return 'Chờ xử lý';
  if (normalized.includes('verified')) return 'Đã xác minh';
  if (normalized.includes('assigned')) return 'Đã gán';
  if (normalized.includes('inprogress')) return 'Đang xử lý';
  if (normalized.includes('completed')) return 'Hoàn thành';
  if (normalized.includes('cancel')) return 'Đã hủy';
  return value || 'Không rõ';
};

const getMarkerColor = (item: RescueRequestLocationItem) => {
  const type = String(item.rescueRequestType || '').toLowerCase();
  const status = String(item.rescueRequestStatus || '').toLowerCase();

  if (status.includes('completed')) return '#16a34a';
  if (status.includes('cancel')) return '#6b7280';
  if (type === 'emergency') return '#dc2626';
  return '#2563eb';
};

const hasWeatherData = (item: RescueRequestLocationItem) =>
  item.weatherCondition != null ||
  item.weatherTempC != null ||
  item.weatherWindKph != null ||
  item.weatherPrecipMm != null ||
  item.weatherVisibilityKm != null ||
  item.weatherHumidity != null ||
  item.weatherRiskScore != null ||
  item.weatherRiskLevel != null;

const getWeatherAccent = (condition?: string | null) => {
  const normalized = String(condition || '').toLowerCase();
  if (normalized.includes('storm') || normalized.includes('thunder')) return '#7c3aed';
  if (normalized.includes('rain') || normalized.includes('drizzle')) return '#0ea5e9';
  if (normalized.includes('cloud')) return '#64748b';
  if (normalized.includes('clear') || normalized.includes('sunny')) return '#f59e0b';
  return '#22c55e';
};

export function RescueRequestLocationsMapCard({
  items,
  isLoading,
}: {
  items: RescueRequestLocationItem[];
  isLoading?: boolean;
}) {
  const mapApiKey = import.meta.env.VITE_GOONG_MAP_KEY || '';
  const validItems = useMemo(
    () =>
      items.filter(
        (item) =>
          Number.isFinite(Number(item.latitude)) &&
          Number.isFinite(Number(item.longitude)) &&
          !(Number(item.latitude) === 0 && Number(item.longitude) === 0),
      ),
    [items],
  );

  const mapCenter = useMemo(() => {
    if (!validItems.length) return DEFAULT_CENTER;
    return {
      lat: Number(validItems[0].latitude),
      lng: Number(validItems[0].longitude),
    };
  }, [validItems]);

  const weatherSummary = useMemo(() => {
    const weatherItems = validItems.filter(hasWeatherData);
    if (!weatherItems.length) return null;

    return [...weatherItems].sort((left, right) => {
      const leftScore = Number(left.weatherRiskScore ?? -1);
      const rightScore = Number(right.weatherRiskScore ?? -1);
      if (rightScore !== leftScore) return rightScore - leftScore;

      const leftObserved = new Date(left.weatherObservedAt || left.createdAt || 0).getTime();
      const rightObserved = new Date(right.weatherObservedAt || right.createdAt || 0).getTime();
      return rightObserved - leftObserved;
    })[0];
  }, [validItems]);

  const markerRefs = useRef<any[]>([]);
  const { map, mapRef, error } = useGoongMap({
    center: mapCenter,
    zoom: validItems.length > 1 ? 9 : 11,
    apiKey: mapApiKey,
    enabled: validItems.length > 0,
  });

  useEffect(() => {
    if (!validItems.length) {
      console.info('[RescueRequestLocationsMapCard] No valid rescue locations to render', {
        totalItems: items.length,
        validItems: validItems.length,
      });
    }
  }, [items.length, validItems.length]);

  useEffect(() => {
    if (error) {
      console.error('[RescueRequestLocationsMapCard] Map unavailable', {
        error,
        hasApiKey: Boolean(mapApiKey),
        totalItems: items.length,
        validItems: validItems.length,
        center: mapCenter,
      });
    }
  }, [error, items.length, mapApiKey, mapCenter, validItems.length]);

  const mapStatus = !validItems.length
    ? 'empty'
    : !mapApiKey
      ? 'missing-key'
      : error
        ? 'sdk-error'
        : 'ready';

  useEffect(() => {
    const mapInstance = map;
    if (!mapInstance) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    if (!validItems.length) return;

    const bounds = new goongjs.LngLatBounds();

    validItems.forEach((item) => {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);
      bounds.extend([lng, lat]);

      const color = getMarkerColor(item);
      const weatherAccent = getWeatherAccent(item.weatherCondition);
      const showWeatherBadge = hasWeatherData(item);
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'bg-transparent border-0 p-0 cursor-pointer';
      el.innerHTML = `
        <span style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;">
          <span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;background:${color};border:2px solid #fff;border-radius:999px;box-shadow:0 10px 20px rgba(15,23,42,0.18);">
            <span class="material-symbols-outlined" style="font-size:16px;color:#fff;">location_on</span>
          </span>
          ${
            showWeatherBadge
              ? `<span style="position:absolute;top:-5px;right:-5px;display:flex;align-items:center;justify-content:center;width:16px;height:16px;background:${weatherAccent};border:2px solid #fff;border-radius:999px;box-shadow:0 6px 14px rgba(15,23,42,0.16);">
                  <span class="material-symbols-outlined" style="font-size:10px;color:#fff;line-height:1;">${weatherIcon(item.weatherCondition)}</span>
                </span>`
              : ''
          }
        </span>
      `;

      const popup = new goongjs.Popup({ offset: [0, -52], closeButton: false }).setHTML(
        `<div style="font-family:sans-serif;padding:2px 0;min-width:210px">
          <p style="font-weight:700;font-size:13px;margin:0 0 4px;color:${color}">${translateRescueRequestType(item.rescueRequestType)}</p>
          <p style="font-size:12px;color:#374151;margin:0 0 2px"><strong>Trạng thái:</strong> ${translateRescueRequestStatus(item.rescueRequestStatus)}</p>
          ${item.address ? `<p style="font-size:12px;color:#374151;margin:0 0 2px">${item.address}</p>` : ''}
          ${
            hasWeatherData(item)
              ? `<div style="margin-top:8px;padding:8px;border-radius:10px;background:linear-gradient(135deg, rgba(37,99,235,0.08), rgba(20,184,166,0.08));border:1px solid rgba(148,163,184,0.4);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span class="material-symbols-outlined" style="font-size:18px;color:${color}">${weatherIcon(item.weatherCondition)}</span>
              <span style="font-size:12px;font-weight:700;color:#0f172a;">${weatherLabel(item.weatherCondition)}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;font-size:11px;color:#334155;">
              ${item.weatherTempC != null ? `<span>Nhiệt độ: <strong>${item.weatherTempC}°C</strong></span>` : ''}
              ${item.weatherWindKph != null ? `<span>Gió: <strong>${item.weatherWindKph} km/h</strong></span>` : ''}
              ${item.weatherHumidity != null ? `<span>Ẩm: <strong>${item.weatherHumidity}%</strong></span>` : ''}
              ${item.weatherVisibilityKm != null ? `<span>Tầm nhìn: <strong>${item.weatherVisibilityKm} km</strong></span>` : ''}
            </div>
          </div>`
              : ''
          }
          <p style="font-size:11px;color:#6b7280;margin:4px 0 0">${item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Chưa cập nhật'}</p>
        </div>`,
      );

      const marker = new goongjs.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapInstance);

      el.addEventListener('click', () => {
        (mapInstance as any).flyTo({
          center: [lng, lat],
          zoom: 13,
          speed: 1.2,
          essential: true,
        });
        marker.togglePopup();
      });

      markerRefs.current.push(marker);
    });

    if (validItems.length === 1) {
      const only = validItems[0];
      (mapInstance as any).flyTo({
        center: [Number(only.longitude), Number(only.latitude)],
        zoom: 13,
        speed: 1.2,
        essential: true,
      });
      return;
    }

    (mapInstance as any).fitBounds(bounds, {
      padding: 40,
      maxZoom: 13,
      duration: 700,
    });
  }, [map, validItems]);

  return (
    <Card className="border-border bg-card xl:col-span-2">
      <CardHeader className="pb-3">
        <div className="space-y-3 relative w-full">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-base font-bold py-2">
              <span className="material-symbols-outlined text-cyan-600">map</span>
              Bản đồ điểm cứu hộ
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Hiển thị các vị trí cứu hộ đã phát sinh trong phạm vi trạm theo bộ lọc thời gian.
            </p>
          </div>
          <div className="flex justify-end absolute right-0 top-4">
            <Badge variant="info" appearance="outline" size="sm">
              {validItems.length} điểm
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mapStatus === 'missing-key' ? (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 px-6 py-10 text-center">
            <p className="font-semibold text-amber-900">Thiếu cấu hình Goong Map</p>
            <p className="mt-2 text-sm text-amber-800">
              Chưa tìm thấy <code>VITE_GOONG_MAP_KEY</code> nên không thể hiển thị bản đồ.
            </p>
          </div>
        ) : mapStatus === 'sdk-error' ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <p className="font-semibold text-foreground">Không tải được bản đồ</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Đã log chi tiết lỗi Goong ra console để kiểm tra thêm.
            </p>
          </div>
        ) : isLoading ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <p className="font-semibold text-foreground">Đang tải bản đồ...</p>
            <p className="mt-2 text-sm text-muted-foreground">Đang lấy các điểm cứu hộ từ API.</p>
          </div>
        ) : mapStatus === 'ready' ? (
          <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/20">
            <div ref={mapRef} className="h-[360px] w-full" />
            {weatherSummary ? (
              <div className="absolute left-4 top-4 z-10 max-w-[240px] rounded-2xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">
                    <span className="material-symbols-outlined text-[22px]">
                      {weatherIcon(weatherSummary.weatherCondition)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Thời tiết khu vực
                    </p>
                    <p className="truncate text-sm font-bold text-foreground">
                      {weatherLabel(weatherSummary.weatherCondition)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {weatherSummary.weatherTempC != null
                        ? `${weatherSummary.weatherTempC}°C`
                        : 'N/A'}{' '}
                      - {weatherSummary.weatherRiskLevel || 'Không rõ nguy cơ'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div className="rounded-xl bg-muted/40 px-2 py-1.5">
                    Gió:{' '}
                    {weatherSummary.weatherWindKph != null
                      ? `${weatherSummary.weatherWindKph} km/h`
                      : '--'}
                  </div>
                  <div className="rounded-xl bg-muted/40 px-2 py-1.5">
                    Ẩm:{' '}
                    {weatherSummary.weatherHumidity != null
                      ? `${weatherSummary.weatherHumidity}%`
                      : '--'}
                  </div>
                  <div className="rounded-xl bg-muted/40 px-2 py-1.5">
                    Mưa:{' '}
                    {weatherSummary.weatherPrecipMm != null
                      ? `${weatherSummary.weatherPrecipMm} mm`
                      : '--'}
                  </div>
                  <div className="rounded-xl bg-muted/40 px-2 py-1.5">
                    Tầm nhìn:{' '}
                    {weatherSummary.weatherVisibilityKm != null
                      ? `${weatherSummary.weatherVisibilityKm} km`
                      : '--'}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <p className="font-semibold text-foreground">Chưa có điểm cứu hộ</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Không có tọa độ hợp lệ trong dữ liệu hiện tại nên chưa thể dựng bản đồ.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tổng bản ghi: {items.length} - Điểm hợp lệ: {validItems.length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
