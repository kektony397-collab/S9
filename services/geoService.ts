// FIX: Declare the 'google' object globally to provide TypeScript with its type information,
// resolving errors related to the Google Maps API types not being found on the window object.
declare global {
  var google: any;
}

import { LocationPoint } from '../types';

/**
 * Calculates the distance between two GPS coordinates in kilometers using the Haversine formula.
 */
function haversineDistance(point1: LocationPoint, point2: LocationPoint): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (point2.lat - point1.lat) * (Math.PI / 180);
  const dLon = (point2.lng - point1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * (Math.PI / 180)) *
      Math.cos(point2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the total distance of a path in kilometers.
 */
export function calculateDistance(path: LocationPoint[]): number {
  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    totalDistance += haversineDistance(path[i - 1], path[i]);
  }
  return totalDistance;
}

/**
 * Calculates the area of a polygon defined by a path of GPS coordinates in square meters using the Shoelace formula.
 * The path is assumed to be a closed loop for accurate area calculation.
 */
export function calculateArea(path: LocationPoint[]): number {
  if (path.length < 3) {
    return 0;
  }
  
  // Close the loop if it's not already
  const closedPath = [...path, path[0]];

  let area = 0;
  const R = 6371000; // Earth radius in meters

  for (let i = 0; i < closedPath.length - 1; i++) {
    const p1 = closedPath[i];
    const p2 = closedPath[i + 1];
    
    const x1 = p1.lng * (Math.PI / 180) * R * Math.cos(p1.lat * (Math.PI / 180));
    const y1 = p1.lat * (Math.PI / 180) * R;
    const x2 = p2.lng * (Math.PI / 180) * R * Math.cos(p2.lat * (Math.PI / 180));
    const y2 = p2.lat * (Math.PI / 180) * R;

    area += (x1 * y2 - x2 * y1);
  }

  return Math.abs(area / 2);
}

/**
 * Gets a human-readable address from coordinates using Google's Geocoding API.
 */
export function reverseGeocode(location: { lat: number; lng: number }): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      return reject('Google Maps Geocoder not available.');
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK') {
        if (results && results[0]) {
          // Find a suitable result type. e.g., 'route', 'neighborhood', 'locality'
          const suitableResult = results.find(r => r.types.includes('route') || r.types.includes('neighborhood') || r.types.includes('political')) || results[0];
          resolve(suitableResult.formatted_address);
        } else {
          resolve('Unknown Location');
        }
      } else if (status === 'ZERO_RESULTS') {
        resolve('Unknown Location');
      } else {
        console.error(`Geocode failed with status: ${status}`);
        reject(`Geocode was not successful for the following reason: ${status}`);
      }
    });
  });
}