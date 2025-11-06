import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentDroughtStatus,
  get30DayPrecipitation,
  getAllTemperatureAnomalies,
  getAllCropRiskIndices,
} from "@/lib/api/climate-data";
import { MapDataLayer } from "@/types";

// In-memory cache for precipitation data
// Cache expires after 6 hours (precipitation data doesn't change frequently)
let precipitationCache: {
  data: unknown[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const layer = searchParams.get("layer") as MapDataLayer;
  const cropType = searchParams.get("cropType");
  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  try {
    let data;

    switch (layer) {
      case "drought":
        data = await getCurrentDroughtStatus();
        break;

      case "precipitation_30day":
        // Check cache first
        const now = Date.now();
        if (
          precipitationCache &&
          now - precipitationCache.timestamp < CACHE_DURATION
        ) {
          const cacheAge = Math.round(
            (now - precipitationCache.timestamp) / 1000 / 60
          );
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
        data = await getAllTemperatureAnomalies(date);
        break;

      case "crop_risk":
        if (!cropType) {
          return NextResponse.json(
            { error: "cropType parameter required for crop_risk layer" },
            { status: 400 }
          );
        }
        data = await getAllCropRiskIndices(cropType, date);
        break;

      case "soil_moisture":
        // Get current climate data with soil moisture
        data = await getCurrentDroughtStatus();
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
