import { describe, it, expect } from 'vitest';
import {
  calculateDistance,
  isWithinRadius,
  parseLocation,
  formatLocation,
  Coordinates
} from './location';

describe('Location Utils', () => {
  describe('calculateDistance', () => {
    it('should return 0 for same coordinates', () => {
      const coord: Coordinates = { lat: -6.2088, lng: 106.8456 };
      const distance = calculateDistance(coord, coord);
      expect(distance).toBe(0);
    });

    it('should calculate distance between two points correctly', () => {
      const jakarta: Coordinates = { lat: -6.2088, lng: 106.8456 };
      const bandung: Coordinates = { lat: -6.9175, lng: 107.6191 };
      const distance = calculateDistance(jakarta, bandung);

      // Distance should be approximately 120-140 km
      expect(distance).toBeGreaterThan(100000);
      expect(distance).toBeLessThan(200000);
    });

    it('should handle negative coordinates', () => {
      const coord1: Coordinates = { lat: -6.2088, lng: 106.8456 };
      const coord2: Coordinates = { lat: -6.2100, lng: 106.8470 };
      const distance = calculateDistance(coord1, coord2);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1000);
    });
  });

  describe('isWithinRadius', () => {
    it('should return true for point within radius', () => {
      const center: Coordinates = { lat: -6.2088, lng: 106.8456 };
      const point: Coordinates = { lat: -6.2090, lng: 106.8460 };
      const radius = 500; // 500 meters

      expect(isWithinRadius(point, center, radius)).toBe(true);
    });

    it('should return false for point outside radius', () => {
      const center: Coordinates = { lat: -6.2088, lng: 106.8456 };
      const point: Coordinates = { lat: -6.9175, lng: 107.6191 }; // Bandung
      const radius = 500; // 500 meters

      expect(isWithinRadius(point, center, radius)).toBe(false);
    });

    it('should return true for point exactly on the edge', () => {
      const center: Coordinates = { lat: 0, lng: 0 };
      // 0.00449 degrees latitude is approximately 499m from origin
      const point: Coordinates = { lat: 0.00449, lng: 0 };
      const radius = 500;

      expect(isWithinRadius(point, center, radius)).toBe(true);
    });
  });

  describe('parseLocation', () => {
    it('should parse valid JSON location', () => {
      const locationString = '{"lat":-6.2088,"lng":106.8456}';
      const result = parseLocation(locationString);

      expect(result).toEqual({ lat: -6.2088, lng: 106.8456 });
    });

    it('should return null for null input', () => {
      expect(parseLocation(null)).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      expect(parseLocation('invalid json')).toBeNull();
    });

    it('should return null for missing coordinates', () => {
      expect(parseLocation('{"lat":-6.2088}')).toBeNull();
      expect(parseLocation('{"lng":106.8456}')).toBeNull();
    });
  });

  describe('formatLocation', () => {
    it('should format coordinates to JSON string', () => {
      const coords: Coordinates = { lat: -6.2088, lng: 106.8456 };
      const result = formatLocation(coords);

      expect(result).toBe('{"lat":-6.2088,"lng":106.8456}');
    });

    it('should be parseable back to coordinates', () => {
      const coords: Coordinates = { lat: -6.2088, lng: 106.8456 };
      const formatted = formatLocation(coords);
      const parsed = parseLocation(formatted);

      expect(parsed).toEqual(coords);
    });
  });
});
