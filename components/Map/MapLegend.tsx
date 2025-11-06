"use client";

import { MapDataLayer } from "@/types";
import { MAP_LAYERS, DROUGHT_LEVELS } from "@/lib/constants";

interface MapLegendProps {
  layer: MapDataLayer;
}

export default function MapLegend({ layer }: MapLegendProps) {
  const config = MAP_LAYERS[layer];

  const renderDroughtLegend = () => (
    <div className="space-y-1">
      {Object.values(DROUGHT_LEVELS).map((level) => (
        <div key={level.level} className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="w-5 h-3 sm:w-6 sm:h-4 border border-gray-400 flex-shrink-0"
            style={{ backgroundColor: level.color }}
          />
          <span className="text-xs sm:text-sm font-medium text-gray-900">
            {level.label}
          </span>
        </div>
      ))}
    </div>
  );

  const renderGradientLegend = () => {
    const { colorScale, valueRange, unit } = config;
    const [min, max] = valueRange;

    return (
      <div className="space-y-1.5 sm:space-y-2">
        <div
          className="h-5 sm:h-6 rounded border border-gray-400"
          style={{
            background: `linear-gradient(to right, ${colorScale.join(", ")})`,
          }}
        />
        <div className="flex justify-between text-xs font-medium text-gray-900">
          <span>
            {min} {unit}
          </span>
          <span>
            {max} {unit}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg">
      <h3 className="font-bold mb-1.5 sm:mb-2 text-sm sm:text-base text-gray-900">
        {config.name}
      </h3>
      <p className="text-xs text-gray-700 mb-2 sm:mb-3">{config.description}</p>

      {layer === "drought" ? renderDroughtLegend() : renderGradientLegend()}
    </div>
  );
}
