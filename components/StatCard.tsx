
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <div className="bg-black/60 backdrop-blur-sm p-3 rounded-lg text-white shadow-md text-center">
      <div className="text-sm font-medium text-gray-300 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

export default StatCard;
