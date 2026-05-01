import { useEffect, useMemo, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoongMap } from '@/hooks/useGoongMap';
import type { RescueRequestLocationItem } from '@/services/stationDashboardService';

const DEFAULT_CENTER = { lat: 16.0544, lng: 108.2022 };

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

export function RescueRequestLocationsMapCard({
  items,
  isLoading,
}: {
  items: RescueRequestLocationItem[];
  isLoading?: boolean;
}) {
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

  const markerRefs = useRef<any[]>([]);
  const { map, mapRef, error } = useGoongMap({
    center: mapCenter,
    zoom: validItems.length > 1 ? 9 : 11,
    apiKey: import.meta.env.VITE_GOONG_MAP_KEY || '',
    enabled: true,
  });

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
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'bg-transparent border-0 p-0 cursor-pointer';
      el.innerHTML = `
        <span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;background:${color};border:2px solid #fff;border-radius:999px;box-shadow:0 10px 20px rgba(15,23,42,0.18);">
          <span class="material-symbols-outlined" style="font-size:16px;color:#fff;">location_on</span>
        </span>
      `;

      const popup = new goongjs.Popup({ offset: [0, -52], closeButton: false }).setHTML(
        `<div style="font-family:sans-serif;padding:2px 0;min-width:210px">
          <p style="font-weight:700;font-size:13px;margin:0 0 4px;color:${color}">${translateRescueRequestType(item.rescueRequestType)}</p>
          <p style="font-size:12px;color:#374151;margin:0 0 2px"><strong>Trạng thái:</strong> ${translateRescueRequestStatus(item.rescueRequestStatus)}</p>
          ${item.address ? `<p style="font-size:12px;color:#374151;margin:0 0 2px">${item.address}</p>` : ''}
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <span className="material-symbols-outlined text-cyan-600">map</span>
              Bản đồ điểm cứu hộ
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Hiển thị các vị trí cứu hộ đã phát sinh trong phạm vi trạm theo bộ lọc thời gian.
            </p>
          </div>
          <Badge variant="info" appearance="outline" size="sm">
            {validItems.length} điểm
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <p className="font-semibold text-foreground">Không tải được bản đồ</p>
            <p className="mt-2 text-sm text-muted-foreground">Kiểm tra Goong Map API key.</p>
          </div>
        ) : isLoading ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <p className="font-semibold text-foreground">Đang tải bản đồ...</p>
            <p className="mt-2 text-sm text-muted-foreground">Đang lấy các điểm cứu hộ từ API.</p>
          </div>
        ) : validItems.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
            <div ref={mapRef} className="h-[360px] w-full" />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <p className="font-semibold text-foreground">Chưa có điểm cứu hộ</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Bản đồ sẽ hiển thị khi API trả về các tọa độ hợp lệ.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
