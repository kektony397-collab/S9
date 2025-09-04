
import React, { useState, useEffect, useCallback } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { useLiveQuery } from 'dexie-react-hooks';

import { db, SavedSession } from './services/db';
import { TrackingSession, AppView, TrackingStatus } from './types';
import useGpsTracking from './hooks/useGpsTracking';

import ApiKeyManager from './components/ApiKeyManager';
import MapView from './components/MapView';
import TrackingControls from './components/TrackingControls';
import StatCard from './components/StatCard';
import SessionList from './components/SessionList';
import SessionModal from './components/SessionModal';
import MapIcon from './components/icons/MapIcon';
import HistoryIcon from './components/icons/HistoryIcon';
import { generatePdf } from './services/pdfService';

const LIBRARIES: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['geometry'];

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('googleMapsApiKey'));
  const [view, setView] = useState<AppView>(AppView.TRACKING);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries: LIBRARIES,
    preventGoogleFontsLoading: true,
    // FIX: Removed invalid 'disabled' property.
  });

  const {
    status,
    locationHistory,
    stats,
    startTracking,
    stopTracking,
    resetTracking,
  } = useGpsTracking();

  const savedSessions = useLiveQuery(() => db.savedSessions.orderBy('endTime').reverse().toArray(), []);

  const handleSave = useCallback(() => {
    if (locationHistory.length > 1) {
      setModalOpen(true);
    } else {
      alert('Not enough tracking data to save.');
    }
  }, [locationHistory]);
  
  const handleExport = useCallback(async (session: TrackingSession) => {
    if (!session || session.locationHistory.length < 2) {
      alert("Not enough data to generate a PDF.");
      return;
    }
    await generatePdf(session);
  }, []);

  const confirmSaveSession = async (name: string) => {
    const sessionToSave: TrackingSession = {
      name: name,
      startTime: locationHistory[0]?.timestamp || Date.now(),
      endTime: locationHistory[locationHistory.length - 1]?.timestamp || Date.now(),
      locationHistory,
      stats,
    };
    await db.savedSessions.add(sessionToSave);
    resetTracking();
    setModalOpen(false);
    setView(AppView.HISTORY);
  };

  const handleSelectSession = (session: SavedSession) => {
    setSelectedSession(session);
    setView(AppView.TRACKING);
  };

  const handleClearSelectedSession = () => {
    setSelectedSession(null);
  };
  
  if (!apiKey) {
    return <ApiKeyManager setApiKey={setApiKey} />;
  }

  const sessionToDisplay = selectedSession || { locationHistory, stats };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-sans">
      {isModalOpen && (
        <SessionModal
          onClose={() => setModalOpen(false)}
          onSave={confirmSaveSession}
          initialPoint={locationHistory[0]}
        />
      )}
      
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <div className={`flex-grow relative transition-transform duration-300 ease-in-out ${view === AppView.HISTORY ? 'max-md:-translate-x-full' : ''}`}>
          <div id="map-container" className="h-full w-full">
            {status === TrackingStatus.PERMISSION_DENIED && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-10">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center shadow-lg max-w-sm">
                  <h3 className="text-xl font-bold mb-2">Location Permission Denied</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    To enable tracking, please go to your browser's settings and grant this site access to your location.
                  </p>
                </div>
              </div>
            )}
            {isLoaded ? (
              <MapView
                path={sessionToDisplay.locationHistory}
                status={status}
              />
            ) : loadError ? (
              <div className="flex items-center justify-center h-full bg-red-100 text-red-700">Error loading maps. Check API Key and console.</div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">Loading Maps...</div>
            )}
          </div>
          
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <h1 className="text-2xl font-bold text-white text-center drop-shadow-lg">
              {selectedSession ? selectedSession.name : 'GPS Tracker'}
            </h1>
          </div>

          <div className="absolute bottom-20 md:bottom-4 left-4 right-4 grid grid-cols-2 md:grid-cols-4 gap-3">
             <StatCard label="Distance" value={`${sessionToDisplay.stats.distance.toFixed(2)} km`} />
             <StatCard label="Avg Speed" value={`${sessionToDisplay.stats.avgSpeed.toFixed(1)} km/h`} />
             <StatCard label="Area" value={`${sessionToDisplay.stats.area.toFixed(2)} m²`} />
             <StatCard label="Max Speed" value={`${sessionToDisplay.stats.maxSpeed.toFixed(1)} km/h`} />
          </div>
          
           <TrackingControls
            status={status}
            onStart={startTracking}
            onStop={stopTracking}
            onSave={handleSave}
            onExport={() => handleExport({ name: "Current Session", startTime: Date.now(), endTime: Date.now(), ...sessionToDisplay })}
            isViewingHistory={!!selectedSession}
            onBackToLive={handleClearSelectedSession}
          />
        </div>
        
        <div className={`w-full md:w-96 flex-shrink-0 bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out absolute md:static top-0 bottom-0 right-0 h-full ${view === AppView.TRACKING ? 'max-md:translate-x-full' : ''}`}>
            <SessionList
                sessions={savedSessions || []}
                onSelectSession={handleSelectSession}
                onExport={handleExport}
            />
        </div>

      </main>

      <nav className="flex md:hidden justify-around items-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-2">
        <button onClick={() => setView(AppView.TRACKING)} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${view === AppView.TRACKING ? 'text-blue-500' : 'text-gray-500'}`}>
          <MapIcon />
          <span className="text-xs">Tracking</span>
        </button>
        <button onClick={() => setView(AppView.HISTORY)} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${view === AppView.HISTORY ? 'text-blue-500' : 'text-gray-500'}`}>
          <HistoryIcon />
          <span className="text-xs">History</span>
        </button>
      </nav>
    </div>
  );
}