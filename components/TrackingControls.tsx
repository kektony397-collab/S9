
import React from 'react';
import { TrackingStatus } from '../types';
import PlayIcon from './icons/PlayIcon';
import StopIcon from './icons/StopIcon';
import SaveIcon from './icons/SaveIcon';
import DownloadIcon from './icons/DownloadIcon';
import MapIcon from './icons/MapIcon';

interface TrackingControlsProps {
  status: TrackingStatus;
  isViewingHistory: boolean;
  onStart: () => void;
  onStop: () => void;
  onSave: () => void;
  onExport: () => void;
  onBackToLive: () => void;
}

const FabButton: React.FC<{ onClick: () => void; className: string; children: React.ReactNode, title: string, disabled?: boolean }> = ({ onClick, className, children, title, disabled }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition transform hover:scale-105 active:scale-95 disabled:bg-gray-500 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

const TrackingControls: React.FC<TrackingControlsProps> = ({ status, isViewingHistory, onStart, onStop, onSave, onExport, onBackToLive }) => {
    if (isViewingHistory) {
        return (
             <div className="absolute bottom-4 right-4 flex flex-col gap-4">
                <FabButton onClick={onExport} className="bg-purple-500 hover:bg-purple-600 focus:ring-purple-400" title="Export Session">
                    <DownloadIcon />
                </FabButton>
                <FabButton onClick={onBackToLive} className="bg-gray-600 hover:bg-gray-700 focus:ring-gray-500" title="Back to Live Tracking">
                    <MapIcon />
                </FabButton>
            </div>
        );
    }
    
    return (
        <div className="absolute bottom-4 right-4 flex flex-col gap-4">
            {status === TrackingStatus.TRACKING && (
                <FabButton onClick={onStop} className="bg-red-500 hover:bg-red-600 focus:ring-red-400" title="Stop Tracking">
                    <StopIcon />
                </FabButton>
            )}
            {status !== TrackingStatus.TRACKING && (
                <FabButton onClick={onStart} className="bg-green-500 hover:bg-green-600 focus:ring-green-400" title="Start Tracking">
                    <PlayIcon />
                </FabButton>
            )}
             <FabButton onClick={onSave} className="bg-blue-500 hover:bg-blue-600 focus:ring-blue-400" title="Save Session" disabled={status === TrackingStatus.TRACKING}>
                <SaveIcon />
            </FabButton>
        </div>
    );
};

export default TrackingControls;