import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGoongMap } from '@/hooks/useGoongMap';
import { toast } from 'sonner';
import goongjs, { type Map as GoongMap, type Marker, type Popup } from '@goongmaps/goong-js';
import {
  getDirections,
  calculateDistance,
  formatDistance,
  formatDuration,
} from '@/services/goongService';

interface AllocationItem {
  id: string;
  name: string;
  role: string;
  location: string;
  coordinates: { lat: number; lng: number };
  time: string;
  status: 'new' | 'assigned' | 'pending';
  skills: string[];
  team?: string;
  priority: 'high' | 'normal';
  phone?: string;
  address?: string;
  description?: string;
  distance?: {
    car?: { distance: number; duration: number }; // meters, seconds
    bike?: { distance: number; duration: number };
    foot?: { distance: number; duration: number };
    straightLine?: number; // kilometers
  };
  isNearest?: boolean;
}

interface Team {
  id: string;
  name: string;
  type: 'y-te' | 'cuu-ho' | 'van-chuyen' | 'can-o';
  location: string;
  members: number;
  capacity: number;
}

const teams: Team[] = [
  {
    id: 'team-01',
    name: 'Đội Cứu Hộ 01',
    type: 'cuu-ho',
    location: 'Hà Nội',
    members: 5,
    capacity: 8,
  },
  { id: 'team-02', name: 'Đội Y Tế A', type: 'y-te', location: 'Yên Bái', members: 3, capacity: 6 },
  {
    id: 'team-03',
    name: 'Đội Vận Chuyển 05',
    type: 'van-chuyen',
    location: 'Hải Phòng',
    members: 4,
    capacity: 10,
  },
  {
    id: 'team-04',
    name: 'Đội Cano 03',
    type: 'can-o',
    location: 'Lào Cai',
    members: 2,
    capacity: 5,
  },
];

const candidates: AllocationItem[] = [
  {
    id: 'VOL-2024-8892',
    name: 'Nguyễn Văn A',
    role: 'Y tế, Sơ cứu',
    location: 'Hà Nội',
    coordinates: { lat: 21.0285, lng: 105.8542 },
    time: '15 phút trước',
    status: 'new',
    skills: ['Sơ cứu', 'Bơi lội', 'Lái xe bán tải'],
    priority: 'high',
    phone: '0912 345 678',
    address: '123 Phố Huế, Hai Bà Trưng, Hà Nội',
    description: 'Có kinh nghiệm 5 năm trong y tế cấp cứu, sẵn sàng hỗ trợ 24/7',
  },
  {
    id: 'VOL-2024-8893',
    name: 'Trần Thị Bích',
    role: 'Cứu hộ đường thủy',
    location: 'Yên Bái',
    coordinates: { lat: 21.7073, lng: 104.8749 },
    time: '32 phút trước',
    status: 'pending',
    skills: ['Lái cano', 'Cứu hộ nước'],
    priority: 'normal',
    phone: '0987 222 111',
    address: '456 Đường Nguyễn Thái Học, Yên Bái',
    description: 'Chứng chỉ cứu hộ đường thủy cấp quốc gia, có phương tiện cano riêng',
  },
  {
    id: 'VOL-2024-8894',
    name: 'Lê Văn Cường',
    role: 'Vận chuyển, Hậu cần',
    location: 'Hải Phòng',
    coordinates: { lat: 20.8449, lng: 106.6881 },
    time: '1 giờ trước',
    status: 'assigned',
    skills: ['Lái xe tải', 'Hậu cần'],
    team: 'Đội Vận Chuyển 05',
    priority: 'normal',
    phone: '0905 333 111',
    address: '789 Lê Thánh Tông, Hải Phòng',
    description: 'Có xe tải 2.5T, có thể vận chuyển hàng hóa cứu trợ',
  },
  {
    id: 'VOL-2024-8895',
    name: 'Hoàng Minh Tú',
    role: 'Sửa chữa điện, nước',
    location: 'Lào Cai',
    coordinates: { lat: 22.4862, lng: 103.9778 },
    time: '2 giờ trước',
    status: 'pending',
    skills: ['Điện dân dụng', 'Ống nước'],
    priority: 'normal',
    phone: '0977 888 999',
    address: '321 Đường Hoàng Liên, Lào Cai',
    description: 'Kỹ sư điện nước, có đầy đủ dụng cụ và kinh nghiệm 10 năm',
  },
  {
    id: 'VOL-2024-8896',
    name: 'Phạm Thị Lan',
    role: 'Y tế, Sơ cứu',
    location: 'Hà Nội',
    coordinates: { lat: 21.0378, lng: 105.8342 },
    time: '45 phút trước',
    status: 'new',
    skills: ['Điều dưỡng', 'Sơ cứu', 'Hỗ trợ tâm lý'],
    priority: 'normal',
    phone: '0944 555 666',
    address: '567 Đường Trần Phú, Ba Đình, Hà Nội',
    description: 'Y tá có 8 năm kinh nghiệm, chuyên về sơ cứu và chăm sóc người cao tuổi',
  },
  {
    id: 'VOL-2024-8897',
    name: 'Vũ Đức Minh',
    role: 'Cứu hộ đường thủy',
    location: 'Yên Bái',
    coordinates: { lat: 21.7273, lng: 104.9049 },
    time: '1 giờ 15 phút trước',
    status: 'pending',
    skills: ['Lái thuyền', 'Bơi lội', 'Cứu hộ nước'],
    priority: 'high',
    phone: '0933 444 777',
    address: '890 Khu vực Hồ Thác Bà, Yên Bái',
    description: 'Cứu hộ viên chuyên nghiệp, có chứng chỉ bơi lội quốc tế',
  },
];

// Trụ sở: Nhà Văn Hóa Sinh Viên Thủ Đức
const HEADQUARTERS = {
  name: 'Nhà Văn Hóa Sinh Viên Thủ Đức',
  coordinates: { lat: 10.8431, lng: 106.765 },
  address: 'Thủ Đức, TP. Hồ Chí Minh',
};

const GOONG_API_KEY = import.meta.env.VITE_GOONG_MAP_KEY || '';

export default function CoordinatorMemberAllocationPage() {
  const [selected, setSelected] = useState<AllocationItem | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<AllocationItem | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [loadingDistances, setLoadingDistances] = useState(false);
  const [candidatesWithDistance, setCandidatesWithDistance] = useState<AllocationItem[]>([]);
  const [distancesCalculated, setDistancesCalculated] = useState(false);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const popupsRef = useRef<Map<string, Popup>>(new Map());
  const headquartersMarkerRef = useRef<Marker | null>(null);
  const currentPopupRef = useRef<Popup | null>(null);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return candidatesWithDistance;
    return candidatesWithDistance.filter(
      (c) =>
        c.name.toLowerCase().includes(kw) ||
        c.role.toLowerCase().includes(kw) ||
        c.location.toLowerCase().includes(kw) ||
        (c.team ? c.team.toLowerCase().includes(kw) : false),
    );
  }, [search, candidatesWithDistance]);

  const defaultCenter = useMemo(() => {
    // Center on headquarters if we have candidates, otherwise default location
    if (candidates.length === 0) return HEADQUARTERS.coordinates;
    // Average between headquarters and candidates
    const sum = candidates.reduce(
      (acc, c) => ({ lat: acc.lat + c.coordinates.lat, lng: acc.lng + c.coordinates.lng }),
      { lat: HEADQUARTERS.coordinates.lat, lng: HEADQUARTERS.coordinates.lng },
    );
    return {
      lat: sum.lat / (candidates.length + 1),
      lng: sum.lng / (candidates.length + 1),
    };
  }, []);

  // Calculate distances from headquarters
  const calculateDistances = useCallback(async () => {
    if (!GOONG_API_KEY) {
      // If no API key, still calculate straight-line distances
      const updatedCandidates = candidates.map((candidate) => {
        const straightLine = calculateDistance(HEADQUARTERS.coordinates, candidate.coordinates);
        return {
          ...candidate,
          distance: { straightLine: Number(straightLine.toFixed(2)) },
        };
      });

      // Find nearest
      let nearestIndex = 0;
      let minDistance = updatedCandidates[0]?.distance?.straightLine || Infinity;
      updatedCandidates.forEach((c, index) => {
        if (c.distance?.straightLine && c.distance.straightLine < minDistance) {
          minDistance = c.distance.straightLine;
          nearestIndex = index;
        }
      });
      updatedCandidates[nearestIndex].isNearest = true;
      setCandidatesWithDistance(updatedCandidates);
      return;
    }

    if (distancesCalculated) return;

    setLoadingDistances(true);
    setDistancesCalculated(true); // Mark as calculating to prevent duplicate calls

    try {
      const updatedCandidates = await Promise.all(
        candidates.map(async (candidate, index) => {
          // Add delay to avoid rate limiting (stagger requests)
          if (index > 0) {
            await new Promise((resolve) => setTimeout(resolve, index * 150));
          }

          const straightLine = calculateDistance(HEADQUARTERS.coordinates, candidate.coordinates);

          // Calculate for different vehicles
          const [carResult, bikeResult, footResult] = await Promise.all([
            getDirections(HEADQUARTERS.coordinates, candidate.coordinates, 'car', GOONG_API_KEY),
            getDirections(HEADQUARTERS.coordinates, candidate.coordinates, 'bike', GOONG_API_KEY),
            getDirections(HEADQUARTERS.coordinates, candidate.coordinates, 'foot', GOONG_API_KEY),
          ]);

          const distance: AllocationItem['distance'] = {
            straightLine: Number(straightLine.toFixed(2)),
          };

          if (carResult?.routes?.[0]?.legs?.[0]) {
            const leg = carResult.routes[0].legs[0];
            distance.car = {
              distance: leg.distance.value,
              duration: leg.duration.value,
            };
          }

          if (bikeResult?.routes?.[0]?.legs?.[0]) {
            const leg = bikeResult.routes[0].legs[0];
            distance.bike = {
              distance: leg.distance.value,
              duration: leg.duration.value,
            };
          }

          if (footResult?.routes?.[0]?.legs?.[0]) {
            const leg = footResult.routes[0].legs[0];
            distance.foot = {
              distance: leg.distance.value,
              duration: leg.duration.value,
            };
          }

          return { ...candidate, distance };
        }),
      );

      // Find nearest candidate (by straight line distance)
      let nearestIndex = 0;
      let minDistance = updatedCandidates[0]?.distance?.straightLine || Infinity;
      updatedCandidates.forEach((c, index) => {
        if (c.distance?.straightLine && c.distance.straightLine < minDistance) {
          minDistance = c.distance.straightLine;
          nearestIndex = index;
        }
      });

      // Mark nearest candidate
      updatedCandidates[nearestIndex].isNearest = true;

      setCandidatesWithDistance(updatedCandidates);
      setLoadingDistances(false);
    } catch (error) {
      console.error('Error calculating distances:', error);
      toast.error('Không thể tính khoảng cách. Chỉ hiển thị khoảng cách đường thẳng.');
      // Fallback to straight-line only
      const updatedCandidates = candidates.map((candidate) => {
        const straightLine = calculateDistance(HEADQUARTERS.coordinates, candidate.coordinates);
        return {
          ...candidate,
          distance: { straightLine: Number(straightLine.toFixed(2)) },
        };
      });

      // Find nearest for fallback
      let nearestIndex = 0;
      let minDistance = updatedCandidates[0]?.distance?.straightLine || Infinity;
      updatedCandidates.forEach((c, index) => {
        if (c.distance?.straightLine && c.distance.straightLine < minDistance) {
          minDistance = c.distance.straightLine;
          nearestIndex = index;
        }
      });
      updatedCandidates[nearestIndex].isNearest = true;

      setCandidatesWithDistance(updatedCandidates);
      setLoadingDistances(false);
    }
  }, []);

  useEffect(() => {
    // Calculate distances on mount
    if (!distancesCalculated && GOONG_API_KEY) {
      calculateDistances();
    } else if (!distancesCalculated && !GOONG_API_KEY) {
      // If no API key, just calculate straight-line distances
      const updatedCandidates = candidates.map((candidate) => {
        const straightLine = calculateDistance(HEADQUARTERS.coordinates, candidate.coordinates);
        return {
          ...candidate,
          distance: { straightLine: Number(straightLine.toFixed(2)) },
        };
      });

      let nearestIndex = 0;
      let minDistance = updatedCandidates[0]?.distance?.straightLine || Infinity;
      updatedCandidates.forEach((c, index) => {
        if (c.distance?.straightLine && c.distance.straightLine < minDistance) {
          minDistance = c.distance.straightLine;
          nearestIndex = index;
        }
      });
      updatedCandidates[nearestIndex].isNearest = true;

      setCandidatesWithDistance(updatedCandidates);
      setDistancesCalculated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const createMarkers = useCallback(
    (mapInstance: GoongMap) => {
      // Clear existing markers
      markersRef.current.forEach((marker) => {
        marker.remove();
      });
      markersRef.current.clear();
      popupsRef.current.clear();

      // Remove headquarters marker if exists
      if (headquartersMarkerRef.current) {
        headquartersMarkerRef.current.remove();
        headquartersMarkerRef.current = null;
      }

      // Create headquarters marker with special style
      const hqMarker = new goongjs.Marker({
        color: '#ef4444',
        scale: 1.5,
      })
        .setLngLat([HEADQUARTERS.coordinates.lng, HEADQUARTERS.coordinates.lat])
        .addTo(mapInstance);

      const hqPopup = new goongjs.Popup({ offset: 25, maxWidth: '300px', closeButton: true })
        .setHTML(`
          <div style="min-width: 200px; font-family: 'Public Sans', sans-serif; padding: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #dc2626;">
              🏢 ${HEADQUARTERS.name}
            </h3>
            <p style="margin: 0; font-size: 13px; color: #6b7280;">
              ${HEADQUARTERS.address}
            </p>
            <div style="margin-top: 8px; padding: 8px; background: #fee2e2; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px; color: #991b1b; font-weight: 600;">
                Trụ sở chính
              </p>
            </div>
          </div>
        `);

      hqMarker.setPopup(hqPopup);
      headquartersMarkerRef.current = hqMarker;

      // Create markers for candidates (use candidatesWithDistance if available, otherwise candidates)
      const candidatesToDisplay =
        candidatesWithDistance.length > 0 ? candidatesWithDistance : candidates;
      candidatesToDisplay.forEach((candidate) => {
        // Highlight nearest marker with different color
        const isNearest = candidate.isNearest;
        const markerColor = isNearest
          ? '#8b5cf6' // Purple for nearest
          : candidate.status === 'new'
            ? '#3b82f6'
            : candidate.status === 'assigned'
              ? '#10b981'
              : '#f59e0b';

        // Create marker - Goong Maps uses [lng, lat] format
        const marker = new goongjs.Marker({
          color: markerColor,
          scale: isNearest ? 1.5 : 1.2, // Larger scale for nearest
        })
          .setLngLat([candidate.coordinates.lng, candidate.coordinates.lat])
          .addTo(mapInstance);

        // Create Popup content with distance info
        const getDistanceInfo = (vehicle: 'car' | 'bike' | 'foot') => {
          const dist = candidate.distance?.[vehicle];
          if (!dist) return '';
          return `<div style="margin: 4px 0; padding: 6px 8px; background: ${
            vehicle === 'car' ? '#dbeafe' : vehicle === 'bike' ? '#fef3c7' : '#fce7f3'
          }; border-radius: 4px; font-size: 11px;">
            <strong>${vehicle === 'car' ? '🚗' : vehicle === 'bike' ? '🚴' : '🚶'} ${vehicle === 'car' ? 'Ô tô' : vehicle === 'bike' ? 'Xe máy' : 'Đi bộ'}:</strong>
            <span style="color: #374151;"> ${formatDistance(dist.distance)} • ${formatDuration(dist.duration)}</span>
          </div>`;
        };

        const popupContent = `
          <div style="min-width: 280px; max-width: 380px; font-family: 'Public Sans', sans-serif;">
            <div style="padding: 12px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #1f2937;">
                ${candidate.name}
                ${isNearest ? '<span style="margin-left: 6px; padding: 2px 6px; background: #8b5cf6; color: white; border-radius: 4px; font-size: 10px; font-weight: 600;">📍 GẦN NHẤT</span>' : ''}
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                ${candidate.role}
              </p>
              <div style="margin: 8px 0; padding: 8px; background: #f3f4f6; border-radius: 4px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #374151;">
                  <strong>📍 Địa chỉ:</strong> ${candidate.address || candidate.location}
                </p>
                <p style="margin: 4px 0; font-size: 12px; color: #374151;">
                  <strong>📞 Liên hệ:</strong> ${candidate.phone || 'Chưa cập nhật'}
                </p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #374151;">
                  <strong>⏰ Thời gian:</strong> ${candidate.time}
                </p>
              </div>
              
              ${
                candidate.distance?.straightLine
                  ? `
                <div style="margin: 12px 0; padding: 10px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #92400e;">
                    📏 Khoảng cách từ trụ sở
                  </p>
                  <p style="margin: 0 0 6px 0; font-size: 11px; color: #78350f;">
                    <strong>Đường thẳng:</strong> ${candidate.distance.straightLine} km
                  </p>
                  ${getDistanceInfo('car')}
                  ${getDistanceInfo('bike')}
                  ${getDistanceInfo('foot')}
                </div>
              `
                  : ''
              }
              
              ${
                candidate.description
                  ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #4b5563; line-height: 1.5;">${candidate.description}</p>`
                  : ''
              }
              <div style="margin-top: 12px; display: flex; gap: 4px; flex-wrap: wrap;">
                ${candidate.skills
                  .map(
                    (skill) =>
                      `<span style="display: inline-block; padding: 4px 8px; background: #3b82f6; color: white; border-radius: 4px; font-size: 11px;">${skill}</span>`,
                  )
                  .join('')}
              </div>
              <div style="margin-top: 12px;">
                <span style="display: inline-block; padding: 4px 8px; background: ${
                  candidate.status === 'new'
                    ? '#3b82f6'
                    : candidate.status === 'assigned'
                      ? '#10b981'
                      : '#f59e0b'
                }; color: white; border-radius: 4px; font-size: 11px; font-weight: 600;">
                  ${
                    candidate.status === 'new'
                      ? 'Mới'
                      : candidate.status === 'assigned'
                        ? 'Đã ghép đội'
                        : 'Chờ phân bổ'
                  }
                </span>
                ${
                  candidate.priority === 'high'
                    ? '<span style="display: inline-block; margin-left: 4px; padding: 4px 8px; background: #ef4444; color: white; border-radius: 4px; font-size: 11px; font-weight: 600;">Ưu tiên cao</span>'
                    : ''
                }
              </div>
            </div>
          </div>
        `;

        const popup = new goongjs.Popup({
          offset: 25,
          maxWidth: '350px',
          closeButton: true,
        }).setHTML(popupContent);

        marker.setPopup(popup);
        markersRef.current.set(candidate.id, marker);
        popupsRef.current.set(candidate.id, popup);

        // Add click listener
        marker.getElement().addEventListener('click', () => {
          // Close previous popup
          if (currentPopupRef.current && currentPopupRef.current.isOpen()) {
            currentPopupRef.current.remove();
          }

          // Toggle popup for selected marker
          marker.togglePopup();
          currentPopupRef.current = popup;

          // Update selected location
          setSelectedLocation(candidate);
          setSelected(candidate);

          // Center map on marker
          mapInstance.setCenter([candidate.coordinates.lng, candidate.coordinates.lat]);
          mapInstance.setZoom(15);
        });

        // Listen for popup open/close events
        popup.on('open', () => {
          currentPopupRef.current = popup;
          setSelectedLocation(candidate);
          setSelected(candidate);
        });
      });

      // Fit bounds to show all markers including headquarters
      const candidatesToFit =
        candidatesWithDistance.length > 0 ? candidatesWithDistance : candidates;
      if (candidatesToFit.length > 0) {
        const bounds = new goongjs.LngLatBounds();
        bounds.extend([HEADQUARTERS.coordinates.lng, HEADQUARTERS.coordinates.lat]);
        candidatesToFit.forEach((candidate) => {
          bounds.extend([candidate.coordinates.lng, candidate.coordinates.lat]);
        });
        mapInstance.fitBounds(bounds, { padding: 50 });
      }
    },
    [candidatesWithDistance, candidates],
  );

  const { map, mapRef, isLoading, error } = useGoongMap({
    center: defaultCenter,
    zoom: 12,
    apiKey: GOONG_API_KEY,
  });

  // Create markers when map is loaded or candidatesWithDistance changes
  useEffect(() => {
    if (map && (candidatesWithDistance.length > 0 || candidates.length > 0)) {
      createMarkers(map);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, candidatesWithDistance.length > 0 ? candidatesWithDistance.length : candidates.length]); // Depend on map and candidates data

  const handleCandidateSelect = useCallback(
    (candidate: AllocationItem) => {
      setSelected(candidate);
      setSelectedLocation(candidate);

      // Center map on selected candidate
      if (map) {
        // Goong Maps uses [lng, lat] format
        map.setCenter([candidate.coordinates.lng, candidate.coordinates.lat]);
        map.setZoom(15);

        // Open popup for selected candidate
        const popup = popupsRef.current.get(candidate.id);
        const marker = markersRef.current.get(candidate.id);

        if (popup && marker) {
          // Close previous popup
          if (currentPopupRef.current && currentPopupRef.current.isOpen()) {
            currentPopupRef.current.remove();
          }

          // Open popup for selected marker
          marker.togglePopup();
          currentPopupRef.current = popup;
        }
      }
    },
    [map],
  );

  const handleAllocateTeam = useCallback(() => {
    if (!selectedLocation || !selectedTeam) {
      toast.error('Vui lòng chọn vị trí và đội để điều phối');
      return;
    }

    const team = teams.find((t) => t.id === selectedTeam);
    if (!team) {
      toast.error('Không tìm thấy đội được chọn');
      return;
    }

    // Update candidate team assignment
    const candidateIndex = candidatesWithDistance.findIndex((c) => c.id === selectedLocation.id);
    if (candidateIndex !== -1) {
      const updatedCandidates = [...candidatesWithDistance];
      updatedCandidates[candidateIndex] = {
        ...updatedCandidates[candidateIndex],
        team: team.name,
        status: 'assigned',
      };
      setCandidatesWithDistance(updatedCandidates);

      toast.success(`Đã điều phối ${selectedLocation.name} vào ${team.name}`);

      setSelectedTeam('');
    }
  }, [selectedLocation, selectedTeam, candidatesWithDistance]);

  if (!GOONG_API_KEY) {
    return (
      <DashboardLayout
        projects={[
          { label: 'Tổng quan', path: '/portal/coordinator/coordination', icon: 'dashboard' },
          { label: 'Điều phối & Bản đồ', path: '/portal/coordinator/maps', icon: 'map' },
          { label: 'Đội tình nguyện', path: '/portal/coordinator/teams', icon: 'groups' },
          {
            label: 'Yêu cầu tình nguyện',
            path: '/portal/coordinator/volunteers',
            icon: 'how_to_reg',
          },
          {
            label: 'Yêu cầu cứu trợ',
            path: '/portal/coordinator/requests',
            icon: 'person_raised_hand',
          },
          {
            label: 'Kho vận & Nhu yếu phẩm',
            path: '/portal/coordinator/inventory',
            icon: 'inventory_2',
          },
        ]}
        navItems={[
          {
            label: 'Báo cáo & Thống kê',
            path: '/portal/coordinator/dashboard',
            icon: 'description',
          },
        ]}
      >
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Card className="p-6">
            <CardContent className="text-center space-y-4">
              <span className="material-symbols-outlined text-5xl text-muted-foreground">
                error
              </span>
              <h2 className="text-xl font-bold">Thiếu API Key</h2>
              <p className="text-muted-foreground">Vui lòng cấu hình trong file .env</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      projects={[
        { label: 'Tổng quan', path: '/portal/coordinator/coordination', icon: 'dashboard' },
        { label: 'Điều phối & Bản đồ', path: '/portal/coordinator/maps', icon: 'map' },
        { label: 'Đội tình nguyện', path: '/portal/coordinator/teams', icon: 'groups' },
        {
          label: 'Yêu cầu tình nguyện',
          path: '/portal/coordinator/volunteers',
          icon: 'how_to_reg',
        },
        {
          label: 'Yêu cầu cứu trợ',
          path: '/portal/coordinator/requests',
          icon: 'person_raised_hand',
        },
        {
          label: 'Kho vận & Nhu yếu phẩm',
          path: '/portal/coordinator/inventory',
          icon: 'inventory_2',
        },
      ]}
      navItems={[
        { label: 'Báo cáo & Thống kê', path: '/portal/coordinator/dashboard', icon: 'description' },
      ]}
    >
      <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
        {/* Header with search and filters */}
        <div className="border-b bg-background p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-primary leading-tight">
                Phân bổ thành viên trên bản đồ
              </h1>
              <p className="text-sm text-muted-foreground">
                {candidatesWithDistance.length || candidates.length} vị trí • Trụ sở:{' '}
                {HEADQUARTERS.name} • Click marker để xem chi tiết
                {loadingDistances && ' • Đang tính khoảng cách...'}
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm tên, kỹ năng, khu vực..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 bg-background"
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (map) {
                    const bounds = new goongjs.LngLatBounds();
                    bounds.extend([HEADQUARTERS.coordinates.lng, HEADQUARTERS.coordinates.lat]);
                    const candidatesToFit =
                      candidatesWithDistance.length > 0 ? candidatesWithDistance : candidates;
                    candidatesToFit.forEach((candidate) => {
                      bounds.extend([candidate.coordinates.lng, candidate.coordinates.lat]);
                    });
                    map.fitBounds(bounds, { padding: 50 });
                  }
                }}
                className="gap-1"
              >
                <span className="material-symbols-outlined text-sm">zoom_out_map</span>
                Xem tất cả
              </Button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Badge variant="primary">
              Tất cả ({candidatesWithDistance.length || candidates.length})
            </Badge>
            <Badge variant="outline">
              Mới (
              {
                (candidatesWithDistance.length ? candidatesWithDistance : candidates).filter(
                  (c) => c.status === 'new',
                ).length
              }
              )
            </Badge>
            <Badge variant="outline">
              Chờ phân bổ (
              {
                (candidatesWithDistance.length ? candidatesWithDistance : candidates).filter(
                  (c) => c.status === 'pending',
                ).length
              }
              )
            </Badge>
            <Badge variant="outline">
              Đã ghép đội (
              {
                (candidatesWithDistance.length ? candidatesWithDistance : candidates).filter(
                  (c) => c.status === 'assigned',
                ).length
              }
              )
            </Badge>
            {candidatesWithDistance.length > 0 && (
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              >
                Gần nhất ({candidatesWithDistance.filter((c) => c.isNearest).length})
              </Badge>
            )}
          </div>
        </div>

        {/* Main content: Map + Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map Container */}
          <div className="flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Đang tải bản đồ...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                <Card className="p-6">
                  <CardContent className="text-center space-y-4">
                    <span className="material-symbols-outlined text-5xl text-destructive">
                      error
                    </span>
                    <h2 className="text-xl font-bold">Lỗi tải bản đồ</h2>
                    <p className="text-muted-foreground">{error}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={mapRef} className="w-full h-full" />
          </div>

          {/* Sidebar: Candidate list and allocation panel */}
          <aside className="w-[420px] flex flex-col border-l bg-muted/20">
            <ScrollArea className="flex-1 p-4 space-y-4">
              {/* Team Allocation Panel */}
              {selectedLocation && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">location_on</span>
                      <p className="font-semibold">Điều phối cho vị trí</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-sm">{selectedLocation.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedLocation.role}</p>
                      <p className="text-xs text-muted-foreground">
                        📍 {selectedLocation.address || selectedLocation.location}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Chọn đội điều phối</label>
                      <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn đội phù hợp" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{team.name}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {team.members}/{team.capacity}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleAllocateTeam}
                      disabled={!selectedTeam}
                      className="w-full gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Xác nhận điều phối
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Candidate List */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  Danh sách ứng viên ({filtered.length})
                </h3>
                {filtered.map((c) => (
                  <Card
                    key={c.id}
                    onClick={() => handleCandidateSelect(c)}
                    className={`cursor-pointer transition ${
                      selected?.id === c.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/60'
                    }`}
                  >
                    <CardContent className="p-3 flex gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white flex items-center justify-center font-bold border border-border">
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <p className="font-bold truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{c.role}</p>
                          </div>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded ${
                              c.status === 'new'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : c.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}
                          >
                            {c.status === 'new'
                              ? 'Mới'
                              : c.status === 'pending'
                                ? 'Chờ phân bổ'
                                : 'Đã ghép đội'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>📍 {c.location}</span>
                          <span>{c.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {c.isNearest && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300"
                            >
                              📍 Gần nhất
                            </Badge>
                          )}
                          {c.distance?.straightLine && (
                            <span className="text-[10px] text-muted-foreground">
                              📏 {c.distance.straightLine} km từ trụ sở
                            </span>
                          )}
                          {c.team && (
                            <Badge variant="secondary" className="text-xs">
                              {c.team}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
