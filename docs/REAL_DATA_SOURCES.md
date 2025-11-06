# Data Sources - AgriClime Sentinel

This document describes the data sources used in the AgriClime Sentinel application.

---

## 📊 Map Data Layers (Sample Data for Performance)

| Layer                    | Data Source                       | Load Time | Status  |
| ------------------------ | --------------------------------- | --------- | ------- |
| **30-Day Precipitation** | Sample Data (PostgreSQL Database) | <1 second | ⚡ Fast |
| **Drought Status**       | Sample Data (PostgreSQL Database) | <1 second | ⚡ Fast |
| **Temperature Anomaly**  | Sample Data (PostgreSQL Database) | <1 second | ⚡ Fast |
| **Soil Moisture**        | Sample Data (PostgreSQL Database) | <1 second | ⚡ Fast |
| **Crop Risk**            | Sample Data (PostgreSQL Database) | <1 second | ⚡ Fast |

⚡ **All map layers load instantly (<1 second for 3,221 counties)**

## 🌐 Real-Time Data Layers

| Layer              | Data Source            | Update Frequency | API Provider         |
| ------------------ | ---------------------- | ---------------- | -------------------- |
| **Weather Alerts** | NOAA NWS API           | Real-time        | NOAA Weather Service |
| **Severe Weather** | NOAA HRRR Model        | Real-time        | NOAA HRRR            |
| **Air Quality**    | EPA AirNow API         | Real-time        | EPA AirNow           |
| **Climate Trends** | Open-Meteo Archive API | Real-time        | Open-Meteo           |

✅ **Real-time data layers fetch live data from government and scientific APIs**

---

## Why Sample Data for Map Layers?

The map layers use sample data stored in the PostgreSQL database for optimal performance:

### Previous Approach (Real-Time API)

- ❌ Took 65-90 seconds to load all 3,221 counties
- ❌ Often timed out in browser/Vercel (30-60 second limits)
- ❌ Exceeded API rate limits (10,000 requests/day)
- ❌ Made 3,221 API calls per layer (16,105 total for all layers)
- ❌ Poor user experience

### Current Approach (Database Sample Data)

- ✅ Loads instantly (<1 second for all 3,221 counties)
- ✅ Production-ready user experience
- ✅ Demonstrates application capabilities
- ✅ No API rate limit concerns
- ✅ Can be updated with real data via background jobs

---

## Future: Real Data Integration Options

To integrate real data while maintaining performance:

### Option 1: Background Data Updates (Recommended)

- Create a cron job that fetches real data from Open-Meteo API nightly
- Update database with fresh data
- Users see instant load times with real (but slightly delayed) data
- Add "Last Updated" timestamp to show data freshness

### Option 2: On-Demand Real Data

- Show sample data on map by default (instant load)
- When user clicks a county, fetch real data for that county only
- Cache clicked counties for future use
- Add visual indicator showing which counties have real vs sample data

### Option 3: Progressive Loading

- Load map with cached/sample data immediately
- Fetch real data in background
- Update map progressively as data arrives
- Show loading progress indicator

---

## Sample Data Details

The sample data in the database is generated using realistic algorithms based on:

- Geographic location (state, county)
- Seasonal patterns
- Historical climate averages
- Statistical distributions

This provides a realistic demonstration of the application's capabilities while maintaining optimal performance.

---

## Real-Time Data Implementation

The following features use **real-time data** from government APIs:

### Weather Alerts (NOAA NWS API)

### Data Source

- **API**: NOAA National Weather Service API
- **Endpoint**: `https://api.weather.gov/alerts/active`
- **Documentation**: https://www.weather.gov/documentation/services-web-api

### Implementation Details

- **Coverage**: Point-based (latitude/longitude)
- **Update Frequency**: Real-time
- **Data Points**: Active weather alerts, warnings, watches

### How It Works

1. Accepts latitude/longitude from county centroid
2. Fetches active alerts from NOAA NWS API
3. Filters alerts by location
4. Returns alert details (severity, event type, description)

### Code Location

- **Function**: `getWeatherAlerts()` in `lib/api/noaa-weather.ts`
- **API Route**: `/api/weather-alerts?lat={lat}&lon={lon}`

---

## Technical Implementation

For detailed implementation information, see:

- `lib/api/climate-data.ts` - Map data layer functions
- `lib/api/noaa-weather.ts` - Weather alerts
- `lib/api/air-quality.ts` - Air quality data
- `lib/api/climate-trends.ts` - Climate trend analysis
- `app/api/map-data/route.ts` - Map data API endpoint
