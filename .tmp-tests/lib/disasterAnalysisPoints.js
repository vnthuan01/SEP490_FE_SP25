const kmToLatitudeDelta = (km) => km / 111;
const kmToLongitudeDelta = (km, latitude) => {
  const cosLat = Math.cos((latitude * Math.PI) / 180);
  return km / (111 * Math.max(Math.abs(cosLat), 0.2));
};
const getPointInRadius = (center, distanceKm, angleDeg) => {
  const angleRad = (angleDeg * Math.PI) / 180;
  const latDelta = kmToLatitudeDelta(distanceKm * Math.sin(angleRad));
  const lngDelta = kmToLongitudeDelta(distanceKm * Math.cos(angleRad), center.latitude);
  return {
    latitude: center.latitude + latDelta,
    longitude: center.longitude + lngDelta,
  };
};
const VIETNAM_LAND_BANDS = [
  { minLat: 8.55, maxLat: 10.9, minLng: 104.35, maxLng: 106.95 },
  { minLat: 10.9, maxLat: 12.9, minLng: 104.0, maxLng: 109.55 },
  { minLat: 12.9, maxLat: 14.9, minLng: 108.0, maxLng: 109.95 },
  { minLat: 14.9, maxLat: 16.4, minLng: 107.1, maxLng: 108.9 },
  { minLat: 16.4, maxLat: 18.1, minLng: 106.15, maxLng: 108.55 },
  { minLat: 18.1, maxLat: 20.1, minLng: 104.95, maxLng: 106.95 },
  { minLat: 20.1, maxLat: 21.4, minLng: 104.1, maxLng: 106.85 },
  { minLat: 20.1, maxLat: 21.7, minLng: 106.85, maxLng: 108.05 },
  { minLat: 21.4, maxLat: 22.9, minLng: 103.15, maxLng: 107.15 },
  { minLat: 21.4, maxLat: 22.75, minLng: 107.15, maxLng: 108.15 },
  { minLat: 22.9, maxLat: 23.55, minLng: 104.35, maxLng: 106.95 },
];
export const isVietnamLandCoordinate = (latitude, longitude) => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  return VIETNAM_LAND_BANDS.some(
    (band) =>
      latitude >= band.minLat &&
      latitude <= band.maxLat &&
      longitude >= band.minLng &&
      longitude <= band.maxLng,
  );
};
const clampToVietnamLand = (point, fallback) => {
  if (isVietnamLandCoordinate(point.latitude, point.longitude)) return point;
  const nudges = [
    { lat: 0, lng: 0 },
    { lat: 0.08, lng: 0.08 },
    { lat: -0.08, lng: 0.08 },
    { lat: 0.08, lng: -0.08 },
    { lat: -0.08, lng: -0.08 },
    { lat: 0.16, lng: 0 },
    { lat: -0.16, lng: 0 },
    { lat: 0, lng: 0.16 },
    { lat: 0, lng: -0.16 },
  ];
  for (const band of VIETNAM_LAND_BANDS) {
    const clampedLat = Math.min(Math.max(point.latitude, band.minLat), band.maxLat);
    const clampedLng = Math.min(Math.max(point.longitude, band.minLng), band.maxLng);
    for (const nudge of nudges) {
      const candidate = {
        latitude: clampedLat + nudge.lat,
        longitude: clampedLng + nudge.lng,
      };
      if (isVietnamLandCoordinate(candidate.latitude, candidate.longitude)) return candidate;
    }
  }
  return fallback;
};
const toCoordKey = (point) => `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}`;
export const toAnalysisCoordKey = (latitude, longitude) =>
  `${Number(latitude).toFixed(6)},${Number(longitude).toFixed(6)}`;
export const getDistanceKm = (from, to) => {
  const earthRadiusKm = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;
  const fromLat = (from.latitude * Math.PI) / 180;
  const toLat = (to.latitude * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
export const findNearestStationArea = (point, stations) => {
  let nearest = null;
  stations.forEach((station) => {
    const distanceKm = getDistanceKm(point, station);
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = { station, distanceKm };
    }
  });
  return nearest;
};
export const isPointWithinStationArea = (point, stations) => {
  const nearest = findNearestStationArea(point, stations);
  if (!nearest) return false;
  const allowedRadiusKm = Math.max((nearest.station.coverageRadiusKm || 12) * 1.8, 8);
  return nearest.distanceKm <= allowedRadiusKm;
};
export const getStationFallbackRadiusKm = (station) =>
  Math.max((station.coverageRadiusKm || 12) * 1.35, 18);
export const isPointWithinStationFallbackArea = (point, station) =>
  getDistanceKm(point, station) <= getStationFallbackRadiusKm(station);
export const buildStationFallbackBoundary = (station, segments = 48) => {
  const radiusKm = getStationFallbackRadiusKm(station);
  const ring = Array.from({ length: segments + 1 }, (_, index) => {
    const angle = (index / segments) * 2 * Math.PI;
    const lat = station.latitude + kmToLatitudeDelta(radiusKm * Math.sin(angle));
    const lng =
      station.longitude + kmToLongitudeDelta(radiusKm * Math.cos(angle), station.latitude);
    return [lng, lat];
  });
  return [ring];
};
const isPointInRing = (point, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]?.[0];
    const yi = ring[i]?.[1];
    const xj = ring[j]?.[0];
    const yj = ring[j]?.[1];
    if (
      !Number.isFinite(xi) ||
      !Number.isFinite(yi) ||
      !Number.isFinite(xj) ||
      !Number.isFinite(yj)
    ) {
      continue;
    }
    const intersects =
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
};
export const isPointInBoundaryPolygon = (point, polygons) => {
  if (!polygons?.length) return false;
  const [outerRing, ...holes] = polygons;
  if (!outerRing?.length || !isPointInRing(point, outerRing)) return false;
  return !holes.some((ring) => ring.length > 0 && isPointInRing(point, ring));
};
export const buildStationAnalysisPoints = (stationPoint, coverageRadiusKm) => {
  const radiusKm = Math.max((coverageRadiusKm || 12) * 1.35, 18);
  const fallbackCenter = clampToVietnamLand(stationPoint, {
    latitude: 16.0544,
    longitude: 108.2022,
  });
  const pointDefinitions = [
    {
      label: 'Điểm giám sát phía nam',
      context:
        'khu vực phía nam trạm để tách khỏi cụm phía tây bắc, vẫn nằm trong vùng nội địa quanh trạm',
      distanceScale: 0.62,
      angleDeg: 270,
    },
    {
      label: 'Điểm giám sát sát trạm',
      context: 'khu vực rất gần trạm để đối chiếu nhanh với các điểm xa hơn trong tỉnh',
      distanceScale: 0.18,
      angleDeg: 245,
    },
  ];
  const uniquePoints = new Map();
  pointDefinitions.forEach((definition, index) => {
    const rawPoint = getPointInRadius(
      fallbackCenter,
      radiusKm * definition.distanceScale,
      definition.angleDeg,
    );
    const safePoint = clampToVietnamLand(rawPoint, fallbackCenter);
    const key = toCoordKey(safePoint);
    if (!uniquePoints.has(key)) {
      uniquePoints.set(key, {
        ...safePoint,
        label: definition.label,
        context: definition.context,
      });
    }
    if (uniquePoints.size <= index) {
      const adjustedPoint = clampToVietnamLand(
        getPointInRadius(
          fallbackCenter,
          Math.max(radiusKm * (definition.distanceScale * 0.72), 1.2),
          definition.angleDeg - 18,
        ),
        fallbackCenter,
      );
      uniquePoints.set(toCoordKey(adjustedPoint), {
        ...adjustedPoint,
        label: definition.label,
        context: definition.context,
      });
    }
  });
  return Array.from(uniquePoints.values()).slice(0, 2);
};
