/**
 * Goong Maps API Service
 * Documentation: https://docs.goong.io/
 */

export interface DirectionsRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  vehicle?: 'car' | 'bike' | 'foot';
}

export interface RouteLeg {
  distance: {
    value: number; // meters
    text: string; // formatted string
  };
  duration: {
    value: number; // seconds
    text: string; // formatted string
  };
  steps: Array<{
    distance: { value: number; text: string };
    duration: { value: number; text: string };
    instruction: string;
  }>;
}

export interface DirectionsResponse {
  routes: Array<{
    legs: RouteLeg[];
    overview_polyline: {
      points: string;
    };
    distance: { value: number; text: string };
    duration: { value: number; text: string };
  }>;
  geocoded_waypoints: Array<{
    geocoder_status: string;
    place_id: string;
  }>;
}

/**
 * Calculate distance and duration from headquarters to a location
 * @param origin - Headquarters coordinates
 * @param destination - Destination coordinates
 * @param vehicle - Type of vehicle (car, bike, foot)
 * @param apiKey - Goong Maps API Key
 * @returns Route information with distance and duration
 */
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  vehicle: 'car' | 'bike' | 'foot' = 'car',
  apiKey: string,
): Promise<DirectionsResponse | null> {
  try {
    const vehicleParam = vehicle === 'bike' ? 'bike' : vehicle === 'foot' ? 'foot' : 'car';
    const url = `https://rsapi.goong.io/Direction?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&vehicle=${vehicleParam}&api_key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Directions API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching directions:', error);
    return null;
  }
}

/**
 * Calculate straight-line distance (Haversine formula) between two coordinates
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number },
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Format duration from seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  return `${minutes} phút`;
}

/**
 * Format distance from meters to human-readable string
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}
