import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env file");
  console.error(
    "Required: NEXT_PUBLIC_SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Crop-specific climate thresholds and growing season data
const CROP_CONFIGS = {
  corn: {
    name: "Corn",
    optimal_temp_range: [18, 30], // °C
    critical_temp_max: 35, // °C - heat stress threshold
    optimal_soil_moisture: [25, 40], // %
    critical_soil_moisture_min: 15, // %
    optimal_precipitation_monthly: [75, 125], // mm
    drought_sensitivity: 0.8, // 0-1, higher = more sensitive
    growing_season_months: [4, 5, 6, 7, 8, 9], // April-September
    growth_stages: {
      4: "Planting",
      5: "Emergence",
      6: "Vegetative",
      7: "Tasseling/Silking",
      8: "Grain Fill",
      9: "Maturity",
    },
  },
  wheat: {
    name: "Wheat",
    optimal_temp_range: [15, 25], // °C
    critical_temp_max: 32, // °C
    optimal_soil_moisture: [20, 35], // %
    critical_soil_moisture_min: 12, // %
    optimal_precipitation_monthly: [50, 100], // mm
    drought_sensitivity: 0.6,
    growing_season_months: [3, 4, 5, 6, 7], // March-July (spring wheat)
    growth_stages: {
      3: "Planting",
      4: "Tillering",
      5: "Stem Extension",
      6: "Heading",
      7: "Grain Fill/Maturity",
    },
  },
  soybeans: {
    name: "Soybeans",
    optimal_temp_range: [20, 30], // °C
    critical_temp_max: 35, // °C
    optimal_soil_moisture: [25, 40], // %
    critical_soil_moisture_min: 15, // %
    optimal_precipitation_monthly: [75, 125], // mm
    drought_sensitivity: 0.75,
    growing_season_months: [5, 6, 7, 8, 9], // May-September
    growth_stages: {
      5: "Planting",
      6: "Vegetative",
      7: "Flowering",
      8: "Pod Fill",
      9: "Maturity",
    },
  },
  cotton: {
    name: "Cotton",
    optimal_temp_range: [21, 32], // °C
    critical_temp_max: 38, // °C
    optimal_soil_moisture: [20, 35], // %
    critical_soil_moisture_min: 12, // %
    optimal_precipitation_monthly: [50, 100], // mm
    drought_sensitivity: 0.7,
    growing_season_months: [4, 5, 6, 7, 8, 9], // April-September
    growth_stages: {
      4: "Planting",
      5: "Emergence",
      6: "Squaring",
      7: "Flowering",
      8: "Boll Development",
      9: "Maturity",
    },
  },
  rice: {
    name: "Rice",
    optimal_temp_range: [20, 35], // °C
    critical_temp_max: 40, // °C
    optimal_soil_moisture: [35, 50], // % - rice needs more water
    critical_soil_moisture_min: 25, // %
    optimal_precipitation_monthly: [100, 200], // mm
    drought_sensitivity: 0.9, // Very sensitive to water stress
    growing_season_months: [4, 5, 6, 7, 8, 9], // April-September
    growth_stages: {
      4: "Planting/Flooding",
      5: "Tillering",
      6: "Stem Extension",
      7: "Panicle Initiation",
      8: "Flowering/Grain Fill",
      9: "Maturity",
    },
  },
};

// Calculate risk score based on climate conditions
function calculateRiskScore(
  cropType: keyof typeof CROP_CONFIGS,
  temperature: number,
  soilMoisture: number,
  precipitation: number,
  droughtIndex: number,
  month: number
): {
  risk_score: number;
  rainfall_deficit_score: number;
  soil_moisture_score: number;
  heat_stress_score: number;
  drought_severity_score: number;
  growth_stage: string;
} {
  const config = CROP_CONFIGS[cropType];

  // Check if it's growing season
  const isGrowingSeason = config.growing_season_months.includes(month);

  // Get growth stage
  const growth_stage = isGrowingSeason
    ? config.growth_stages[month as keyof typeof config.growth_stages] ||
      "Off-Season"
    : "Off-Season";

  // If not growing season, risk is minimal
  if (!isGrowingSeason) {
    return {
      risk_score: 0,
      rainfall_deficit_score: 0,
      soil_moisture_score: 0,
      heat_stress_score: 0,
      drought_severity_score: 0,
      growth_stage,
    };
  }

  // 1. Heat Stress Score (0-100)
  let heat_stress_score = 0;
  if (temperature > config.critical_temp_max) {
    heat_stress_score = Math.min(
      100,
      (temperature - config.critical_temp_max) * 10
    );
  } else if (temperature > config.optimal_temp_range[1]) {
    heat_stress_score =
      ((temperature - config.optimal_temp_range[1]) /
        (config.critical_temp_max - config.optimal_temp_range[1])) *
      50;
  } else if (temperature < config.optimal_temp_range[0]) {
    heat_stress_score =
      ((config.optimal_temp_range[0] - temperature) /
        config.optimal_temp_range[0]) *
      30;
  }

  // 2. Soil Moisture Score (0-100)
  let soil_moisture_score = 0;
  if (soilMoisture < config.critical_soil_moisture_min) {
    soil_moisture_score = 100;
  } else if (soilMoisture < config.optimal_soil_moisture[0]) {
    soil_moisture_score =
      ((config.optimal_soil_moisture[0] - soilMoisture) /
        (config.optimal_soil_moisture[0] - config.critical_soil_moisture_min)) *
      100;
  } else if (soilMoisture > config.optimal_soil_moisture[1]) {
    soil_moisture_score =
      ((soilMoisture - config.optimal_soil_moisture[1]) /
        config.optimal_soil_moisture[1]) *
      40;
  }

  // 3. Rainfall Deficit Score (0-100)
  let rainfall_deficit_score = 0;
  if (precipitation < config.optimal_precipitation_monthly[0]) {
    rainfall_deficit_score =
      ((config.optimal_precipitation_monthly[0] - precipitation) /
        config.optimal_precipitation_monthly[0]) *
      100;
  } else if (precipitation > config.optimal_precipitation_monthly[1]) {
    rainfall_deficit_score =
      ((precipitation - config.optimal_precipitation_monthly[1]) /
        config.optimal_precipitation_monthly[1]) *
      30;
  }

  // 4. Drought Severity Score (0-100)
  const drought_severity_score =
    (droughtIndex / 5) * 100 * config.drought_sensitivity;

  // Overall Risk Score (weighted average)
  const risk_score = Math.min(
    100,
    Math.round(
      heat_stress_score * 0.25 +
        soil_moisture_score * 0.3 +
        rainfall_deficit_score * 0.25 +
        drought_severity_score * 0.2
    )
  );

  return {
    risk_score,
    rainfall_deficit_score: Math.round(rainfall_deficit_score),
    soil_moisture_score: Math.round(soil_moisture_score),
    heat_stress_score: Math.round(heat_stress_score),
    drought_severity_score: Math.round(drought_severity_score),
    growth_stage,
  };
}

async function populateCropRiskData() {
  console.log("Starting crop risk data population...\n");

  // Get all counties
  console.log("Fetching counties...");
  const allCounties: any[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("counties")
      .select("fips, name, state")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching counties:", error);
      break;
    }

    if (data && data.length > 0) {
      allCounties.push(...data);
      hasMore = data.length === pageSize;
      page++;
    } else {
      hasMore = false;
    }
  }

  console.log(`Fetched ${allCounties.length} counties\n`);

  // Get current climate data for all counties with pagination
  console.log("Fetching current climate data...");
  const allClimateData: any[] = [];
  page = 0;
  hasMore = true;
  const currentDate = new Date().toISOString().split("T")[0];

  while (hasMore) {
    const { data, error } = await supabase
      .from("climate_data")
      .select(
        "county_fips, temperature_avg, soil_moisture, precipitation, drought_index, date"
      )
      .eq("date", currentDate)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching climate data:", error);
      break;
    }

    if (data && data.length > 0) {
      allClimateData.push(...data);
      hasMore = data.length === pageSize;
      page++;
    } else {
      hasMore = false;
    }
  }

  console.log(`Fetched ${allClimateData.length} climate records\n`);

  // Create a map of climate data by county FIPS
  const climateMap = new Map(allClimateData.map((cd) => [cd.county_fips, cd]));

  const currentMonth = new Date().getMonth() + 1;

  // Generate crop risk data for all crops and counties
  const cropTypes: (keyof typeof CROP_CONFIGS)[] = [
    "corn",
    "wheat",
    "soybeans",
    "cotton",
    "rice",
  ];
  const cropRiskRecords: any[] = [];

  console.log("Calculating crop risk scores...");

  for (const county of allCounties) {
    const climate = climateMap.get(county.fips);

    if (!climate) continue;

    for (const cropType of cropTypes) {
      const riskData = calculateRiskScore(
        cropType,
        climate.temperature_avg || 20,
        climate.soil_moisture || 25,
        climate.precipitation || 50,
        climate.drought_index || 0,
        currentMonth
      );

      cropRiskRecords.push({
        county_fips: county.fips,
        crop_type: cropType,
        date: currentDate,
        risk_score: riskData.risk_score,
        rainfall_deficit_score: riskData.rainfall_deficit_score,
        soil_moisture_score: riskData.soil_moisture_score,
        heat_stress_score: riskData.heat_stress_score,
        drought_severity_score: riskData.drought_severity_score,
        growth_stage: riskData.growth_stage,
      });
    }
  }

  console.log(`Generated ${cropRiskRecords.length} crop risk records\n`);

  // Insert in batches
  console.log("Inserting crop risk data into database...");
  const batchSize = 1000;
  let inserted = 0;

  for (let i = 0; i < cropRiskRecords.length; i += batchSize) {
    const batch = cropRiskRecords.slice(i, i + batchSize);

    const { error } = await supabase
      .from("crop_risk_index")
      .upsert(batch, { onConflict: "county_fips,crop_type,date" });

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
    } else {
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${cropRiskRecords.length} records...`);
    }
  }

  console.log(`\n✅ Successfully populated ${inserted} crop risk records!`);
  console.log(`\nBreakdown by crop type:`);
  for (const cropType of cropTypes) {
    const count = cropRiskRecords.filter(
      (r) => r.crop_type === cropType
    ).length;
    console.log(`  - ${CROP_CONFIGS[cropType].name}: ${count} counties`);
  }
}

populateCropRiskData()
  .then(() => {
    console.log("\n✅ Crop risk data population complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
