// Haversine formula to calculate distance between two GPS coordinates
// Returns distance in meters

export interface Coordinates {
  lat: number;
  lng: number;
}

export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371000; // Earth's radius in meters

  const lat1 = toRadians(coord1.lat);
  const lat2 = toRadians(coord2.lat);
  const deltaLat = toRadians(coord2.lat - coord1.lat);
  const deltaLng = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const isWithinRadius = (
  userLocation: Coordinates,
  centerLocation: Coordinates,
  radiusMeters: number
): boolean => {
  const distance = calculateDistance(userLocation, centerLocation);
  return distance <= radiusMeters;
};

export const parseLocation = (locationString: string | null): Coordinates | null => {
  if (!locationString) return null;
  try {
    const parsed = JSON.parse(locationString);
    if (parsed.lat && parsed.lng) {
      return { lat: parsed.lat, lng: parsed.lng };
    }
    return null;
  } catch {
    return null;
  }
};

export const formatLocation = (coordinates: Coordinates): string => {
  return JSON.stringify(coordinates);
};
