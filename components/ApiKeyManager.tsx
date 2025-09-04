
import React, { useState } from 'react';

interface ApiKeyManagerProps {
  setApiKey: (key: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ setApiKey }) => {
  const [keyInput, setKeyInput] = useState('');

  const handleSaveKey = () => {
    if (keyInput.trim()) {
      localStorage.setItem('googleMapsApiKey', keyInput.trim());
      setApiKey(keyInput.trim());
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-800 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-bold">Google Maps API Key</h1>
        <p className="text-gray-400">
          To use this application, you need to provide a Google Maps JavaScript API key.
          Ensure the 'Maps JavaScript API' and 'Geolocation API' are enabled.
        </p>
        <input
          type="text"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Enter your API key here"
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSaveKey}
          className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors duration-200"
        >
          Save and Continue
        </button>
      </div>
    </div>
  );
};

export default ApiKeyManager;
