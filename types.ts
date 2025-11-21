export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export type UserRole = 'employee' | 'admin';

export interface User {
  name: string; // The ID is the name
  password?: string; // Simple password
  role: UserRole;
}

export interface CheckInRecord {
  id: string;
  userName: string; // Identify who checked in
  timestamp: number;
  location: GeoCoordinates;
  aiMessage?: string;
}

export enum LocationStatus {
  LOCATING = 'LOCATING',
  IN_RANGE = 'IN_RANGE',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ERROR = 'ERROR'
}