"use client";

import { useEffect, useRef } from "react";
import { Info } from "lucide-react";

interface SoundingData {
  pressure: number[]; // hPa
  temperature: number[]; // °C
  dewpoint: number[]; // °C
  height: number[]; // meters
  windSpeed?: number[]; // knots
  windDirection?: number[]; // degrees
}

interface SkewTDiagramProps {
  soundingData: SoundingData | null;
  location: string;
}

/**
 * Skew-T Log-P Diagram Component
 * 
 * Professional atmospheric science visualization showing:
 * - Temperature and dewpoint profiles
 * - Pressure levels (logarithmic scale)
 * - Atmospheric stability indicators
 * 
 * This is a simplified implementation for demonstration.
 * A full implementation would use D3.js or specialized libraries.
 */
export default function SkewTDiagram({
  soundingData,
  location,
}: SkewTDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !soundingData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, width, height);

    // Margins
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Pressure range (logarithmic)
    const minPressure = 100; // hPa (top of diagram)
    const maxPressure = 1050; // hPa (bottom of diagram)

    // Temperature range
    const minTemp = -40; // °C
    const maxTemp = 40; // °C

    // Scale functions
    const pressureToY = (p: number) => {
      const logP = Math.log(p);
      const logMin = Math.log(minPressure);
      const logMax = Math.log(maxPressure);
      return margin.top + ((logP - logMin) / (logMax - logMin)) * plotHeight;
    };

    const tempToX = (t: number, p: number) => {
      // Skew-T: temperature lines are skewed
      const skewFactor = 0.5; // Adjust skew angle
      const normalizedT = (t - minTemp) / (maxTemp - minTemp);
      const normalizedP = (Math.log(p) - Math.log(minPressure)) / (Math.log(maxPressure) - Math.log(minPressure));
      return margin.left + normalizedT * plotWidth + normalizedP * plotWidth * skewFactor;
    };

    // Draw grid - Pressure lines (horizontal)
    ctx.strokeStyle = "#d0d0d0";
    ctx.lineWidth = 1;
    const pressureLevels = [1000, 850, 700, 500, 300, 200, 100];
    pressureLevels.forEach((p) => {
      const y = pressureToY(p);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();

      // Label
      ctx.fillStyle = "#666";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${p} hPa`, margin.left - 5, y + 4);
    });

    // Draw grid - Temperature lines (skewed)
    const tempLines = [-40, -30, -20, -10, 0, 10, 20, 30, 40];
    tempLines.forEach((t) => {
      ctx.strokeStyle = "#e0e0e0";
      ctx.beginPath();
      ctx.moveTo(tempToX(t, maxPressure), pressureToY(maxPressure));
      ctx.lineTo(tempToX(t, minPressure), pressureToY(minPressure));
      ctx.stroke();

      // Label at bottom
      ctx.fillStyle = "#666";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${t}°C`, tempToX(t, maxPressure), height - margin.bottom + 20);
    });

    // Draw temperature profile
    if (soundingData.temperature && soundingData.pressure) {
      ctx.strokeStyle = "#DC2626"; // Red
      ctx.lineWidth = 3;
      ctx.beginPath();
      soundingData.temperature.forEach((temp, i) => {
        const pressure = soundingData.pressure[i];
        const x = tempToX(temp, pressure);
        const y = pressureToY(pressure);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw dewpoint profile
    if (soundingData.dewpoint && soundingData.pressure) {
      ctx.strokeStyle = "#16A34A"; // Green
      ctx.lineWidth = 3;
      ctx.beginPath();
      soundingData.dewpoint.forEach((dewpoint, i) => {
        const pressure = soundingData.pressure[i];
        const x = tempToX(dewpoint, pressure);
        const y = pressureToY(pressure);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Title
    ctx.fillStyle = "#1F2937";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Skew-T Log-P Diagram - ${location}`, width / 2, 25);

    // Legend
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    
    ctx.fillStyle = "#DC2626";
    ctx.fillRect(margin.left, height - 35, 20, 3);
    ctx.fillStyle = "#1F2937";
    ctx.fillText("Temperature", margin.left + 25, height - 30);

    ctx.fillStyle = "#16A34A";
    ctx.fillRect(margin.left + 120, height - 35, 20, 3);
    ctx.fillStyle = "#1F2937";
    ctx.fillText("Dewpoint", margin.left + 145, height - 30);

  }, [soundingData, location]);

  if (!soundingData) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-8 text-center">
        <Info className="mx-auto mb-3 text-gray-400" size={48} />
        <h4 className="text-xl font-bold text-gray-700 mb-2">
          No Sounding Data Available
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          Atmospheric sounding data is not currently available for this location.
        </p>
        <p className="text-xs text-gray-500">
          Skew-T diagrams require vertical atmospheric profile data from weather balloons or model soundings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto"
          style={{ maxWidth: "100%" }}
        />
      </div>

      {/* Educational Info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
        <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Info size={16} />
          About Skew-T Log-P Diagrams
        </h4>
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>Skew-T Log-P diagrams</strong> are the standard tool used by meteorologists to analyze atmospheric stability and forecast severe weather. 
          The diagram shows vertical profiles of temperature (red) and dewpoint (green) plotted against pressure (logarithmic scale). 
          The closer the temperature and dewpoint lines, the higher the relative humidity at that level.
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-800">
          <div>
            <strong>Key Features:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Pressure decreases logarithmically upward</li>
              <li>Temperature lines are skewed 45°</li>
              <li>Used for stability analysis</li>
            </ul>
          </div>
          <div>
            <strong>Applications:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Severe weather forecasting</li>
              <li>Aviation weather briefings</li>
              <li>Research meteorology</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Source */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-3">
        <p className="text-xs text-green-900">
          <strong>📊 Data Source:</strong> Atmospheric sounding data from NOAA HRRR model. 
          Professional meteorologists use this data for operational weather forecasting and severe weather analysis.
        </p>
      </div>
    </div>
  );
}

