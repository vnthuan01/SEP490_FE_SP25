import { useEffect, useRef, useState, type RefObject } from 'react';
import goongjs, { type Map, type MapOptions } from '@goongmaps/goong-js';

interface UseGoongMapOptions {
  center: { lat: number; lng: number };
  zoom?: number;
  apiKey: string;
  onMapLoad?: (_map: Map) => void;
}

interface UseGoongMapReturn {
  map: Map | null;
  mapRef: RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to initialize and manage Goong Maps instance using @goongmaps/goong-js
 *
 * @param options - Configuration options for the map
 * @returns Map instance, ref, loading state, and error state
 */
export function useGoongMap({
  center,
  zoom = 14,
  apiKey,
  onMapLoad,
}: UseGoongMapOptions): UseGoongMapReturn {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  // Use ref to store onMapLoad callback to avoid recreating map
  const onMapLoadRef = useRef(onMapLoad);
  useEffect(() => {
    onMapLoadRef.current = onMapLoad;
  }, [onMapLoad]);

  useEffect(() => {
    if (!mapRef.current || !apiKey) return;

    // Cleanup previous map instance if exists
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {
        // Ignore cleanup errors
      }
      mapInstanceRef.current = null;
    }

    const initializeMap = () => {
      if (!mapRef.current) {
        setError('Map container not available');
        setIsLoading(false);
        return;
      }

      try {
        // Set access token for Goong Maps
        goongjs.accessToken = apiKey;

        // Goong Maps uses [lng, lat] format, not [lat, lng]
        const mapOptions: MapOptions = {
          container: mapRef.current,
          style: 'https://tiles.goong.io/assets/goong_map_web.json',
          center: [center.lng, center.lat],
          zoom,
        };

        const mapInstance = new goongjs.Map(mapOptions);
        mapInstanceRef.current = mapInstance;

        // Wait for map to load
        mapInstance.on('load', () => {
          setMap(mapInstance);
          setIsLoading(false);
          setError(null);

          // Use ref to call callback
          if (onMapLoadRef.current) {
            onMapLoadRef.current(mapInstance);
          }
        });

        // Handle map errors
        mapInstance.on('error', (e: unknown) => {
          const error = e as { error?: { message?: string } };
          setError(error.error?.message || 'Failed to load map');
          setIsLoading(false);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create map instance');
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null;
        setMap(null);
      }
    };
  }, [center.lat, center.lng, zoom, apiKey]); // Only depend on primitive values, not callbacks

  // Update map center when it changes
  useEffect(() => {
    if (map) {
      const currentCenter = map.getCenter();
      if (currentCenter.lng !== center.lng || currentCenter.lat !== center.lat) {
        map.setCenter([center.lng, center.lat]);
      }
    }
  }, [map, center]);

  // Update map zoom when it changes
  useEffect(() => {
    if (map && map.getZoom() !== zoom) {
      map.setZoom(zoom);
    }
  }, [map, zoom]);

  return { map, mapRef, isLoading, error };
}
