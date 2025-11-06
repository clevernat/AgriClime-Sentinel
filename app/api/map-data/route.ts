import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentDroughtStatus,
  get30DayPrecipitation,
  getAllTemperatureAnomalies,
  getAllCropRiskIndices,
  getAllSoilMoisture,
} from "@/lib/api/climate-data";
import { MapDataLayer } from "@/types";

// In-memory caches for different data layers
// Cache expires after specified duration (data doesn't change frequently)
let precipitationCache: {
  data: unknown[];
  timestamp: number;
} | null = null;

let droughtCache: {
  data: unknown[];
  timestamp: number;
} | null = null;

let temperatureCache: {
  data: unknown[];
  timestamp: number;
} | null = null;

let soilMoistureCache: {
  data: unknown[];
  timestamp: number;
} | null = null;

let cropRiskCache: {
  data: unknown[];
  timestamp: number;
  cropType: string;
} | null = null;

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const TEMP_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for temperature anomalies
const CROP_CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours for crop risk

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const layer = searchParams.get("layer") as MapDataLayer;
  const cropType = searchParams.get("cropType");
  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  try {
    let data;
    const now = Date.now();

    switch (layer) {
      case "drought":
        // Check cache first
        if (droughtCache && now - droughtCache.timestamp < CACHE_DURATION) {
          data = droughtCache.data;
        } else {
          // Fetch fresh data
          data = await getCurrentDroughtStatus();
          // Update cache
          droughtCache = {
            data: data as unknown[],
            timestamp: now,
          };
        }
        break;

      case "precipitation_30day":
        // Check cache first
        if (
          precipitationCache &&
          now - precipitationCache.timestamp < CACHE_DURATION
        ) {
          data = precipitationCache.data;
        } else {
          // Fetch fresh data
          data = await get30DayPrecipitation();
          // Update cache
          precipitationCache = {
            data: data as unknown[],
            timestamp: now,
          };
        }
        break;

      case "temperature_anomaly":
        // Check cache first
        if (
          temperatureCache &&
          now - temperatureCache.timestamp < TEMP_CACHE_DURATION
        ) {
          data = temperatureCache.data;
        } else {
          // Fetch fresh data
          data = await getAllTemperatureAnomalies(date);
          // Update cache
          temperatureCache = {
            data: data as unknown[],
            timestamp: now,
          };
        }
        break;

      case "crop_risk":
        if (!cropType) {
          return NextResponse.json(
            { error: "cropType parameter required for crop_risk layer" },
            { status: 400 }
          );
        }
        // Check cache first (also check if crop type matches)
        if (
          cropRiskCache &&
          cropRiskCache.cropType === cropType &&
          now - cropRiskCache.timestamp < CROP_CACHE_DURATION
        ) {
          data = cropRiskCache.data;
        } else {
          // Fetch fresh data
          data = await getAllCropRiskIndices(cropType, date);
          // Update cache
          cropRiskCache = {
            data: data as unknown[],
            timestamp: now,
            cropType,
          };
        }
        break;

      case "soil_moisture":
        // Check cache first
        if (
          soilMoistureCache &&
          now - soilMoistureCache.timestamp < CACHE_DURATION
        ) {
          data = soilMoistureCache.data;
        } else {
          // Fetch fresh data
          data = await getAllSoilMoisture();
          // Update cache
          soilMoistureCache = {
            data: data as unknown[],
            timestamp: now,
          };
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid layer type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      layer,
      date,
      data,
    });
  } catch (error) {
    console.error("Error in map-data API:", error);
    return NextResponse.json(
      { error: "Failed to fetch map data" },
      { status: 500 }
    );
  }
}
