// src/components/stock/PeriodRangeSlider.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PeriodRangeSliderProps {
  periods: string[]; // e.g., ['2020', '2021', ..., '2020-Q1', '2020-Q2', ...]
  selectedStart: string;
  selectedEnd: string;
  onRangeChange: (start: string, end: string) => void;
  isQuarterly: boolean; // New prop to indicate if the periods are quarters
}

const PeriodRangeSlider: React.FC<PeriodRangeSliderProps> = ({
  periods,
  selectedStart,
  selectedEnd,
  onRangeChange,
  isQuarterly, // Destructure the new prop
}) => {
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(periods.length > 0 ? periods.length - 1 : 0);
  const rangeRef = useRef<HTMLDivElement>(null);

  // Convert selectedStart/End periods to their indices in the periods array
  useEffect(() => {
    const startIndex = periods.indexOf(selectedStart);
    const endIndex = periods.indexOf(selectedEnd);
    if (startIndex !== -1 && endIndex !== -1) {
      setMinVal(startIndex);
      setMaxVal(endIndex);
    }
  }, [periods, selectedStart, selectedEnd]);

  const getPercent = useCallback(
    (value: number) => {
      if (periods.length === 0) return 0;
      return (value / (periods.length - 1)) * 100;
    },
    [periods],
  );

  useEffect(() => {
    if (rangeRef.current && periods.length > 0) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(maxVal);

      rangeRef.current.style.left = `${minPercent}%`;
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, maxVal, getPercent, periods.length]);

  const handleMinChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.min(Number(event.target.value), maxVal);
      setMinVal(value);
      onRangeChange(periods[value], periods[maxVal]);
    },
    [maxVal, periods, onRangeChange],
  );

  const handleMaxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(Number(event.target.value), minVal);
      setMaxVal(value);
      onRangeChange(periods[minVal], periods[value]);
    },
    [minVal, periods, onRangeChange],
  );

  const handlePeriodClick = (index: number) => {
    // If clicking on a period outside the current range, extend the range to include it.
    // Otherwise, if clicking inside the range, make it a single-period selection.
    if (index < minVal) {
      setMinVal(index);
      onRangeChange(periods[index], periods[maxVal]);
    } else if (index > maxVal) {
      setMaxVal(index);
      onRangeChange(periods[minVal], periods[index]);
    } else if (index === minVal && index === maxVal) {
      // If currently a single selection, clicking it again could perhaps do nothing or reset to full range
      // For now, let's keep it simple: no change if already a single selection
    } else {
      // If clicking within a multi-period range, select only that period
      setMinVal(index);
      setMaxVal(index);
      onRangeChange(periods[index], periods[index]);
    }
  };


  if (periods.length === 0) {
    return <div className="text-center p-4 text-gray-500">No periods available for slider.</div>;
  }

  return (
    <div className="relative w-full py-4"> {/* Removed max-w-lg and mx-auto */}
      <div className="relative h-2 bg-gray-200 rounded-full my-2">
        <div ref={rangeRef} className="absolute h-full bg-blue-500 rounded-full z-10"></div>
        
        {/* Render input ranges as draggable handles */}
        <input
          type="range"
          min="0"
          max={periods.length - 1}
          value={minVal}
          onChange={handleMinChange}
          className="absolute w-full h-4 bg-transparent appearance-none pointer-events-none z-20 slider-thumb"
          style={{ top: '-1px' }} // Position them visually on the track
        />
        <input
          type="range"
          min="0"
          max={periods.length - 1}
          value={maxVal}
          onChange={handleMaxChange}
          className="absolute w-full h-4 bg-transparent appearance-none pointer-events-none z-20 slider-thumb"
          style={{ top: '-1px' }} // Position them visually on the track
        />

        {/* New: Clickable circles for each period on the line */}
        {periods.map((period, index) => (
          <div
            key={`circle-${period}`}
            className="absolute -translate-x-1/2 -translate-y-1/2" // Center the circle
            style={{ top: '50%', left: `${getPercent(index)}%` }} // Position horizontally and vertically
          >
            <div
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-200 ease-in-out ${
                index >= minVal && index <= maxVal ? 'bg-blue-600 border-2 border-white shadow-md' : 'bg-gray-400 border border-gray-300'
              }`}
              onClick={() => handlePeriodClick(index)} // Make the circle clickable
              title={period} // Show period on hover
            ></div>
          </div>
        ))}

        {/* Custom styling for the range input thumbs */}
        <style>{`
          .slider-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            pointer-events: all;
            width: 16px;
            height: 16px;
            background-color: #2563EB;
            border-radius: 50%;
            border: 2px solid #fff;
            cursor: grab;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.3);
          }
          .slider-thumb::-moz-range-thumb {
            pointer-events: all;
            width: 16px;
            height: 16px;
            background-color: #2563EB;
            border-radius: 50%;
            border: 2px solid #fff;
            cursor: grab;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.3);
          }
        `}</style>
      </div>

      <div className="flex justify-between mt-2">
        {periods.map((period, index) => (
          <button
            key={period}
            onClick={() => handlePeriodClick(index)}
            className={`text-xs px-1 py-0.5 rounded ${
              index >= minVal && index <= maxVal
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isQuarterly ? (index % 5 === 0 ? period : '') : period}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeriodRangeSlider;