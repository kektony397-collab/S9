// FIX: Declare the 'google' object globally to provide TypeScript with its type information,
// resolving errors related to the Google Maps API types not being found.
declare global {
  var google: any;
}

import React from 'react';
import { GoogleMap, Polyline, Marker } from '@react-google-maps/api';
import { LocationPoint, TrackingStatus } from '../types';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapId: 'a1b2c3d4e5f6g7h8' // Example custom map ID for styling
};

interface MapViewProps {
  path: LocationPoint[];
  status: TrackingStatus;
}

const MapView: React.FC<MapViewProps> = ({ path, status }) => {
  const mapRef = React.useRef<google.maps.Map | null>(null);
  
  const onMapLoad = React.useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  React.useEffect(() => {
    if (mapRef.current && path.length > 0) {
      const lastPoint = path[path.length - 1];
      mapRef.current.panTo({ lat: lastPoint.lat, lng: lastPoint.lng });
    }
  }, [path]);

  const lastPosition = path.length > 0 ? path[path.length - 1] : null;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={lastPosition || center}
      zoom={lastPosition ? 16 : 8}
      onLoad={onMapLoad}
      options={mapOptions}
    >
      {path.length > 1 && (
        <Polyline
          path={path}
          options={{
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 5,
          }}
        />
      )}
      {lastPosition && (
        <Marker
          position={lastPosition}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: status === TrackingStatus.TRACKING ? '#22c55e' : '#f97316',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
          }}
        />
      )}
    </GoogleMap>
  );
};

export default React.memo(MapView);