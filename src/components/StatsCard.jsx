import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatsCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className={`p-4 rounded-none border transition-all duration-300 hover:translate-y-[-2px] cursor-pointer ${color}`}>
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-5 h-5" />
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          <TrendingUp className="w-3 h-3" />
          <span>{trend}</span>
        </div>
      )}
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-sm opacity-80">{label}</div>
  </div>
);

export default StatsCard;
