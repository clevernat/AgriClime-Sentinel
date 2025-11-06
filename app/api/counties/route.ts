import { NextRequest, NextResponse } from "next/server";
import {
  getAllCounties,
  searchCounties,
  getCountyByFips,
} from "@/lib/api/counties";

/**
 * Counties API endpoint
 *
 * Query parameters:
 * - fips: Get a single county by FIPS code (fast, <100ms)
 * - search: Search counties by name
 * - (none): Get all counties (slow, 30+ seconds)
 *
 * Performance optimization:
 * - Use ?fips=XXXXX for instant single county lookup
 * - Avoids loading all 3,221 counties when only one is needed
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fips = searchParams.get("fips");
  const search = searchParams.get("search");

  try {
    // Fast path: Get single county by FIPS
    if (fips) {
      const county = await getCountyByFips(fips);
      if (!county) {
        return NextResponse.json(
          { error: "County not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(county);
    }

    // Search counties by name
    if (search) {
      const counties = await searchCounties(search);
      return NextResponse.json(counties);
    }

    // Slow path: Get all counties (only for map rendering)
    const counties = await getAllCounties();
    return NextResponse.json(counties);
  } catch (error) {
    console.error("Error in counties API:", error);
    return NextResponse.json(
      { error: "Failed to fetch counties" },
      { status: 500 }
    );
  }
}
