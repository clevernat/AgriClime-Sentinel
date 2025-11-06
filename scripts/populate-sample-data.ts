/**
 * Script to populate sample climate data for demonstration
 *
 * This creates synthetic but realistic climate data for testing
 * In production, this would fetch real data from Open-Meteo API
 *
 * Run with: npx tsx scripts/populate-sample-data.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { calculateGDD } from "../lib/constants";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function populateSampleData() {
  console.log("Fetching counties...");

  // Get all counties (Supabase has a default limit of 1000, so we need to fetch all)
  let allCounties: Array<{ fips: string; state: string }> = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data: counties, error: countiesError } = await supabase
      .from("counties")
      .select("fips, state")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (countiesError) {
      console.error("Error fetching counties:", countiesError);
      return;
    }

    if (!counties || counties.length === 0) {
      break;
    }

    allCounties = allCounties.concat(counties);
    console.log(`  Fetched ${allCounties.length} counties so far...`);

    if (counties.length < pageSize) {
      break; // Last page
    }

    page++;
  }

  const counties = allCounties;
  console.log(`✓ Total counties fetched: ${counties.length}\n`);

  console.log(`Generating sample data for ${counties.length} counties...`);
  console.log("This will take several minutes. Please be patient...\n");

  // Generate data for the last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  // Process counties in chunks to avoid memory issues
  const countyChunkSize = 500; // Process 500 counties at a time
  const batchSize = 1000; // Database insert batch size

  let totalClimateRecords = 0;
  let totalGddRecords = 0;

  for (
    let chunkStart = 0;
    chunkStart < counties.length;
    chunkStart += countyChunkSize
  ) {
    const chunkEnd = Math.min(chunkStart + countyChunkSize, counties.length);
    const countyChunk = counties.slice(chunkStart, chunkEnd);

    console.log(
      `\n📊 Processing counties ${chunkStart + 1}-${chunkEnd} of ${
        counties.length
      }...`
    );

    const climateData = [];
    const gddData = [];

    for (const county of countyChunk) {
      // Generate realistic climate patterns based on state
      const baseTemp = getBaseTemperature(county.state);
      const basePrecip = getBasePrecipitation(county.state);
      const droughtRisk = getDroughtRisk(county.state);

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0];

        // Add some randomness and seasonal variation
        const dayOfYear = getDayOfYear(d);
        const seasonalFactor = Math.sin((dayOfYear / 365) * 2 * Math.PI);

        const tempMax =
          baseTemp + seasonalFactor * 10 + (Math.random() - 0.5) * 5;
        const tempMin = tempMax - 8 - Math.random() * 4;
        const tempAvg = (tempMax + tempMin) / 2;

        const precipitation = Math.max(
          0,
          basePrecip * (1 + seasonalFactor * 0.3) * Math.random() * 2
        );
        const soilMoisture = Math.max(
          10,
          Math.min(100, 50 + seasonalFactor * 20 + (Math.random() - 0.5) * 30)
        );

        // Drought index based on precipitation and soil moisture
        let droughtIndex = 0;
        if (soilMoisture < 30 || precipitation < 1) droughtIndex = 1;
        if (soilMoisture < 20 || precipitation < 0.5) droughtIndex = 2;
        if (soilMoisture < 15) droughtIndex = 3;
        if (droughtRisk > 0.7 && soilMoisture < 20)
          droughtIndex = Math.min(4, droughtIndex + 1);

        climateData.push({
          county_fips: county.fips,
          date: dateStr,
          temperature_avg: tempAvg,
          temperature_max: tempMax,
          temperature_min: tempMin,
          precipitation,
          soil_moisture: soilMoisture,
          drought_index: droughtIndex,
        });

        // Calculate GDD
        const gdd = calculateGDD(tempMax, tempMin, 10);
        gddData.push({
          county_fips: county.fips,
          date: dateStr,
          gdd_value: gdd,
          base_temp: 10,
        });
      }
    }

    console.log(
      `  ✓ Generated ${climateData.length} climate records for this chunk`
    );
    console.log(`  📤 Inserting climate data...`);

    // Insert climate data in batches
    for (let i = 0; i < climateData.length; i += batchSize) {
      const batch = climateData.slice(i, i + batchSize);
      const { error } = await supabase
        .from("climate_data")
        .upsert(batch, { onConflict: "county_fips,date" });

      if (error) {
        console.error("     ❌ Error inserting climate data batch:", error);
      }
    }

    totalClimateRecords += climateData.length;
    console.log(`  ✓ Inserted ${climateData.length} climate records`);

    console.log(`  📤 Inserting GDD data...`);

    // Insert GDD data in batches
    for (let i = 0; i < gddData.length; i += batchSize) {
      const batch = gddData.slice(i, i + batchSize);
      const { error } = await supabase
        .from("growing_degree_days")
        .upsert(batch, { onConflict: "county_fips,date,base_temp" });

      if (error) {
        console.error("     ❌ Error inserting GDD data batch:", error);
      }
    }

    totalGddRecords += gddData.length;
    console.log(`  ✓ Inserted ${gddData.length} GDD records`);

    const progress = ((chunkEnd / counties.length) * 100).toFixed(1);
    console.log(
      `  📈 Overall progress: ${progress}% (${chunkEnd}/${counties.length} counties)`
    );
  }

  console.log(`\n✅ Total records inserted:`);
  console.log(`   - Climate data: ${totalClimateRecords.toLocaleString()}`);
  console.log(`   - GDD data: ${totalGddRecords.toLocaleString()}`);
  console.log(`   - Counties processed: ${counties.length.toLocaleString()}`);

  // Refresh materialized views
  console.log("Refreshing materialized views...");
  await supabase.rpc("refresh_current_drought_status");

  console.log("✓ Sample data population complete!");
}

function getBaseTemperature(state: string): number {
  const tempMap: Record<string, number> = {
    FL: 25,
    TX: 22,
    CA: 18,
    AZ: 24,
    MN: 8,
    ND: 6,
    SD: 8,
    WI: 10,
    IA: 12,
    IL: 13,
    IN: 12,
    OH: 12,
  };
  return tempMap[state] || 15;
}

function getBasePrecipitation(state: string): number {
  const precipMap: Record<string, number> = {
    WA: 3,
    OR: 2.5,
    FL: 4,
    AZ: 0.5,
    NV: 0.3,
    CA: 1,
    IA: 2,
    IL: 2.5,
    IN: 2.5,
  };
  return precipMap[state] || 2;
}

function getDroughtRisk(state: string): number {
  const riskMap: Record<string, number> = {
    CA: 0.8,
    AZ: 0.9,
    NV: 0.85,
    NM: 0.8,
    TX: 0.6,
    OK: 0.6,
    KS: 0.5,
  };
  return riskMap[state] || 0.3;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Run the script
populateSampleData()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
