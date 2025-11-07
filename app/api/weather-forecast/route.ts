import { NextRequest, NextResponse } from "next/server";
import { getWeatherForecast } from "@/lib/api/noaa-weather";
import {
  rateLimit,
  RateLimitPresets,
  createRateLimitResponse,
  addRateLimitHeaders,
} from "@/lib/middleware/rate-limit";

/**
 * GET /api/weather-forecast
 *
 * Query parameters:
 * - lat: Latitude (required)
 * - lon: Longitude (required)
 *
 * Returns 7-day weather forecast from NOAA NWS API
 *
 * Rate limit: 60 requests per minute
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const limiter = rateLimit(RateLimitPresets.standard);
  const rateLimitResult = limiter(request);

  if (!rateLimitResult.isAllowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");

    if (!latStr || !lonStr) {
      return NextResponse.json(
        { error: "Please provide both lat and lon parameters" },
        { status: 400 }
      );
    }

    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lonStr);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude" },
        { status: 400 }
      );
    }

    const forecast = await getWeatherForecast(latitude, longitude);

    const response = NextResponse.json({
      success: true,
      location: { latitude, longitude },
      forecast,
      count: forecast.length,
    });

    return addRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather forecast" },
      { status: 500 }
    );
  }
}

