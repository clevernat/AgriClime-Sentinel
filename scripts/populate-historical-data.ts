/**
 * Populate historical drought events and climate trends
 * This script generates realistic historical data for the dashboard
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
  console.error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    supabaseKey ? "exists" : "missing"
  );
  throw new Error("Missing Supabase credentials in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to generate random number in range
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Helper function to generate random integer in range
function randomIntInRange(min: number, max: number): number {
  return Math.floor(randomInRange(min, max));
}

// Helper function to generate a random date in a year
function randomDateInYear(year: number): string {
  const month = randomIntInRange(1, 13);
  const day = randomIntInRange(1, 29); // Simplified to avoid month-specific logic
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

async function populateHistoricalData() {
  console.log("Fetching counties...");

  // Get all counties using pagination
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

  if (allCounties.length === 0) {
    console.error("No counties found!");
    return;
  }

  console.log(`Found ${allCounties.length} counties total`);
  console.log("Generating historical drought events (50 years)...");

  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 50;
  const droughtEvents = [];

  // Generate drought events for each county
  for (const county of allCounties) {
    // Each county gets 5-15 drought events over 50 years
    const numEvents = randomIntInRange(5, 16);

    for (let i = 0; i < numEvents; i++) {
      const year = randomIntInRange(startYear, currentYear);
      const startDate = randomDateInYear(year);

      // Drought duration: 30-180 days
      const durationDays = randomIntInRange(30, 181);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);

      // Severity: 1-5 (D0-D4)
      const maxSeverity = randomIntInRange(1, 6);

      droughtEvents.push({
        county_fips: county.fips,
        start_date: startDate,
        end_date: endDate.toISOString().split("T")[0],
        max_severity: maxSeverity,
        duration_days: durationDays,
      });
    }
  }

  console.log(`Generated ${droughtEvents.length} drought events`);
  console.log("Inserting drought events into database...");

  // Insert in batches
  const batchSize = 1000;
  let inserted = 0;

  for (let i = 0; i < droughtEvents.length; i += batchSize) {
    const batch = droughtEvents.slice(i, i + batchSize);

    const { error } = await supabase.from("drought_events").insert(batch);

    if (error) {
      console.error("Error inserting batch:", error);
      console.error("Sample record:", batch[0]);
    } else {
      inserted += batch.length;
      console.log(`  Inserted ${inserted}/${droughtEvents.length} events`);
    }
  }

  console.log("\n✅ Historical data population complete!");
  console.log(`   Total drought events: ${inserted}`);
}

// Run the script
populateHistoricalData()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
