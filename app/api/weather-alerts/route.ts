import { NextRequest, NextResponse } from 'next/server';
import { getWeatherAlerts, getCountyWeatherAlerts, getAllActiveAlerts } from '@/lib/api/noaa-weather';

/**
 * GET /api/weather-alerts
 * 
 * Query parameters:
 * - lat: Latitude (optional)
 * - lon: Longitude (optional)
 * - fips: County FIPS code (optional, format: "01001")
 * - all: Get all active alerts (optional, set to "true")
 * 
 * Returns active weather alerts from NOAA
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const fips = searchParams.get('fips');
    const all = searchParams.get('all');

    // Get all active alerts
    if (all === 'true') {
      const alerts = await getAllActiveAlerts();
      return NextResponse.json({
        success: true,
        count: alerts.length,
        alerts,
      });
    }

    // Get alerts by FIPS code
    if (fips) {
      const stateFips = fips.substring(0, 2);
      const countyFips = fips.substring(2, 5);
      const alerts = await getCountyWeatherAlerts(stateFips, countyFips);
      
      return NextResponse.json({
        success: true,
        fips,
        count: alerts.length,
        alerts,
      });
    }

    // Get alerts by lat/lon
    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: 'Invalid latitude or longitude' },
          { status: 400 }
        );
      }

      const alerts = await getWeatherAlerts(latitude, longitude);
      
      return NextResponse.json({
        success: true,
        location: { latitude, longitude },
        count: alerts.length,
        alerts,
      });
    }

    return NextResponse.json(
      { error: 'Please provide either lat/lon, fips, or all=true' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in weather alerts API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather alerts' },
      { status: 500 }
    );
  }
}

