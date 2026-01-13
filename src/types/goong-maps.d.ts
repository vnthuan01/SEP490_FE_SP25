declare module '@goongmaps/goong-js' {
  export interface LngLatLike {
    lng: number;
    lat: number;
  }

  export interface MapOptions {
    container: string | HTMLElement;
    style: string;
    center?: [number, number];
    zoom?: number;
    pitch?: number;
    bearing?: number;
  }

  export class Map {
    constructor(options: MapOptions);
    getCenter(): { lng: number; lat: number };
    setCenter(center: [number, number]): this;
    getZoom(): number;
    setZoom(zoom: number): this;
    fitBounds(
      bounds: LngLatBounds,
      options?: { padding?: number | object; maxZoom?: number },
    ): this;
    on(event: string, callback: (event: unknown) => void): this;
    off(event: string, callback?: (event: unknown) => void): this;
    remove(): void;
  }

  export interface MarkerOptions {
    element?: HTMLElement;
    anchor?:
      | 'center'
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right';
    offset?: [number, number] | { [key: string]: [number, number] };
    color?: string;
    scale?: number;
    draggable?: boolean;
    rotation?: number;
    rotationAlignment?: 'map' | 'viewport' | 'auto';
    pitchAlignment?: 'map' | 'viewport' | 'auto';
  }

  export class Marker {
    constructor(options?: MarkerOptions);
    setLngLat(lnglat: [number, number] | LngLatLike): this;
    getLngLat(): { lng: number; lat: number };
    addTo(map: Map): this;
    remove(): this;
    setPopup(popup: Popup | null): this;
    getPopup(): Popup | null;
    togglePopup(): this;
    setDraggable(shouldBeDraggable: boolean): this;
    isDraggable(): boolean;
    getElement(): HTMLElement;
    on(event: string, callback: () => void): this;
  }

  export interface PopupOptions {
    closeButton?: boolean;
    closeOnClick?: boolean;
    closeOnMove?: boolean;
    anchor?:
      | 'center'
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right';
    offset?: number | [number, number] | { [key: string]: [number, number] };
    className?: string;
    maxWidth?: string;
  }

  export class Popup {
    constructor(options?: PopupOptions);
    addTo(map: Map): this;
    remove(): this;
    getLngLat(): { lng: number; lat: number } | null;
    setLngLat(lnglat: [number, number] | LngLatLike): this;
    setHTML(html: string): this;
    setText(text: string): this;
    setDOMContent(htmlNode: Node): this;
    getElement(): HTMLElement | undefined;
    on(event: string, callback: () => void): this;
    isOpen(): boolean;
  }

  export class LngLatBounds {
    constructor(sw?: [number, number] | LngLatLike, ne?: [number, number] | LngLatLike);
    extend(lnglat: [number, number] | LngLatLike): this;
    getCenter(): { lng: number; lat: number };
    getSouthWest(): { lng: number; lat: number };
    getNorthEast(): { lng: number; lat: number };
    getNorthWest(): { lng: number; lat: number };
    getSouthEast(): { lng: number; lat: number };
    toArray(): [[number, number], [number, number]];
  }

  // Default export with accessToken property
  interface GoongJS {
    Map: typeof Map;
    Marker: typeof Marker;
    Popup: typeof Popup;
    LngLatBounds: typeof LngLatBounds;
    accessToken: string;
  }

  const goongjs: GoongJS;
  export default goongjs;
}
