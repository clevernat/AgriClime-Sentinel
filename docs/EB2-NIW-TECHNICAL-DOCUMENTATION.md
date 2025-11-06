# AgriClime Sentinel - EB2-NIW Technical Documentation

## Executive Summary

**AgriClime Sentinel** is an advanced atmospheric science and agricultural climate risk platform that serves the national interest of the United States by:

1. **Protecting American Lives**: Real-time severe weather prediction and early warning systems
2. **Safeguarding Infrastructure**: Climate extremes analysis for disaster preparedness
3. **Advancing Climate Science**: Statistical trend analysis and climate change research
4. **Supporting Public Health**: Air quality monitoring and health impact assessment
5. **Ensuring Food Security**: Agricultural climate risk assessment for crop protection

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Atmospheric Science Features](#atmospheric-science-features)
3. [Agricultural Climate Features](#agricultural-climate-features)
4. [Technical Architecture](#technical-architecture)
5. [Data Sources & APIs](#data-sources--apis)
6. [National Importance](#national-importance)
7. [Research Applications](#research-applications)
8. [Economic Impact](#economic-impact)

---

## Platform Overview

### Dual-Mode System

AgriClime Sentinel operates in two complementary modes:

#### 1. **Atmospheric Science Mode**
- Real-time weather alerts and warnings
- Severe weather prediction (tornadoes, thunderstorms, hail)
- Atmospheric instability analysis
- Air quality monitoring and forecasting
- Long-term climate trend analysis

#### 2. **Agricultural Climate Mode**
- Drought monitoring and prediction
- Crop-specific climate risk assessment
- Soil moisture analysis
- Growing degree days tracking
- Historical agricultural climate trends

### Geographic Coverage
- **3,221 U.S. Counties** with complete data coverage
- **County-level granularity** for localized analysis
- **National-scale** monitoring and visualization

---

## Atmospheric Science Features

### 1. Real-Time Weather Alerts

**Technology**: NOAA Weather API Integration

**Capabilities**:
- Tornado warnings and watches
- Severe thunderstorm warnings
- Flash flood warnings
- Winter storm warnings
- Heat advisories
- All NWS alert types

**National Importance**:
- Early warning saves lives
- Reduces property damage
- Supports emergency management
- Protects critical infrastructure

**Implementation**:
```typescript
// API Endpoint: /api/weather-alerts
// Returns active alerts for any location
GET /api/weather-alerts?lat=40.7128&lon=-74.0060
GET /api/weather-alerts?fips=36061
GET /api/weather-alerts?all=true
```

### 2. Severe Weather Prediction

**Technology**: Atmospheric Instability Indices

**Indices Calculated**:
1. **CAPE** (Convective Available Potential Energy)
   - Measures atmospheric instability
   - Critical for severe thunderstorm prediction
   - Range: 0-6000+ J/kg

2. **Lifted Index** (LI)
   - Temperature difference at 500 hPa
   - Negative values indicate instability
   - LI < -4: Extremely unstable

3. **K-Index**
   - Thunderstorm potential indicator
   - K > 35: Strong to severe thunderstorms
   - Combines temperature lapse rate and moisture

4. **Total Totals Index**
   - Severe weather likelihood
   - TT > 56: Severe thunderstorms likely
   - Used by operational meteorologists

5. **Bulk Wind Shear** (0-6 km)
   - Critical for supercell development
   - > 20 m/s: Strong shear environment
   - Tornado potential indicator

6. **Storm-Relative Helicity** (0-3 km)
   - Rotating updraft potential
   - > 250 m²/s²: High tornado potential
   - Used in tornado forecasting

7. **Significant Tornado Parameter** (STP)
   - Composite index for tornado risk
   - STP > 3: High tornado risk
   - Combines CAPE, shear, and helicity

8. **Supercell Composite Parameter** (SCP)
   - Supercell thunderstorm potential
   - SCP > 4: High supercell probability
   - Critical for severe weather forecasting

**National Importance**:
- Tornadoes cause $1+ billion in annual damages
- Severe thunderstorms: $15+ billion annually
- Early prediction saves lives and property
- Supports NOAA Storm Prediction Center mission

**Scientific Basis**:
All indices are based on peer-reviewed atmospheric science research and are used operationally by the National Weather Service.

### 3. Air Quality Monitoring

**Technology**: EPA AirNow API Integration

**Pollutants Monitored**:
- **PM2.5**: Fine particulate matter (< 2.5 μm)
- **PM10**: Coarse particulate matter (< 10 μm)
- **O3**: Ground-level ozone
- **NO2**: Nitrogen dioxide
- **SO2**: Sulfur dioxide
- **CO**: Carbon monoxide

**Air Quality Index (AQI) Categories**:
1. **Good** (0-50): Green
2. **Moderate** (51-100): Yellow
3. **Unhealthy for Sensitive Groups** (101-150): Orange
4. **Unhealthy** (151-200): Red
5. **Very Unhealthy** (201-300): Purple
6. **Hazardous** (301-500): Maroon

**Health Recommendations**:
- General public guidance
- Sensitive groups warnings
- Outdoor activity recommendations
- Real-time health impact assessment

**National Importance**:
- Air pollution causes 100,000+ premature deaths annually in U.S.
- $150+ billion in annual health costs
- Wildfire smoke affects millions
- Climate change increases air quality challenges

### 4. Climate Trend Analysis

**Technology**: Statistical Time Series Analysis

**Analyses Performed**:
1. **Linear Regression**
   - Trend slope (°C/year or mm/year)
   - R-squared (goodness of fit)
   - Statistical significance (p-value)

2. **Extreme Event Detection**
   - Heat waves (3+ consecutive days > 95th percentile)
   - Cold waves (3+ consecutive days < 5th percentile)
   - Extreme precipitation events
   - Record high/low temperatures

3. **Change Point Detection**
   - Identifies years with significant climate shifts
   - Statistical significance testing
   - Regime change identification

4. **Moving Averages**
   - 5-year smoothing for trend visualization
   - Reduces year-to-year variability
   - Highlights long-term patterns

**Data Period**: 1970-Present (50+ years)

**National Importance**:
- Climate change is a national security threat
- Informs adaptation strategies
- Supports infrastructure planning
- Guides agricultural policy
- Enables risk assessment

**Research Applications**:
- Climate change attribution studies
- Extreme event frequency analysis
- Regional climate model validation
- Impact assessment research

---

## Agricultural Climate Features

### 1. Drought Monitoring

**Metrics**:
- Drought index (0-4 scale)
- Soil moisture percentage
- Precipitation deficits
- Temperature anomalies

**Coverage**: All 3,221 U.S. counties

**National Importance**:
- Droughts cause $9+ billion in annual agricultural losses
- Affects food security
- Impacts water resources
- Influences commodity prices

### 2. Crop Risk Assessment

**Crops Analyzed**:
1. **Corn** (90+ million acres)
2. **Wheat** (45+ million acres)
3. **Soybeans** (85+ million acres)
4. **Cotton** (12+ million acres)
5. **Rice** (3+ million acres)

**Risk Factors** (Weighted):
- Heat stress (25%)
- Soil moisture (30%)
- Rainfall deficit (25%)
- Drought severity (20%)

**Growth Stage Tracking**:
- Planting
- Emergence
- Vegetative growth
- Flowering/pollination
- Grain fill/maturity

**National Importance**:
- U.S. agriculture: $400+ billion industry
- Feeds 330+ million Americans
- Major export commodity
- Rural economy backbone
- Food security critical infrastructure

### 3. Historical Climate Data

**Data Coverage**:
- 50 years of drought events (32,303 records)
- Daily climate data (99,851 records)
- Growing degree days tracking
- Temperature and precipitation baselines

**Applications**:
- Crop insurance risk assessment
- Agricultural planning
- Climate change impact studies
- Yield forecasting

---

## Technical Architecture

### Technology Stack

**Frontend**:
- Next.js 14 (React framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Leaflet (mapping)
- Recharts (data visualization)

**Backend**:
- Next.js API Routes
- PostgreSQL with PostGIS (spatial database)
- Supabase (database hosting)

**APIs Integrated**:
- NOAA Weather API
- EPA AirNow API
- Open-Meteo Historical Weather API
- USDA Agricultural Statistics

### Database Schema

**Tables**:
1. `counties` (3,221 records)
   - FIPS codes
   - Geographic boundaries (PostGIS geometry)
   - State information

2. `climate_data` (99,851 records)
   - Daily temperature, precipitation
   - Soil moisture
   - Drought indices

3. `crop_risk_index` (16,105 records)
   - 5 crops × 3,221 counties
   - Risk scores and components
   - Growth stage information

4. `drought_events` (32,303 records)
   - 50 years of historical data
   - Severity classifications
   - Duration tracking

5. `growing_degree_days`
   - Crop development tracking
   - Heat accumulation

### Performance Optimizations

**Pagination**:
- Automatic batching (1,000 records per request)
- Handles Supabase query limits
- Ensures complete data coverage

**Caching**:
- Materialized views for common queries
- Client-side data caching
- Optimized API responses

---

## Data Sources & APIs

### 1. NOAA (National Oceanic and Atmospheric Administration)

**APIs Used**:
- Weather Alerts API
- Weather Observations API
- Weather Forecast API

**Data Quality**:
- Official U.S. government source
- Real-time updates
- Operational meteorological data
- Used by emergency management

### 2. EPA (Environmental Protection Agency)

**API**: AirNow

**Data Quality**:
- Official air quality monitoring network
- Real-time sensor data
- Health-based standards
- Regulatory compliance data

### 3. Open-Meteo

**API**: Historical Weather API

**Data Quality**:
- Reanalysis datasets
- Global coverage
- Validated against observations
- Research-grade quality

### 4. USDA (U.S. Department of Agriculture)

**Data**:
- Agricultural statistics
- Crop production data
- County-level information

---

## National Importance

### 1. Life Safety

**Severe Weather**:
- Tornadoes: 70+ deaths/year average
- Flash floods: 90+ deaths/year
- Heat waves: 600+ deaths/year
- Lightning: 20+ deaths/year

**Early Warning Impact**:
- Lead time saves lives
- Enables evacuation
- Supports emergency response
- Reduces casualties

### 2. Economic Protection

**Weather-Related Losses**:
- Severe weather: $20+ billion/year
- Droughts: $9+ billion/year
- Floods: $8+ billion/year
- Wildfires: $10+ billion/year

**Platform Benefits**:
- Risk assessment
- Insurance applications
- Infrastructure planning
- Business continuity

### 3. Public Health

**Air Quality**:
- 100,000+ premature deaths/year
- Asthma: 25+ million Americans
- COPD: 16+ million Americans
- Wildfire smoke exposure

**Health Protection**:
- Real-time alerts
- Activity recommendations
- Vulnerable population protection
- Healthcare cost reduction

### 4. Food Security

**Agricultural Impact**:
- $400+ billion industry
- 2+ million farms
- 330+ million people fed
- Major export economy

**Climate Risks**:
- Drought reduces yields
- Heat stress damages crops
- Extreme weather destroys harvests
- Climate change threatens production

### 5. Climate Change Adaptation

**National Strategy**:
- Infrastructure resilience
- Agricultural adaptation
- Public health preparedness
- Economic planning

**Platform Contribution**:
- Trend identification
- Risk assessment
- Impact quantification
- Decision support

---

## Research Applications

### 1. Climate Science

**Use Cases**:
- Trend analysis
- Extreme event attribution
- Model validation
- Regional climate studies

**Data Export**:
- CSV format
- JSON format
- Research-ready datasets

### 2. Agricultural Research

**Applications**:
- Crop-climate relationships
- Yield forecasting
- Adaptation strategies
- Risk modeling

### 3. Public Health Research

**Studies**:
- Air quality health impacts
- Heat-related illness
- Climate-health connections
- Vulnerable populations

### 4. Economic Research

**Analysis**:
- Weather impact on economy
- Agricultural losses
- Insurance risk
- Climate adaptation costs

---

## Economic Impact

### Direct Benefits

1. **Agricultural Sector**: $400B+ industry protection
2. **Insurance Industry**: Improved risk assessment
3. **Emergency Management**: Cost-effective preparedness
4. **Public Health**: Reduced healthcare costs
5. **Infrastructure**: Climate-resilient planning

### Indirect Benefits

1. **Food Security**: Stable food supply
2. **Export Economy**: Agricultural trade
3. **Rural Communities**: Economic stability
4. **Climate Adaptation**: Long-term resilience
5. **Research Advancement**: Scientific progress

---

## Conclusion

AgriClime Sentinel demonstrates **substantial merit** and **national importance** by:

✅ **Protecting American lives** through severe weather prediction  
✅ **Safeguarding the economy** via agricultural risk assessment  
✅ **Advancing public health** with air quality monitoring  
✅ **Supporting climate science** through trend analysis  
✅ **Ensuring food security** with crop risk evaluation  

This platform represents a significant contribution to U.S. national interests in atmospheric science, agriculture, public health, and climate change adaptation.

---

**Developed by**: Nathaniel Oteng  
**Degree**: Master of Science in Atmospheric Science  
**Platform**: AgriClime Sentinel  
**Coverage**: 3,221 U.S. Counties  
**Data Points**: 248,000+ climate and atmospheric records

