import type { ReliefLocation } from './types';

// Calculate danger score based on multiple factors (AI simulation)
export const calculateDangerScore = (location: ReliefLocation): number => {
  let score = 0;

  // Urgency weight (40 points)
  if (location.urgency === 'high') score += 40;
  else if (location.urgency === 'medium') score += 25;
  else score += 10;

  // People count weight (20 points)
  const peopleScore = Math.min((location.peopleCount / 300) * 20, 20);
  score += peopleScore;

  // Emergency rescue need (20 points)
  if (location.needs.emergencyRescue) score += 20;

  // Multiple needs (10 points)
  const needsCount = Object.values(location.needs).filter(Boolean).length;
  score += (needsCount / 4) * 10;

  // Time factor (10 points) - older reports get higher priority
  const reportTime = new Date(location.reportedAt).getTime();
  const now = new Date().getTime();
  const hoursAgo = (now - reportTime) / (1000 * 60 * 60);
  const timeScore = Math.min((hoursAgo / 6) * 10, 10);
  score += timeScore;

  return Math.min(Math.round(score), 100);
};

// Calculate priority score (combines danger + strategic factors)
export const calculatePriorityScore = (location: ReliefLocation, dangerScore: number): number => {
  let score = dangerScore * 0.7; // 70% from danger

  // Accessibility factor (15 points)
  // Locations in mountainous areas (Quảng Nam, Quảng Trị) get higher priority
  if (location.province === 'Quảng Nam' || location.province === 'Quảng Trị') {
    score += 15;
  } else if (location.province === 'Hà Tĩnh' || location.province === 'Quảng Ngãi') {
    score += 10;
  } else {
    score += 5;
  }

  // Status factor (15 points) - unassigned gets highest
  if (location.status === 'unassigned') score += 15;
  else if (location.status === 'assigned') score += 5;

  return Math.min(Math.round(score), 100);
};

// Get color based on danger score
export const getDangerColor = (score: number): string => {
  if (score >= 80) return '#dc2626'; // red-600
  if (score >= 60) return '#ea580c'; // orange-600
  if (score >= 40) return '#f59e0b'; // amber-500
  return '#10b981'; // green-500
};

// Get urgency color
export const getUrgencyColor = (urgency: ReliefLocation['urgency']): string => {
  switch (urgency) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#10b981';
  }
};

// Get status color
export const getStatusColor = (status: ReliefLocation['status']): string => {
  switch (status) {
    case 'unassigned':
      return '#ef4444';
    case 'assigned':
      return '#f59e0b';
    case 'on-the-way':
      return '#3b82f6';
    case 'completed':
      return '#10b981';
    case 'failed':
      return '#6b7280';
  }
};

// Get vehicle icon
export const getVehicleIcon = (vehicle: string): string => {
  switch (vehicle) {
    case 'truck':
      return 'local_shipping';
    case 'boat':
      return 'directions_boat';
    case 'motorcycle':
      return 'two_wheeler';
    case 'helicopter':
      return 'flight';
    default:
      return 'directions_walk';
  }
};

// Format distance
export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

// Format duration
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}ph`;
  }
  return `${minutes}ph`;
};

// Calculate straight-line distance (Haversine formula)
export const calculateStraightLineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Estimate travel time by vehicle type (simplified)
export const estimateTravelTime = (
  distanceKm: number,
  vehicle: string,
): { distance: number; duration: number } => {
  let speedKmh = 50; // default

  switch (vehicle) {
    case 'motorcycle':
      speedKmh = 40; // slower in mountainous terrain
      break;
    case 'truck':
      speedKmh = 35; // heavy vehicle, difficult terrain
      break;
    case 'helicopter':
      speedKmh = 200; // fast but limited by weather
      break;
    case 'boat':
      speedKmh = 25; // river navigation
      break;
  }

  const durationHours = distanceKm / speedKmh;
  const durationSeconds = durationHours * 3600;
  const distanceMeters = distanceKm * 1000;

  return {
    distance: Math.round(distanceMeters),
    duration: Math.round(durationSeconds),
  };
};
