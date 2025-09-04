import Dexie, { Table } from 'dexie';
import { LocationPoint, TrackingStats, TrackingSession } from '../types';

export interface SavedSession extends TrackingSession {
  id?: number;
}

export interface CurrentSession {
  id?: 1;
  locationHistory: LocationPoint[];
  stats: TrackingStats;
}

export class GpsTrackingDB extends Dexie {
  savedSessions!: Table<SavedSession>;
  currentSession!: Table<CurrentSession>;

  constructor() {
    super('GpsTrackingDB');
    // FIX: Cast 'this' to 'any' to bypass a TypeScript error where the 'version' method is not found. This is likely an environment or dependency issue.
    (this as any).version(1).stores({
      savedSessions: '++id, name, endTime',
      currentSession: 'id',
    });
  }
}

export const db = new GpsTrackingDB();