/**
 * 進度條組件
 */

import React from "react";

interface ProgressProps {
  value: number; // 0-100 的進度值
  className?: string;
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className = "",
  showLabel = false,
}) => {
  // 確保 value 在 0-100 範圍內
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-sm text-gray-600 text-center mt-1">
          {clampedValue}%
        </div>
      )}
    </div>
  );
};
