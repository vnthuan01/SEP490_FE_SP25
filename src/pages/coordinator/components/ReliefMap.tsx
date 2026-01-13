import { useEffect, useCallback, useRef } from 'react';
import goongjs, { type Map as GoongMap, type Marker } from '@goongmaps/goong-js';
import { useGoongMap } from '@/hooks/useGoongMap';
import { Card, CardContent } from '@/components/ui/card';
import type { ReliefLocation, Team, Headquarters } from './types';
import {
  getUrgencyColor,
  getStatusColor,
  getDangerColor,
  formatDistance,
  formatDuration,
} from './utils';

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

        // Create popup with route information
        const needsList = [];
        if (location.needs.food)
          needsList.push(
            '<span class="material-symbols-outlined" style="font-size: 14px;">restaurant</span> Lương thực',
          );
        if (location.needs.water)
          needsList.push(
            '<span class="material-symbols-outlined" style="font-size: 14px;">water_drop</span> Nước',
          );
        if (location.needs.medicine)
          needsList.push(
            '<span class="material-symbols-outlined" style="font-size: 14px;">medication</span> Thuốc',
          );
        if (location.needs.emergencyRescue)
          needsList.push(
            '<span class="material-symbols-outlined" style="font-size: 14px;">emergency</span> Cứu hộ',
          );

        const assignedTeam = location.assignedTeamId
          ? teams.find((t) => t.id === location.assignedTeamId)
          : null;

        // Route information section
        let routeInfo = '';
        if (location.distanceFromHQ) {
          routeInfo = `
            <div style="margin: 12px 0; padding: 10px; background: #f0f9ff; border-left: 3px solid #0284c7; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #0c4a6e; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">route</span>
                Khoảng cách từ trụ sở
              </p>
              <div style="font-size: 11px; color: #075985; space-y: 4px;">
                <p style="margin: 4px 0; display: flex; align-items: center; gap: 6px;">
                  <span class="material-symbols-outlined" style="font-size: 14px;">straighten</span>
                  <strong>Đường thẳng:</strong> ${location.distanceFromHQ.straightLine.toFixed(1)} km
                </p>
                ${
                  location.distanceFromHQ.byMotorcycle
                    ? `
                  <p style="margin: 4px 0; display: flex; align-items: center; gap: 6px; padding: 4px; background: white; border-radius: 3px;">
                    <span class="material-symbols-outlined" style="font-size: 14px;">two_wheeler</span>
                    <strong>Xe máy:</strong> ${formatDistance(location.distanceFromHQ.byMotorcycle.distance)} • ${formatDuration(location.distanceFromHQ.byMotorcycle.duration)}
                  </p>
                `
                    : ''
                }
                ${
                  location.distanceFromHQ.byTruck
                    ? `
                  <p style="margin: 4px 0; display: flex; align-items: center; gap: 6px; padding: 4px; background: white; border-radius: 3px;">
                    <span class="material-symbols-outlined" style="font-size: 14px;">local_shipping</span>
                    <strong>Xe tải:</strong> ${formatDistance(location.distanceFromHQ.byTruck.distance)} • ${formatDuration(location.distanceFromHQ.byTruck.duration)}
                  </p>
                `
                    : ''
                }
                ${
                  location.distanceFromHQ.byHelicopter
                    ? `
                  <p style="margin: 4px 0; display: flex; align-items: center; gap: 6px; padding: 4px; background: white; border-radius: 3px;">
                    <span class="material-symbols-outlined" style="font-size: 14px;">flight</span>
                    <strong>Trực thăng:</strong> ${formatDistance(location.distanceFromHQ.byHelicopter.distance)} • ${formatDuration(location.distanceFromHQ.byHelicopter.duration)}
                  </p>
                `
                    : ''
                }
              </div>
            </div>
          `;
        }

        // AI Danger Score section
        let dangerScoreSection = '';
        if (location.dangerScore !== undefined && location.priorityScore !== undefined) {
          dangerScoreSection = `
            <div style="margin: 12px 0; padding: 10px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #92400e; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">psychology</span>
                Đánh giá AI
              </p>
              <div style="font-size: 11px; color: #78350f;">
                <div style="margin: 4px 0; display: flex; align-items: center; justify-content: space-between;">
                  <span><strong>Mức độ nguy hiểm:</strong></span>
                  <span style="padding: 2px 8px; background: ${getDangerColor(location.dangerScore)}; color: white; border-radius: 3px; font-weight: 600;">
                    ${location.dangerScore}%
                  </span>
                </div>
                <div style="margin: 4px 0; display: flex; align-items: center; justify-content: space-between;">
                  <span><strong>Độ ưu tiên:</strong></span>
                  <span style="padding: 2px 8px; background: ${getDangerColor(location.priorityScore)}; color: white; border-radius: 3px; font-weight: 600;">
                    ${location.priorityScore}%
                  </span>
                </div>
                ${
                  location.priorityScore >= 90
                    ? '<p style="margin: 6px 0 0 0; padding: 4px; background: #fee2e2; border-radius: 3px; color: #991b1b; font-weight: 600; text-align: center;">⚠️ CẦN ƯU TIÊN CAO</p>'
                    : ''
                }
              </div>
            </div>
          `;
        }

        const popupContent = `
          <div style="min-width: 340px; font-family: 'Public Sans', sans-serif; padding: 12px;">
            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #1f2937;">
              ${location.locationName}
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">${location.province}</p>
            <div style="margin-bottom: 8px;">
              <span style="display: inline-block; padding: 4px 8px; background: ${getUrgencyColor(location.urgency)}; color: white; border-radius: 4px; font-size: 11px; font-weight: 600;">
                    ${
                      location.urgency === 'high'
                        ? `<span style="display:flex;align-items:center;gap:6px">
         <span class="material-symbols-outlined" style="font-size:20px">error</span>
         <strong>KHẨN CẤP CAO</strong>
       </span>`
                        : location.urgency === 'medium'
                          ? `<span style="display:flex;align-items:center;gap:6px">
         <span class="material-symbols-outlined" style="font-size:20px">warning</span>
         <strong>TRUNG BÌNH</strong>
       </span>`
                          : `<span style="display:flex;align-items:center;gap:6px">
         <span class="material-symbols-outlined" style="font-size:20px">check_circle</span>
         <strong>THẤP</strong>
       </span>`
                    }

            </div>
            
            <div style="margin: 8px 0; padding: 8px; background: #f3f4f6; border-radius: 4px; font-size: 12px;">
              <p style="margin: 0 0 4px 0; color: #374151; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 14px;">group</span>
                <strong>Số người:</strong> ${location.peopleCount}
              </p>
              <p style="margin: 4px 0; color: #374151; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 14px;">location_on</span>
                <strong>Địa chỉ:</strong> ${location.address}
              </p>
              <p style="margin: 4px 0; color: #374151; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 14px;">phone</span>
                <strong>Liên hệ:</strong> ${location.contactPhone || 'N/A'}
              </p>
              <p style="margin: 4px 0; color: #374151; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 14px;">schedule</span>
                <strong>Cập nhật:</strong> ${location.lastUpdated}
              </p>
            </div>

            <div style="margin: 8px 0;">
              <strong style="font-size: 12px; color: #374151; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 14px;">inventory_2</span>
                Nhu cầu:
              </strong>
              <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px;">
                ${needsList
                  .map(
                    (need) =>
                      `<span style="padding: 2px 6px; background: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 10px; display: flex; align-items: center; gap: 2px;">${need}</span>`,
                  )
                  .join('')}
              </div>
            </div>

            ${location.description ? `<p style="margin: 8px 0; font-size: 12px; color: #4b5563; line-height: 1.4; font-style: italic;">${location.description}</p>` : ''}

            ${routeInfo}
            ${dangerScoreSection}

            <div style="margin-top: 8px;">
              <span style="display: inline-block; padding: 4px 8px; background: ${getStatusColor(location.status)}; color: white; border-radius: 4px; font-size: 11px; font-weight: 600;">
                ${
                  location.status === 'unassigned'
                    ? `<span style="display:flex;align-items:center;gap:6px">
         <span class="material-symbols-outlined">radio_button_unchecked</span>
         Chưa xử lý
       </span>`
                    : location.status === 'assigned'
                      ? `<span style="display:flex;align-items:center;gap:6px">
         <span class="material-symbols-outlined">group_add</span>
         Đã gán đội
       </span>`
                      : location.status === 'on-the-way'
                        ? `<span style="display:flex;align-items:center;gap:6px">
         <span class="material-symbols-outlined">directions_run</span>
         Đang đi
       </span>`
                        : location.status === 'completed'
                          ? `<span style="display:flex;align-items:center;gap:6px">
         <span class="material-symbols-outlined">check_circle</span>
         Hoàn thành
       </span>`
                          : `<span style="display:flex;align-items:center;gap:6px">
         <span class="material-symbols-outlined">cancel</span>
         Thất bại
       </span>`
                }

              </span>
            </div>

            ${
              assignedTeam
                ? `
              <div style="margin-top: 8px; padding: 8px; background: #fef3c7; border-radius: 4px;">
                <p style="margin: 0; font-size: 11px; color: #92400e;">
                  <strong>Đội được gán:</strong> ${assignedTeam.name}
                </p>
              </div>
            `
                : location.status === 'unassigned' && availableTeams.length > 0
                  ? `
              <div style="margin-top: 12px; padding: 8px; background: #e0f2fe; border-radius: 4px;">
                <label style="font-size: 11px; font-weight: 600; color: #0c4a6e; display: block; margin-bottom: 6px;">
                  Phân công đội cứu trợ:
                </label>
                <select id="team-select-${location.id}" style="width: 100%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; margin-bottom: 6px;">
                  <option value="">-- Chọn đội --</option>
                  ${availableTeams
                    .map(
                      (team) => `
                    <option value="${team.id}">
                      ${team.name} (${team.members} người)
                    </option>
                  `,
                    )
                    .join('')}
                </select>
                <button 
                  id="assign-btn-${location.id}"
                  style="width: 100%; padding: 6px 12px; background: #0284c7; color: white; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
                  onmouseover="this.style.background='#0369a1'"
                  onmouseout="this.style.background='#0284c7'"
                >
                  <span class="material-symbols-outlined" style="font-size: 16px;">check_circle</span>
                  Xác nhận phân công
                </button>
              </div>
            `
                  : ''
            }
          </div>
        `;

        const popup = new goongjs.Popup({
          offset: 25,
          maxWidth: '420px',
          closeButton: true,
        }).setHTML(popupContent);

        popup.on('open', () => {
          const assignBtn = document.getElementById(`assign-btn-${location.id}`);
          const teamSelect = document.getElementById(
            `team-select-${location.id}`,
          ) as HTMLSelectElement;

          if (assignBtn && teamSelect) {
            assignBtn.addEventListener('click', () => {
              const selectedTeamId = teamSelect.value;
              if (selectedTeamId) {
                onAssignTeam(location.id, selectedTeamId);
                popup.remove();
              }
            });
          }

          onLocationSelect(location);
        });

        marker.setPopup(popup);
        markersRef.current.set(location.id, marker);

        marker.getElement().addEventListener('click', () => {
          mapInstance.setCenter([location.coordinates.lng, location.coordinates.lat]);
          mapInstance.setZoom(12);
        });
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

  // Handle selectedLocationId changes - open popup when location is clicked from sidebar
  useEffect(() => {
    if (map && selectedLocationId) {
      const marker = markersRef.current.get(selectedLocationId);
      const location = locations.find((l) => l.id === selectedLocationId);

      if (marker && location) {
        // Center map on location
        map.setCenter([location.coordinates.lng, location.coordinates.lat]);
        map.setZoom(12);

        // Open popup
        marker.togglePopup();
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
