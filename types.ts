
export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
  speed: number | null; // in km/h
}

export interface TrackingStats {
  distance: number; // in km
  avgSpeed: number; // in km/h
  maxSpeed: number; // in km/h
  area: number; // in square meters
}

export interface TrackingSession {
  name: string;
  startTime: number;
  endTime: number;
  locationHistory: LocationPoint[];
  stats: TrackingStats;
}

export enum TrackingStatus {
  IDLE = 'IDLE',
  TRACKING = 'TRACKING',
  PAUSED = 'PAUSED', // Not fully implemented, but status is available
  ERROR = 'ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export enum AppView {
    TRACKING = 'TRACKING',
    HISTORY = 'HISTORY',
}
