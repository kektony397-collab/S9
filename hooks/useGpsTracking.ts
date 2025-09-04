
import { useState, useEffect, useRef, useCallback } from 'react';
import { LocationPoint, TrackingStatus, TrackingStats } from '../types';
import { calculateDistance, calculateArea } from '../services/geoService';
import { db } from '../services/db';

const GPS_THROTTLE_INTERVAL = 3000; // 3 seconds

const useGpsTracking = () => {
  const [status, setStatus] = useState<TrackingStatus>(TrackingStatus.IDLE);
  const [locationHistory, setLocationHistory] = useState<LocationPoint[]>([]);
  const [stats, setStats] = useState<TrackingStats>({
    distance: 0,
    avgSpeed: 0,
    maxSpeed: 0,
    area: 0,
  });
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  const calculateStats = useCallback((history: LocationPoint[]) => {
    if (history.length < 2) {
        const initialStats = { distance: 0, avgSpeed: 0, maxSpeed: 0, area: 0 };
        setStats(initialStats);
        return initialStats;
    }

    const distance = calculateDistance(history);
    const speeds = history.map(p => p.speed || 0).filter(s => s > 1); // Filter out low speeds for avg
    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    const maxSpeed = Math.max(0, ...history.map(p => p.speed || 0));
    const area = calculateArea(history);

    const newStats = { distance, avgSpeed, maxSpeed, area };
    setStats(newStats);
    return newStats;
  }, []);
  
  const handleSuccess: PositionCallback = (position) => {
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < GPS_THROTTLE_INTERVAL) {
        return;
    }
    lastUpdateTimeRef.current = now;
      
    const { latitude, longitude, speed } = position.coords;
    // Speed from geolocation is in m/s, convert to km/h
    const speedKmh = speed ? speed * 3.6 : 0;
    
    // Auto-pause if speed is very low
    if (speedKmh < 1 && locationHistory.length > 0) {
        // We just don't record the point, effectively pausing
        return;
    }

    setLocationHistory((prevHistory) => {
      const newPoint = {
        lat: latitude,
        lng: longitude,
        timestamp: position.timestamp,
        speed: speedKmh,
      };
      const newHistory = [...prevHistory, newPoint];
      const newStats = calculateStats(newHistory);
      db.currentSession.put({ id: 1, locationHistory: newHistory, stats: newStats });
      return newHistory;
    });
  };

  const handleError: PositionErrorCallback = (error) => {
    console.error('GPS Error:', error);
    if (error.code === error.PERMISSION_DENIED) {
      setStatus(TrackingStatus.PERMISSION_DENIED);
       alert('GPS permission has been denied. Please enable it in your browser settings to use this feature.');
    } else {
      setStatus(TrackingStatus.ERROR);
      alert(`Error getting location: ${error.message}`);
    }
  };

  const startTracking = async () => {
    if (!navigator.geolocation) {
      setStatus(TrackingStatus.ERROR);
      alert('Geolocation is not supported by your browser.');
      return;
    }
    
    if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        if (permissionStatus.state === 'denied') {
            setStatus(TrackingStatus.PERMISSION_DENIED);
            alert('GPS permission is denied. Please enable it in your browser settings.');
            return;
        }
    }
    
    if (status === TrackingStatus.IDLE || status === TrackingStatus.PERMISSION_DENIED) {
        resetTracking();
    }
    
    setStatus(TrackingStatus.TRACKING);
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setStatus(TrackingStatus.IDLE);
  };
  
  const resetTracking = useCallback(() => {
    setLocationHistory([]);
    setStats({ distance: 0, avgSpeed: 0, maxSpeed: 0, area: 0 });
    db.currentSession.clear();
  }, []);

  useEffect(() => {
    // Stop tracking on component unmount
    return () => {
        stopTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return { status, locationHistory, stats, startTracking, stopTracking, resetTracking };
};

export default useGpsTracking;
