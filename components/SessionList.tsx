import React from 'react';
// FIX: TrackingSession is not exported from '../services/db', so it is imported from its source file '../types' instead.
import { SavedSession } from '../services/db';
import { TrackingSession } from '../types';
import DownloadIcon from './icons/DownloadIcon';

interface SessionListProps {
  sessions: SavedSession[];
  onSelectSession: (session: SavedSession) => void;
  onExport: (session: TrackingSession) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, onSelectSession, onExport }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-xl font-bold">Session History</h2>
      </header>
      <div className="flex-grow overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No saved sessions yet. Start tracking and save a session to see it here.
          </div>
        ) : (
          <ul>
            {sessions.map((session) => (
              <li key={session.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div 
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors duration-150 flex justify-between items-center"
                  onClick={() => onSelectSession(session)}
                >
                  <div>
                    <h3 className="font-semibold text-lg">{session.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(session.endTime)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {session.stats.distance.toFixed(2)} km
                    </p>
                  </div>
                   <button 
                      onClick={(e) => { e.stopPropagation(); onExport(session); }} 
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="Export to PDF"
                    >
                      <DownloadIcon />
                    </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SessionList;