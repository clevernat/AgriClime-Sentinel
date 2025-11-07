"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Calendar } from "lucide-react";

interface TimeSliderProps {
  startYear: number;
  endYear: number;
  currentYear: number;
  onYearChange: (year: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  playbackSpeed?: number; // milliseconds per year
}

export default function TimeSlider({
  startYear,
  endYear,
  currentYear,
  onYearChange,
  isPlaying,
  onPlayPause,
  playbackSpeed = 1000,
}: TimeSliderProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        const now = Date.now();
        const elapsed = now - lastUpdateRef.current;

        if (elapsed >= playbackSpeed) {
          lastUpdateRef.current = now;
          
          if (currentYear < endYear) {
            onYearChange(currentYear + 1);
          } else {
            // Loop back to start
            onYearChange(startYear);
          }
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isPlaying, currentYear, startYear, endYear, playbackSpeed, onYearChange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onYearChange(parseInt(e.target.value));
  };

  const handleStepBack = () => {
    if (currentYear > startYear) {
      onYearChange(currentYear - 1);
    }
  };

  const handleStepForward = () => {
    if (currentYear < endYear) {
      onYearChange(currentYear + 1);
    }
  };

  const handleJumpToYear = (year: number) => {
    onYearChange(year);
    setShowDatePicker(false);
  };

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-gray-300">
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={onPlayPause}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex-shrink-0"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        {/* Step Back */}
        <button
          onClick={handleStepBack}
          disabled={currentYear <= startYear}
          className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Previous year"
        >
          <SkipBack size={16} />
        </button>

        {/* Year Display */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="px-4 py-2 bg-gray-100 rounded-lg font-bold text-lg text-gray-800 hover:bg-gray-200 transition-colors flex items-center gap-2"
            title="Select year"
          >
            <Calendar size={18} />
            {currentYear}
          </button>

          {/* Year Picker Dropdown */}
          {showDatePicker && (
            <div className="absolute top-full mt-2 left-0 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
              <div className="p-2 grid grid-cols-5 gap-1">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleJumpToYear(year)}
                    className={`px-3 py-2 rounded text-sm font-semibold transition-colors ${
                      year === currentYear
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step Forward */}
        <button
          onClick={handleStepForward}
          disabled={currentYear >= endYear}
          className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Next year"
        >
          <SkipForward size={16} />
        </button>

        {/* Slider */}
        <div className="flex-1 px-2">
          <input
            type="range"
            min={startYear}
            max={endYear}
            value={currentYear}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                ((currentYear - startYear) / (endYear - startYear)) * 100
              }%, #E5E7EB ${
                ((currentYear - startYear) / (endYear - startYear)) * 100
              }%, #E5E7EB 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{startYear}</span>
            <span>{endYear}</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="text-xs text-gray-600 flex-shrink-0">
          {currentYear - startYear + 1} / {endYear - startYear + 1}
        </div>
      </div>

      {/* Info Text */}
      <div className="mt-3 text-xs text-gray-600 text-center">
        {isPlaying
          ? "Playing historical data animation..."
          : "Use controls to navigate through historical climate data"}
      </div>
    </div>
  );
}

