
import React, { useState, useEffect } from 'react';
import { LocationPoint } from '../types';
import { reverseGeocode } from '../services/geoService';

interface SessionModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
  initialPoint?: LocationPoint;
}

const SessionModal: React.FC<SessionModalProps> = ({ onClose, onSave, initialPoint }) => {
  const [sessionName, setSessionName] = useState('');
  const [isLoadingName, setIsLoadingName] = useState(true);

  useEffect(() => {
    const fetchLocationName = async () => {
      setIsLoadingName(true);
      if (initialPoint) {
        try {
          const name = await reverseGeocode({ lat: initialPoint.lat, lng: initialPoint.lng });
          setSessionName(`Trip near ${name}`);
        } catch (error) {
          console.error("Failed to reverse geocode:", error);
          setSessionName(`Session - ${new Date().toLocaleString()}`);
        }
      } else {
         setSessionName(`Session - ${new Date().toLocaleString()}`);
      }
      setIsLoadingName(false);
    };
    fetchLocationName();
  }, [initialPoint]);

  const handleSave = () => {
    if (sessionName.trim()) {
      onSave(sessionName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Save Session</h2>
        <div>
          <label htmlFor="sessionName" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Session Name
          </label>
          <input
            type="text"
            id="sessionName"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder={isLoadingName ? "Fetching location..." : "Enter session name"}
            disabled={isLoadingName}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 disabled:opacity-50"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoadingName || !sessionName.trim()}
            className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoadingName ? 'Loading...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;
