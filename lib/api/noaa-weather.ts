/**
 * NOAA Weather API Integration
 * Provides real-time weather observations, forecasts, and alerts
 * API Documentation: https://www.weather.gov/documentation/services-web-api
 */

export interface WeatherAlert {
  id: string;
  event: string; // e.g., "Tornado Warning", "Severe Thunderstorm Warning"
  headline: string;
  description: string;
  severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
  urgency: "Immediate" | "Expected" | "Future" | "Past" | "Unknown";
  certainty: "Observed" | "Likely" | "Possible" | "Unlikely" | "Unknown";
  onset: string; // ISO 8601 datetime
  expires: string; // ISO 8601 datetime
  areaDesc: string;
  instruction?: string;
}

export interface WeatherObservation {
  timestamp: string;
  temperature: number; // Celsius
  dewpoint: number; // Celsius
  windSpeed: number; // km/h
  windDirection: number; // degrees
  windGust?: number; // km/h
  barometricPressure: number; // Pa
  visibility: number; // meters
  relativeHumidity: number; // percentage
  heatIndex?: number; // Celsius
  windChill?: number; // Celsius
  precipitationLastHour?: number; // mm
  cloudLayers?: Array<{
    base: number; // meters
    amount: string; // e.g., "FEW", "SCT", "BKN", "OVC"
  }>;
}

export interface WeatherForecast {
  name: string; // e.g., "Tonight", "Wednesday"
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
  probabilityOfPrecipitation?: number;
}

/**
 * Get active weather alerts for a specific point (lat/lon)
 */
export async function getWeatherAlerts(
  latitude: number,
  longitude: number
): Promise<WeatherAlert[]> {
  try {
    const response = await fetch(
      `https://api.weather.gov/alerts/active?point=${latitude},${longitude}`,
      {
        headers: {
          "User-Agent": "(AgriClime Sentinel, contact@agriclime.com)",
        },
      }
    );

    if (!response.ok) {
      console.error("NOAA alerts API error:", response.status);
      return [];
    }

    const data = await response.json();

    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.features?.map((feature: Record<string, any>) => ({
        id: feature.id,
        event: feature.properties.event,
        headline: feature.properties.headline,
        description: feature.properties.description,
        severity: feature.properties.severity,
        urgency: feature.properties.urgency,
        certainty: feature.properties.certainty,
        onset: feature.properties.onset,
        expires: feature.properties.expires,
        areaDesc: feature.properties.areaDesc,
        instruction: feature.properties.instruction,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching weather alerts:", error);
    return [];
  }
}

/**
 * Get weather alerts for a county by FIPS code
 */
export async function getCountyWeatherAlerts(
  stateFips: string,
  countyFips: string
): Promise<WeatherAlert[]> {
  try {
    // NOAA uses state and county codes in format: state,county (e.g., "06,037" for Los Angeles)
    const response = await fetch(
      `https://api.weather.gov/alerts/active?area=${stateFips}${countyFips}`,
      {
        headers: {
          "User-Agent": "(AgriClime Sentinel, contact@agriclime.com)",
        },
      }
    );

    if (!response.ok) {
      console.error("NOAA county alerts API error:", response.status);
      return [];
    }

    const data = await response.json();

    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.features?.map((feature: Record<string, any>) => ({
        id: feature.id,
        event: feature.properties.event,
        headline: feature.properties.headline,
        description: feature.properties.description,
        severity: feature.properties.severity,
        urgency: feature.properties.urgency,
        certainty: feature.properties.certainty,
        onset: feature.properties.onset,
        expires: feature.properties.expires,
        areaDesc: feature.properties.areaDesc,
        instruction: feature.properties.instruction,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching county weather alerts:", error);
    return [];
  }
}

/**
 * Get current weather observation for a point
 */
export async function getCurrentWeather(
  latitude: number,
  longitude: number
): Promise<WeatherObservation | null> {
  try {
    // First, get the grid point
    const pointResponse = await fetch(
      `https://api.weather.gov/points/${latitude},${longitude}`,
      {
        headers: {
          "User-Agent": "(AgriClime Sentinel, contact@agriclime.com)",
        },
      }
    );

    if (!pointResponse.ok) {
      console.error("NOAA points API error:", pointResponse.status);
      return null;
    }

    const pointData = await pointResponse.json();
    const observationStationsUrl = pointData.properties.observationStations;

    // Get the nearest observation station
    const stationsResponse = await fetch(observationStationsUrl, {
      headers: {
        "User-Agent": "(AgriClime Sentinel, contact@agriclime.com)",
      },
    });

    if (!stationsResponse.ok) {
      console.error("NOAA stations API error:", stationsResponse.status);
      return null;
    }

    const stationsData = await stationsResponse.json();
    const stationId = stationsData.features?.[0]?.properties?.stationIdentifier;

    if (!stationId) {
      console.error("No observation station found");
      return null;
    }

    // Get latest observation from the station
    const obsResponse = await fetch(
      `https://api.weather.gov/stations/${stationId}/observations/latest`,
      {
        headers: {
          "User-Agent": "(AgriClime Sentinel, contact@agriclime.com)",
        },
      }
    );

    if (!obsResponse.ok) {
      console.error("NOAA observation API error:", obsResponse.status);
      return null;
    }

    const obsData = await obsResponse.json();
    const props = obsData.properties;

    return {
      timestamp: props.timestamp,
      temperature: props.temperature?.value || 0,
      dewpoint: props.dewpoint?.value || 0,
      windSpeed: props.windSpeed?.value || 0,
      windDirection: props.windDirection?.value || 0,
      windGust: props.windGust?.value,
      barometricPressure: props.barometricPressure?.value || 0,
      visibility: props.visibility?.value || 0,
      relativeHumidity: props.relativeHumidity?.value || 0,
      heatIndex: props.heatIndex?.value,
      windChill: props.windChill?.value,
      precipitationLastHour: props.precipitationLastHour?.value,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cloudLayers: props.cloudLayers?.map((layer: Record<string, any>) => ({
        base: layer.base?.value || 0,
        amount: layer.amount,
      })),
    };
  } catch (error) {
    console.error("Error fetching current weather:", error);
    return null;
  }
}

/**
 * Get 7-day weather forecast for a point
 */
export async function getWeatherForecast(
  latitude: number,
  longitude: number
): Promise<WeatherForecast[]> {
  try {
    // First, get the grid point
    const pointResponse = await fetch(
      `https://api.weather.gov/points/${latitude},${longitude}`,
      {
        headers: {
          "User-Agent": "(AgriClime Sentinel, contact@agriclime.com)",
        },
      }
    );

    if (!pointResponse.ok) {
      console.error("NOAA points API error:", pointResponse.status);
      return [];
    }

    const pointData = await pointResponse.json();
    const forecastUrl = pointData.properties.forecast;

    // Get the forecast
    const forecastResponse = await fetch(forecastUrl, {
      headers: {
        "User-Agent": "(AgriClime Sentinel, contact@agriclime.com)",
      },
    });

    if (!forecastResponse.ok) {
      console.error("NOAA forecast API error:", forecastResponse.status);
      return [];
    }

    const forecastData = await forecastResponse.json();

    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      forecastData.properties.periods?.map((period: Record<string, any>) => ({
        name: period.name,
        startTime: period.startTime,
        endTime: period.endTime,
        isDaytime: period.isDaytime,
        temperature: period.temperature,
        temperatureUnit: period.temperatureUnit,
        windSpeed: period.windSpeed,
        windDirection: period.windDirection,
        shortForecast: period.shortForecast,
        detailedForecast: period.detailedForecast,
        probabilityOfPrecipitation: period.probabilityOfPrecipitation?.value,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    return [];
  }
}

/**
 * Get all active weather alerts for the entire U.S.
 */
export async function getAllActiveAlerts(): Promise<WeatherAlert[]> {
  try {
    const response = await fetch("https://api.weather.gov/alerts/active", {
      headers: {
        "User-Agent": "(AgriClime Sentinel, contact@agriclime.com)",
      },
    });

    if (!response.ok) {
      console.error("NOAA all alerts API error:", response.status);
      return [];
    }

    const data = await response.json();

    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.features?.map((feature: Record<string, any>) => ({
        id: feature.id,
        event: feature.properties.event,
        headline: feature.properties.headline,
        description: feature.properties.description,
        severity: feature.properties.severity,
        urgency: feature.properties.urgency,
        certainty: feature.properties.certainty,
        onset: feature.properties.onset,
        expires: feature.properties.expires,
        areaDesc: feature.properties.areaDesc,
        instruction: feature.properties.instruction,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching all active alerts:", error);
    return [];
  }
}
