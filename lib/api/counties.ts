import { supabase } from "@/lib/supabase";
import { County } from "@/types";

/**
 * Get all counties with their geometries using pagination
 */
export async function getAllCounties(): Promise<County[]> {
  const allCounties: County[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("counties")
      .select("id, fips, name, state, geometry")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching counties:", error);
      break;
    }

    if (data && data.length > 0) {
      // Calculate centroid for each county
      const countiesWithCentroid = data.map((county: any) => {
        let latitude = 39.8283; // Default: center of US
        let longitude = -98.5795;

        if (county.geometry && county.geometry.coordinates) {
          try {
            const coords = county.geometry.coordinates[0];
            if (Array.isArray(coords) && coords.length > 0) {
              const lats = coords.map((c: number[]) => c[1]);
              const lons = coords.map((c: number[]) => c[0]);
              latitude =
                lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
              longitude =
                lons.reduce((a: number, b: number) => a + b, 0) / lons.length;
            }
          } catch (e) {
            console.warn(
              `Could not calculate centroid for county ${county.fips}`
            );
          }
        }

        return {
          ...county,
          centroid: { latitude, longitude },
        };
      });

      allCounties.push(...countiesWithCentroid);
      hasMore = data.length === pageSize;
      page++;
    } else {
      hasMore = false;
    }
  }

  console.log(`Fetched ${allCounties.length} counties total`);
  return allCounties;
}

/**
 * Get a single county by FIPS code
 */
export async function getCountyByFips(fips: string): Promise<County | null> {
  const { data, error } = await supabase
    .from("counties")
    .select("*")
    .eq("fips", fips)
    .single();

  if (error) {
    console.error("Error fetching county:", error);
    return null;
  }

  return data;
}

/**
 * Get counties by state
 */
export async function getCountiesByState(state: string): Promise<County[]> {
  const { data, error } = await supabase
    .from("counties")
    .select("*")
    .eq("state", state)
    .order("name");

  if (error) {
    console.error("Error fetching counties by state:", error);
    return [];
  }

  return data || [];
}

/**
 * Search counties by name
 */
export async function searchCounties(searchTerm: string): Promise<County[]> {
  const { data, error } = await supabase
    .from("counties")
    .select("*")
    .ilike("name", `%${searchTerm}%`)
    .limit(20);

  if (error) {
    console.error("Error searching counties:", error);
    return [];
  }

  return data || [];
}
