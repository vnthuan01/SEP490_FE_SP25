import { useEffect, useCallback, useRef } from 'react';
import goongjs, { type Map as GoongMap, type Marker } from '@goongmaps/goong-js';
import { useGoongMap } from '@/hooks/useGoongMap';
import { Card, CardContent } from '@/components/ui/card';
import type { ReliefLocation, Team, Headquarters } from './types';
import { getUrgencyColor, getStatusColor } from './utils';

interface ReliefMapProps {
  locations: ReliefLocation[];
  teams: Team[];
  headquarters: Headquarters;
  availableTeams: Team[];
  onAssignTeam: (locationId: string, teamId: string) => void;
  onLocationSelect: (location: ReliefLocation) => void;
  selectedLocationId?: string;
  apiKey: string;
}

export function ReliefMap({
  locations,
  teams,
  headquarters,
  availableTeams,
  onAssignTeam,
  onLocationSelect,
  selectedLocationId,
  apiKey,
}: ReliefMapProps) {
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const headquartersMarkerRef = useRef<Marker | null>(null);

  const { map, mapRef, isLoading, error } = useGoongMap({
    center: headquarters.coordinates,
    zoom: 8,
    apiKey,
  });

  // Create relief location markers
  const createReliefMarkers = useCallback(
    (mapInstance: GoongMap) => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      locations.forEach((location) => {
        const color =
          location.status === 'unassigned'
            ? getUrgencyColor(location.urgency)
            : getStatusColor(location.status);

        const scale = location.urgency === 'high' ? 1.4 : location.urgency === 'medium' ? 1.2 : 1.0;

        const marker = new goongjs.Marker({ color, scale })
          .setLngLat([location.coordinates.lng, location.coordinates.lat])
          .addTo(mapInstance);

        markersRef.current.set(location.id, marker);

        // Handle click event
        marker.getElement().addEventListener('click', () => {
          // Center map
          (mapInstance as any).flyTo({
            center: [location.coordinates.lng, location.coordinates.lat],
            zoom: 14,
            speed: 1.2,
          });
          // Trigger selection
          onLocationSelect(location);
        });

        // Add cursor pointer
        marker.getElement().style.cursor = 'pointer';
      });
    },
    [locations, teams, availableTeams, onAssignTeam, onLocationSelect],
  );

  // Create headquarters marker
  const createHeadquartersMarker = useCallback(
    (mapInstance: GoongMap) => {
      if (headquartersMarkerRef.current) {
        headquartersMarkerRef.current.remove();
      }

      const hqMarker = new goongjs.Marker({
        color: '#8b5cf6',
        scale: 1.6,
      })
        .setLngLat([headquarters.coordinates.lng, headquarters.coordinates.lat])
        .addTo(mapInstance);

      const hqPopup = new goongjs.Popup({ offset: 25, maxWidth: '300px', closeButton: true })
        .setHTML(`
          <div style="min-width: 200px; font-family: 'Public Sans', sans-serif; padding: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #8b5cf6; display: flex; align-items: center; gap: 6px;">
              <span class="material-symbols-outlined">home_work</span>
              ${headquarters.name}
            </h3>
            <p style="margin: 0; font-size: 13px; color: #6b7280;">
              ${headquarters.address}
            </p>
            <div style="margin-top: 8px; padding: 8px; background: #f3e8ff; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px; color: #6b21a8; font-weight: 600;">
                Trụ sở điều phối chính
              </p>
            </div>
          </div>
        `);

      hqMarker.setPopup(hqPopup);
      headquartersMarkerRef.current = hqMarker;
    },
    [headquarters],
  );

  // Create all markers when map loads
  useEffect(() => {
    if (map) {
      createHeadquartersMarker(map);
      createReliefMarkers(map);

      if (locations.length > 0) {
        const bounds = new goongjs.LngLatBounds();
        bounds.extend([headquarters.coordinates.lng, headquarters.coordinates.lat]);
        locations.forEach((loc) => {
          bounds.extend([loc.coordinates.lng, loc.coordinates.lat]);
        });
        map.fitBounds(bounds, { padding: 80 });
      }
    }
  }, [map, createHeadquartersMarker, createReliefMarkers, locations, headquarters]);

  // Expose fitBounds method
  useEffect(() => {
    if (map) {
      (window as any).reliefMapFitBounds = () => {
        const bounds = new goongjs.LngLatBounds();
        bounds.extend([headquarters.coordinates.lng, headquarters.coordinates.lat]);
        locations.forEach((loc) => {
          bounds.extend([loc.coordinates.lng, loc.coordinates.lat]);
        });
        map.fitBounds(bounds, { padding: 80 });
      };
    }
  }, [map, locations, headquarters]);

  // Handle selectedLocationId changes - Center map only
  useEffect(() => {
    if (map && selectedLocationId) {
      const location = locations.find((l) => l.id === selectedLocationId);

      if (location) {
        // Center map on location
        (map as any).flyTo({
          center: [location.coordinates.lng, location.coordinates.lat],
          zoom: 14,
          speed: 1.2,
        });
      }
    }
  }, [map, selectedLocationId, locations]);

  return (
    <>
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Đang tải bản đồ...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <Card className="p-6">
            <CardContent className="text-center space-y-4">
              <span className="material-symbols-outlined text-5xl text-destructive">error</span>
              <h2 className="text-xl font-bold">Lỗi tải bản đồ</h2>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-xs space-y-2 z-10">
        <div className="font-bold mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">info</span>
          Chú thích
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Khẩn cấp cao</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Trung bình / Đã gán</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Thấp / Hoàn thành</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Đang đi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Trụ sở chính</span>
        </div>
      </div>
    </>
  );
}
