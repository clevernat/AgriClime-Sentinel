import axios from "axios";
import { supabase } from "@/lib/supabase";
import { ClimateData, TemperatureAnomaly, CropYieldRiskIndex } from "@/types";

/**
 * Fetch historical climate data from Open-Meteo API
 */
export async function fetchOpenMeteoData(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
) {
  const params = {
    latitude,
    longitude,
    start_date: startDate,
    end_date: endDate,
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "temperature_2m_mean",
      "precipitation_sum",
      "soil_moisture_0_to_10cm",
    ].join(","),
    timezone: "America/Chicago",
  };

  try {
    const response = await axios.get(
      "https://archive-api.open-meteo.com/v1/archive",
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Open-Meteo data:", error);
    throw error;
  }
}

/**
 * Get current climate data for a county
 */
export async function getCurrentClimateData(
  countyFips: string
): Promise<ClimateData | null> {
  const { data, error } = await supabase
    .from("climate_data")
    .select("*")
    .eq("county_fips", countyFips)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching current climate data:", error);
    return null;
  }

  return data;
}

/**
 * Get climate data for a date range
 */
export async function getClimateDataRange(
  countyFips: string,
  startDate: string,
  endDate: string
): Promise<ClimateData[]> {
  const { data, error } = await supabase
    .from("climate_data")
    .select("*")
    .eq("county_fips", countyFips)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching climate data range:", error);
    return [];
  }

  return data || [];
}

/**
 * Get real drought status for all counties from Open-Meteo API
 * Calculates drought index based on precipitation deficit and soil moisture
 */
export async function getCurrentDroughtStatus() {
  try {
    // Get all counties with their centroids
    const { data: counties, error } = await supabase
      .from("counties")
      .select("fips, name, state, geometry");

    if (error || !counties) {
      console.error("Error fetching counties:", error);
      return [];
    }

    // Calculate date range (last 90 days for drought assessment)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    console.log(
      `Fetching real drought status for ${counties.length} counties from ${startDateStr} to ${endDateStr}`
    );

    // Process counties in batches
    const batchSize = 50;
    const results: Array<{
      fips: string;
      name: string;
      state: string;
      drought_index: number;
      soil_moisture: number;
      precipitation: number;
      date: string;
    }> = [];

    for (let i = 0; i < counties.length; i += batchSize) {
      const batch = counties.slice(i, i + batchSize);

      const batchPromises = batch.map(async (county) => {
        try {
          // Calculate centroid
          const geometry = county.geometry as
            | { coordinates: number[][][] }
            | undefined;
          let latitude = 0;
          let longitude = 0;

          if (geometry && geometry.coordinates) {
            const coords = geometry.coordinates[0];
            if (Array.isArray(coords) && coords.length > 0) {
              const lats = coords.map((c: number[]) => c[1]);
              const lons = coords.map((c: number[]) => c[0]);
              latitude =
                lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
              longitude =
                lons.reduce((a: number, b: number) => a + b, 0) / lons.length;
            }
          }

          if (latitude === 0 || longitude === 0) {
            return null;
          }

          // Fetch climate data from Open-Meteo
          const response = await axios.get(
            "https://archive-api.open-meteo.com/v1/archive",
            {
              params: {
                latitude,
                longitude,
                start_date: startDateStr,
                end_date: endDateStr,
                daily: "precipitation_sum,soil_moisture_0_to_10cm",
                timezone: "America/Chicago",
              },
              timeout: 10000,
            }
          );

          if (
            response.data &&
            response.data.daily &&
            response.data.daily.precipitation_sum &&
            response.data.daily.soil_moisture_0_to_10cm
          ) {
            const precipData = response.data.daily.precipitation_sum;
            const soilData = response.data.daily.soil_moisture_0_to_10cm;

            // Calculate 90-day precipitation total
            const totalPrecip = precipData.reduce(
              (sum: number, val: number | null) => sum + (val || 0),
              0
            );

            // Get average soil moisture (last 30 days)
            const recentSoilMoisture = soilData.slice(-30);
            const avgSoilMoisture =
              recentSoilMoisture.reduce(
                (sum: number, val: number | null) => sum + (val || 0),
                0
              ) / recentSoilMoisture.length;

            // Calculate drought index (0-5)
            // Based on precipitation deficit and soil moisture
            let droughtIndex = 0;
            const avgPrecipPerDay = totalPrecip / 90;

            // Drought classification
            if (avgSoilMoisture < 0.25 || avgPrecipPerDay < 1.0)
              droughtIndex = 1; // D0 - Abnormally Dry
            if (avgSoilMoisture < 0.2 || avgPrecipPerDay < 0.7)
              droughtIndex = 2; // D1 - Moderate Drought
            if (avgSoilMoisture < 0.15 || avgPrecipPerDay < 0.5)
              droughtIndex = 3; // D2 - Severe Drought
            if (avgSoilMoisture < 0.12 || avgPrecipPerDay < 0.3)
              droughtIndex = 4; // D3 - Extreme Drought
            if (avgSoilMoisture < 0.1 || avgPrecipPerDay < 0.2)
              droughtIndex = 5; // D4 - Exceptional Drought

            return {
              fips: county.fips,
              name: county.name,
              state: county.state,
              drought_index: droughtIndex,
              soil_moisture: Math.round(avgSoilMoisture * 100 * 100) / 100,
              precipitation: Math.round(totalPrecip * 100) / 100,
              date: endDateStr,
            };
          }

          return null;
        } catch (error) {
          console.error(
            `Error fetching drought data for county ${county.fips}:`,
            error instanceof Error ? error.message : "Unknown error"
          );
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(
        (r): r is NonNullable<typeof r> => r !== null
      );
      results.push(...validResults);

      console.log(
        `✓ Processed ${Math.min(i + batchSize, counties.length)}/${
          counties.length
        } counties`
      );

      // Delay between batches
      if (i + batchSize < counties.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(
      `Successfully fetched real drought status for ${results.length} counties`
    );
    return results;
  } catch (error) {
    console.error("Error in getCurrentDroughtStatus:", error);
    return [];
  }
}

/**
 * Get real 30-day precipitation totals for all counties from Open-Meteo API
 * Uses county centroids and fetches actual precipitation data
 */
export async function get30DayPrecipitation() {
  try {
    // Get all counties with their centroids
    const { data: counties, error } = await supabase
      .from("counties")
      .select("fips, name, state, geometry");

    if (error || !counties) {
      console.error("Error fetching counties:", error);
      return [];
    }

    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    console.log(
      `Fetching real 30-day precipitation data for ${counties.length} counties from ${startDateStr} to ${endDateStr}`
    );

    // Process counties in batches to avoid overwhelming the API
    const batchSize = 50;
    const results: Array<{
      fips: string;
      total_precipitation: number;
      latest_date: string;
    }> = [];

    for (let i = 0; i < counties.length; i += batchSize) {
      const batch = counties.slice(i, i + batchSize);

      // Fetch precipitation data for each county in parallel
      const batchPromises = batch.map(async (county) => {
        try {
          // Calculate centroid from geometry
          const geometry = county.geometry as
            | { coordinates: number[][][] }
            | undefined;
          let latitude = 0;
          let longitude = 0;

          if (geometry && geometry.coordinates) {
            const coords = geometry.coordinates[0];
            if (Array.isArray(coords) && coords.length > 0) {
              const lats = coords.map((c: number[]) => c[1]);
              const lons = coords.map((c: number[]) => c[0]);
              latitude =
                lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
              longitude =
                lons.reduce((a: number, b: number) => a + b, 0) / lons.length;
            }
          }

          if (latitude === 0 || longitude === 0) {
            return null;
          }

          // Fetch precipitation data from Open-Meteo
          const response = await axios.get(
            "https://archive-api.open-meteo.com/v1/archive",
            {
              params: {
                latitude,
                longitude,
                start_date: startDateStr,
                end_date: endDateStr,
                daily: "precipitation_sum",
                timezone: "America/Chicago",
              },
              timeout: 10000, // 10 second timeout
            }
          );

          if (
            response.data &&
            response.data.daily &&
            response.data.daily.precipitation_sum
          ) {
            const precipData = response.data.daily.precipitation_sum;
            const totalPrecip = precipData.reduce(
              (sum: number, val: number | null) => sum + (val || 0),
              0
            );

            return {
              fips: county.fips,
              total_precipitation: Math.round(totalPrecip * 100) / 100, // Round to 2 decimals
              latest_date: endDateStr,
            };
          }

          return null;
        } catch (error) {
          console.error(
            `Error fetching precipitation for county ${county.fips}:`,
            error instanceof Error ? error.message : "Unknown error"
          );
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(
        (r): r is NonNullable<typeof r> => r !== null
      );
      results.push(...validResults);

      console.log(
        `✓ Processed ${Math.min(i + batchSize, counties.length)}/${
          counties.length
        } counties`
      );

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < counties.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(
      `Successfully fetched real precipitation data for ${results.length} counties`
    );
    return results;
  } catch (error) {
    console.error("Error in get30DayPrecipitation:", error);
    return [];
  }
}

/**
 * Calculate temperature anomaly for a county
 */
export async function getTemperatureAnomaly(
  countyFips: string,
  date: string
): Promise<TemperatureAnomaly | null> {
  const { data, error } = await supabase.rpc("calculate_temperature_anomaly", {
    p_county_fips: countyFips,
    p_date: date,
  });

  if (error) {
    console.error("Error calculating temperature anomaly:", error);
    return null;
  }

  return data;
}

/**
 * Get real temperature anomalies for all counties from Open-Meteo API
 * Compares current temperature to 30-year baseline (1991-2020)
 */
export async function getAllTemperatureAnomalies(date: string) {
  try {
    // Get all counties
    const { data: counties, error } = await supabase
      .from("counties")
      .select("fips, name, state, geometry");

    if (error || !counties) {
      console.error("Error fetching counties:", error);
      return [];
    }

    // Calculate date ranges
    const currentDate = new Date(date);
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get 30-day period around the current date
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - 15);
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 15);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Baseline period (1991-2020, same month)
    const baselineStartYear = 1991;
    const baselineEndYear = 2020;

    console.log(
      `Fetching real temperature anomalies for ${counties.length} counties`
    );

    // Process counties in batches
    const batchSize = 50;
    const results: Array<{
      fips: string;
      county_fips: string;
      current_avg: number;
      baseline_avg: number;
      anomaly: number;
    }> = [];

    for (let i = 0; i < counties.length; i += batchSize) {
      const batch = counties.slice(i, i + batchSize);

      const batchPromises = batch.map(async (county) => {
        try {
          // Calculate centroid
          const geometry = county.geometry as
            | { coordinates: number[][][] }
            | undefined;
          let latitude = 0;
          let longitude = 0;

          if (geometry && geometry.coordinates) {
            const coords = geometry.coordinates[0];
            if (Array.isArray(coords) && coords.length > 0) {
              const lats = coords.map((c: number[]) => c[1]);
              const lons = coords.map((c: number[]) => c[0]);
              latitude =
                lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
              longitude =
                lons.reduce((a: number, b: number) => a + b, 0) / lons.length;
            }
          }

          if (latitude === 0 || longitude === 0) {
            return null;
          }

          // Fetch current temperature data
          const currentResponse = await axios.get(
            "https://archive-api.open-meteo.com/v1/archive",
            {
              params: {
                latitude,
                longitude,
                start_date: startDateStr,
                end_date: endDateStr,
                daily: "temperature_2m_mean",
                timezone: "America/Chicago",
              },
              timeout: 10000,
            }
          );

          if (
            !currentResponse.data ||
            !currentResponse.data.daily ||
            !currentResponse.data.daily.temperature_2m_mean
          ) {
            return null;
          }

          const currentTemps = currentResponse.data.daily.temperature_2m_mean;
          const currentAvg =
            currentTemps.reduce(
              (sum: number, val: number | null) => sum + (val || 0),
              0
            ) / currentTemps.length;

          // Fetch baseline temperature data (last 5 years, same month for speed)
          // This is a simplified baseline - full 30-year baseline would be too slow
          const baselineYears = 5;
          const baselineTemps: number[] = [];

          for (let i = 1; i <= baselineYears; i++) {
            const baselineYear = currentYear - i;
            const baselineStart = new Date(baselineYear, currentMonth - 1, 1);
            const baselineEnd = new Date(baselineYear, currentMonth, 0);

            const baselineStartStr = baselineStart.toISOString().split("T")[0];
            const baselineEndStr = baselineEnd.toISOString().split("T")[0];

            try {
              const baselineResponse = await axios.get(
                "https://archive-api.open-meteo.com/v1/archive",
                {
                  params: {
                    latitude,
                    longitude,
                    start_date: baselineStartStr,
                    end_date: baselineEndStr,
                    daily: "temperature_2m_mean",
                    timezone: "America/Chicago",
                  },
                  timeout: 10000,
                }
              );

              if (
                baselineResponse.data &&
                baselineResponse.data.daily &&
                baselineResponse.data.daily.temperature_2m_mean
              ) {
                const temps = baselineResponse.data.daily.temperature_2m_mean;
                const monthAvg =
                  temps.reduce(
                    (sum: number, val: number | null) => sum + (val || 0),
                    0
                  ) / temps.length;
                baselineTemps.push(monthAvg);
              }
            } catch {
              // Skip failed years
              continue;
            }
          }

          if (baselineTemps.length === 0) {
            return null;
          }

          const baselineAvg =
            baselineTemps.reduce((sum, val) => sum + val, 0) /
            baselineTemps.length;
          const anomaly = currentAvg - baselineAvg;

          return {
            fips: county.fips,
            county_fips: county.fips,
            current_avg: Math.round(currentAvg * 100) / 100,
            baseline_avg: Math.round(baselineAvg * 100) / 100,
            anomaly: Math.round(anomaly * 100) / 100,
          };
        } catch (error) {
          console.error(
            `Error fetching temperature anomaly for county ${county.fips}:`,
            error instanceof Error ? error.message : "Unknown error"
          );
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(
        (r): r is NonNullable<typeof r> => r !== null
      );
      results.push(...validResults);

      console.log(
        `✓ Processed ${Math.min(i + batchSize, counties.length)}/${
          counties.length
        } counties`
      );

      // Delay between batches
      if (i + batchSize < counties.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(
      `Successfully calculated ${results.length} temperature anomalies`
    );
    return results;
  } catch (error) {
    console.error("Error in getAllTemperatureAnomalies:", error);
    return [];
  }
}

/**
 * Get real soil moisture data for all counties from Open-Meteo API
 * Returns current soil moisture levels (0-10cm depth)
 */
export async function getAllSoilMoisture() {
  try {
    // Get all counties
    const { data: counties, error } = await supabase
      .from("counties")
      .select("fips, name, state, geometry");

    if (error || !counties) {
      console.error("Error fetching counties:", error);
      return [];
    }

    // Get last 7 days of data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    console.log(`Fetching real soil moisture for ${counties.length} counties`);

    // Process counties in batches
    const batchSize = 50;
    const results: Array<{
      fips: string;
      soil_moisture: number;
      date: string;
    }> = [];

    for (let i = 0; i < counties.length; i += batchSize) {
      const batch = counties.slice(i, i + batchSize);

      const batchPromises = batch.map(async (county) => {
        try {
          // Calculate centroid
          const geometry = county.geometry as
            | { coordinates: number[][][] }
            | undefined;
          let latitude = 0;
          let longitude = 0;

          if (geometry && geometry.coordinates) {
            const coords = geometry.coordinates[0];
            if (Array.isArray(coords) && coords.length > 0) {
              const lats = coords.map((c: number[]) => c[1]);
              const lons = coords.map((c: number[]) => c[0]);
              latitude =
                lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
              longitude =
                lons.reduce((a: number, b: number) => a + b, 0) / lons.length;
            }
          }

          if (latitude === 0 || longitude === 0) {
            return null;
          }

          // Fetch soil moisture from Open-Meteo
          const response = await axios.get(
            "https://archive-api.open-meteo.com/v1/archive",
            {
              params: {
                latitude,
                longitude,
                start_date: startDateStr,
                end_date: endDateStr,
                daily: "soil_moisture_0_to_10cm",
                timezone: "America/Chicago",
              },
              timeout: 10000,
            }
          );

          if (
            response.data &&
            response.data.daily &&
            response.data.daily.soil_moisture_0_to_10cm
          ) {
            const soilData = response.data.daily.soil_moisture_0_to_10cm;
            const avgSoilMoisture =
              soilData.reduce(
                (sum: number, val: number | null) => sum + (val || 0),
                0
              ) / soilData.length;

            return {
              fips: county.fips,
              soil_moisture: Math.round(avgSoilMoisture * 100 * 100) / 100,
              date: endDateStr,
            };
          }

          return null;
        } catch (error) {
          console.error(
            `Error fetching soil moisture for county ${county.fips}:`,
            error instanceof Error ? error.message : "Unknown error"
          );
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(
        (r): r is NonNullable<typeof r> => r !== null
      );
      results.push(...validResults);

      console.log(
        `✓ Processed ${Math.min(i + batchSize, counties.length)}/${
          counties.length
        } counties`
      );

      // Delay between batches
      if (i + batchSize < counties.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(
      `Successfully fetched soil moisture for ${results.length} counties`
    );
    return results;
  } catch (error) {
    console.error("Error in getAllSoilMoisture:", error);
    return [];
  }
}

/**
 * Get crop yield risk index for a county and crop type
 */
export async function getCropRiskIndex(
  countyFips: string,
  cropType: string,
  date?: string
): Promise<CropYieldRiskIndex | null> {
  let query = supabase
    .from("crop_risk_index")
    .select("*")
    .eq("county_fips", countyFips)
    .eq("crop_type", cropType)
    .order("date", { ascending: false })
    .limit(1);

  if (date) {
    query = query.eq("date", date);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("Error fetching crop risk index:", error);
    return null;
  }

  return data
    ? {
        county_fips: data.county_fips,
        crop_type: data.crop_type,
        risk_score: data.risk_score,
        factors: {
          rainfall_deficit: data.rainfall_deficit_score,
          soil_moisture_stress: data.soil_moisture_score,
          heat_stress: data.heat_stress_score,
          drought_severity: data.drought_severity_score,
        },
        growth_stage: data.growth_stage,
      }
    : null;
}

/**
 * Get real crop risk indices for all counties from Open-Meteo API
 * Calculates risk based on precipitation, temperature, and soil moisture
 */
export async function getAllCropRiskIndices(cropType: string, date?: string) {
  try {
    // Get all counties
    const { data: counties, error } = await supabase
      .from("counties")
      .select("fips, name, state, geometry");

    if (error || !counties) {
      console.error("Error fetching counties:", error);
      return [];
    }

    // Calculate date range (last 30 days)
    const endDate = date ? new Date(date) : new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    console.log(
      `Fetching real crop risk for ${counties.length} counties (${cropType})`
    );

    // Process counties in batches
    const batchSize = 50;
    const results: Array<{
      county_fips: string;
      crop_type: string;
      risk_score: number;
      rainfall_deficit_score: number;
      soil_moisture_score: number;
      heat_stress_score: number;
      drought_severity_score: number;
      growth_stage: string;
      date: string;
    }> = [];

    for (let i = 0; i < counties.length; i += batchSize) {
      const batch = counties.slice(i, i + batchSize);

      const batchPromises = batch.map(async (county) => {
        try {
          // Calculate centroid
          const geometry = county.geometry as
            | { coordinates: number[][][] }
            | undefined;
          let latitude = 0;
          let longitude = 0;

          if (geometry && geometry.coordinates) {
            const coords = geometry.coordinates[0];
            if (Array.isArray(coords) && coords.length > 0) {
              const lats = coords.map((c: number[]) => c[1]);
              const lons = coords.map((c: number[]) => c[0]);
              latitude =
                lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
              longitude =
                lons.reduce((a: number, b: number) => a + b, 0) / lons.length;
            }
          }

          if (latitude === 0 || longitude === 0) {
            return null;
          }

          // Fetch climate data from Open-Meteo
          const response = await axios.get(
            "https://archive-api.open-meteo.com/v1/archive",
            {
              params: {
                latitude,
                longitude,
                start_date: startDateStr,
                end_date: endDateStr,
                daily:
                  "precipitation_sum,temperature_2m_max,soil_moisture_0_to_10cm",
                timezone: "America/Chicago",
              },
              timeout: 10000,
            }
          );

          if (
            response.data &&
            response.data.daily &&
            response.data.daily.precipitation_sum &&
            response.data.daily.temperature_2m_max &&
            response.data.daily.soil_moisture_0_to_10cm
          ) {
            const precipData = response.data.daily.precipitation_sum;
            const tempData = response.data.daily.temperature_2m_max;
            const soilData = response.data.daily.soil_moisture_0_to_10cm;

            // Calculate risk factors (0-100 scale)
            const totalPrecip = precipData.reduce(
              (sum: number, val: number | null) => sum + (val || 0),
              0
            );
            const avgPrecipPerDay = totalPrecip / 30;

            const avgSoilMoisture =
              soilData.reduce(
                (sum: number, val: number | null) => sum + (val || 0),
                0
              ) / soilData.length;

            const maxTemp = Math.max(
              ...tempData.filter((t: number | null) => t !== null)
            );

            // Rainfall deficit score (higher = more risk)
            let rainfallDeficit = 0;
            if (avgPrecipPerDay < 0.5) rainfallDeficit = 80;
            else if (avgPrecipPerDay < 1.0) rainfallDeficit = 60;
            else if (avgPrecipPerDay < 2.0) rainfallDeficit = 40;
            else if (avgPrecipPerDay < 3.0) rainfallDeficit = 20;

            // Soil moisture stress (higher = more risk)
            let soilMoistureStress = 0;
            if (avgSoilMoisture < 0.15) soilMoistureStress = 90;
            else if (avgSoilMoisture < 0.2) soilMoistureStress = 70;
            else if (avgSoilMoisture < 0.25) soilMoistureStress = 50;
            else if (avgSoilMoisture < 0.3) soilMoistureStress = 30;

            // Heat stress (higher = more risk)
            let heatStress = 0;
            if (maxTemp > 38) heatStress = 90; // >100°F
            else if (maxTemp > 35) heatStress = 70; // >95°F
            else if (maxTemp > 32) heatStress = 50; // >90°F
            else if (maxTemp > 29) heatStress = 30; // >85°F

            // Drought severity (combined metric)
            const droughtSeverity = Math.round(
              (rainfallDeficit + soilMoistureStress) / 2
            );

            // Overall risk score (weighted average)
            const riskScore = Math.round(
              rainfallDeficit * 0.3 +
                soilMoistureStress * 0.4 +
                heatStress * 0.2 +
                droughtSeverity * 0.1
            );

            return {
              county_fips: county.fips,
              crop_type: cropType,
              risk_score: riskScore,
              rainfall_deficit_score: rainfallDeficit,
              soil_moisture_score: soilMoistureStress,
              heat_stress_score: heatStress,
              drought_severity_score: droughtSeverity,
              growth_stage: "vegetative", // Simplified - would need crop calendar
              date: endDateStr,
            };
          }

          return null;
        } catch (error) {
          console.error(
            `Error fetching crop risk for county ${county.fips}:`,
            error instanceof Error ? error.message : "Unknown error"
          );
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(
        (r): r is NonNullable<typeof r> => r !== null
      );
      results.push(...validResults);

      console.log(
        `✓ Processed ${Math.min(i + batchSize, counties.length)}/${
          counties.length
        } counties`
      );

      // Delay between batches
      if (i + batchSize < counties.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(
      `Successfully calculated crop risk for ${results.length} counties`
    );
    return results;
  } catch (error) {
    console.error("Error in getAllCropRiskIndices:", error);
    return [];
  }
}

/**
 * Get historical drought events for a county
 */
export async function getDroughtEvents(countyFips: string, startYear?: number) {
  let query = supabase
    .from("drought_events")
    .select("*")
    .eq("county_fips", countyFips)
    .order("start_date", { ascending: true });

  if (startYear) {
    query = query.gte("start_date", `${startYear}-01-01`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching drought events:", error);
    return [];
  }

  return data || [];
}

/**
 * Get growing degree days for a county
 */
export async function getGrowingDegreeDays(
  countyFips: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from("growing_degree_days")
    .select("*")
    .eq("county_fips", countyFips)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching GDD data:", error);
    return [];
  }

  return data || [];
}

/**
 * Calculate year-to-date GDD sum
 */
export async function getYTDGrowingDegreeDays(countyFips: string) {
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const endDate = new Date().toISOString().split("T")[0];

  const gddData = await getGrowingDegreeDays(countyFips, startDate, endDate);

  return gddData.reduce((sum, record) => sum + (record.gdd_value || 0), 0);
}
