// The maximum distance (in meters) allowed to check in
export const ALLOWED_RADIUS_METERS = 100;

// Local storage keys
export const STORAGE_KEY_FACTORY_LOC = 'geocheckin_factory_location';
export const STORAGE_KEY_HISTORY = 'geocheckin_history';
export const STORAGE_KEY_USERS = 'geocheckin_users';
export const STORAGE_KEY_CURRENT_USER = 'geocheckin_current_user';

// Fallback/Default Factory Location (Use a real placeholder, but app allows resetting)
export const DEFAULT_FACTORY_LOCATION = {
  latitude: 39.9042, // Beijing generic
  longitude: 116.4074
};