# Atmospheric Science Features

## Overview

AgriClime Sentinel includes comprehensive atmospheric science capabilities designed for meteorologists, atmospheric scientists, emergency managers, and researchers.

---

## Features

### 1. 🌪️ Real-Time Weather Alerts

**Source**: NOAA Weather API

**Alert Types**:
- Tornado Warning
- Tornado Watch
- Severe Thunderstorm Warning
- Severe Thunderstorm Watch
- Flash Flood Warning
- Flash Flood Watch
- Winter Storm Warning
- Winter Storm Watch
- Heat Advisory
- Excessive Heat Warning
- Wind Advisory
- High Wind Warning
- And all other NWS alert types

**API Endpoints**:

```bash
# Get alerts by coordinates
GET /api/weather-alerts?lat=40.7128&lon=-74.0060

# Get alerts by county FIPS code
GET /api/weather-alerts?fips=36061

# Get all active U.S. alerts
GET /api/weather-alerts?all=true
```

**Response Format**:
```json
{
  "success": true,
  "count": 2,
  "alerts": [
    {
      "id": "...",
      "event": "Tornado Warning",
      "headline": "Tornado Warning issued for...",
      "description": "At 345 PM CDT, a severe thunderstorm capable of producing a tornado was located...",
      "severity": "Extreme",
      "urgency": "Immediate",
      "certainty": "Observed",
      "onset": "2024-05-15T15:45:00-05:00",
      "expires": "2024-05-15T16:15:00-05:00",
      "areaDesc": "Smith County",
      "instruction": "Take cover now! Move to a basement or an interior room..."
    }
  ]
}
```

---

### 2. ⛈️ Severe Weather Prediction

**Technology**: Atmospheric Instability Indices

#### Indices Calculated

##### CAPE (Convective Available Potential Energy)
- **Units**: J/kg (Joules per kilogram)
- **Range**: 0 to 6000+
- **Interpretation**:
  - 0-1000: Weak instability
  - 1000-2500: Moderate instability
  - 2500-4000: Strong instability
  - 4000+: Extreme instability

**Physical Meaning**: Amount of energy available for convection. Higher values indicate greater potential for severe thunderstorms.

##### Lifted Index (LI)
- **Units**: °C
- **Range**: +10 to -10
- **Interpretation**:
  - LI > 2: Stable atmosphere
  - LI 0 to 2: Marginally unstable
  - LI -2 to 0: Moderately unstable
  - LI -4 to -2: Very unstable
  - LI < -4: Extremely unstable

**Physical Meaning**: Temperature difference between a lifted air parcel and the environment at 500 hPa. Negative values indicate instability.

##### K-Index
- **Units**: Dimensionless
- **Range**: 0 to 40+
- **Interpretation**:
  - K < 20: Thunderstorms unlikely
  - K 20-25: Isolated thunderstorms possible
  - K 26-30: Widely scattered thunderstorms
  - K 31-35: Numerous thunderstorms
  - K > 35: Strong to severe thunderstorms

**Physical Meaning**: Combines temperature lapse rate and low-level moisture to assess thunderstorm potential.

##### Total Totals Index (TT)
- **Units**: Dimensionless
- **Range**: 30 to 60+
- **Interpretation**:
  - TT < 44: Thunderstorms unlikely
  - TT 44-50: Thunderstorms possible
  - TT 51-52: Moderate thunderstorms
  - TT 53-56: Strong thunderstorms likely
  - TT > 56: Severe thunderstorms likely

**Physical Meaning**: Sum of Cross Totals (moisture) and Vertical Totals (lapse rate).

##### Bulk Wind Shear (0-6 km)
- **Units**: m/s
- **Range**: 0 to 40+
- **Interpretation**:
  - < 10 m/s: Weak shear
  - 10-20 m/s: Moderate shear
  - 20-30 m/s: Strong shear
  - > 30 m/s: Extreme shear

**Physical Meaning**: Change in wind speed and direction with height. Critical for supercell development.

##### Storm-Relative Helicity (0-3 km)
- **Units**: m²/s²
- **Range**: 0 to 500+
- **Interpretation**:
  - < 100: Low tornado potential
  - 100-250: Moderate tornado potential
  - 250-400: High tornado potential
  - > 400: Extreme tornado potential

**Physical Meaning**: Measures potential for rotating updrafts. Critical for tornado forecasting.

##### Significant Tornado Parameter (STP)
- **Units**: Dimensionless
- **Range**: 0 to 10+
- **Interpretation**:
  - STP < 1: Low tornado risk
  - STP 1-3: Moderate tornado risk
  - STP 3-6: High tornado risk
  - STP > 6: Extreme tornado risk

**Physical Meaning**: Composite index combining CAPE, helicity, and shear. Designed specifically for significant tornado forecasting.

##### Supercell Composite Parameter (SCP)
- **Units**: Dimensionless
- **Range**: 0 to 10+
- **Interpretation**:
  - SCP < 1: Low supercell probability
  - SCP 1-4: Moderate supercell probability
  - SCP 4-8: High supercell probability
  - SCP > 8: Extreme supercell probability

**Physical Meaning**: Composite index for supercell thunderstorm potential.

#### API Endpoint

```bash
# Get severe weather indices
GET /api/severe-weather?lat=40.7128&lon=-74.0060&sample=true
```

**Response Format**:
```json
{
  "success": true,
  "indices": {
    "cape": 2500,
    "cin": -50,
    "liftedIndex": -4.5,
    "kIndex": 32,
    "totalTotals": 54,
    "showalterIndex": -3.2,
    "bulkShear0to6km": 25,
    "stormRelativeHelicity0to3km": 300,
    "significantTornadoParameter": 4.2,
    "supercellCompositeParameter": 6.5,
    "tornadoPotential": "High",
    "severeThunderstormPotential": "High",
    "hailPotential": "Moderate"
  }
}
```

---

### 3. 🌫️ Air Quality Monitoring

**Source**: EPA AirNow API

#### Pollutants Monitored

1. **PM2.5** (Fine Particulate Matter)
   - Size: < 2.5 micrometers
   - Sources: Combustion, wildfires, industrial
   - Health: Penetrates deep into lungs

2. **PM10** (Coarse Particulate Matter)
   - Size: < 10 micrometers
   - Sources: Dust, pollen, mold
   - Health: Respiratory irritation

3. **O3** (Ozone)
   - Ground-level ozone
   - Sources: Vehicle emissions + sunlight
   - Health: Respiratory damage

4. **NO2** (Nitrogen Dioxide)
   - Sources: Vehicle emissions, power plants
   - Health: Respiratory inflammation

5. **SO2** (Sulfur Dioxide)
   - Sources: Coal/oil combustion
   - Health: Respiratory problems

6. **CO** (Carbon Monoxide)
   - Sources: Incomplete combustion
   - Health: Reduces oxygen delivery

#### Air Quality Index (AQI)

| AQI Range | Category | Color | Health Effects |
|-----------|----------|-------|----------------|
| 0-50 | Good | Green | Air quality is satisfactory |
| 51-100 | Moderate | Yellow | Acceptable for most people |
| 101-150 | Unhealthy for Sensitive Groups | Orange | Sensitive groups may experience effects |
| 151-200 | Unhealthy | Red | Everyone may begin to experience effects |
| 201-300 | Very Unhealthy | Purple | Health alert: everyone affected |
| 301-500 | Hazardous | Maroon | Health warnings of emergency conditions |

#### API Endpoints

```bash
# Get current air quality by coordinates
GET /api/air-quality?lat=40.7128&lon=-74.0060

# Get air quality by ZIP code
GET /api/air-quality?zip=10001

# Get air quality forecast
GET /api/air-quality?lat=40.7128&lon=-74.0060&forecast=true&date=2024-05-15
```

**Response Format**:
```json
{
  "success": true,
  "overall": {
    "aqi": 85,
    "category": {
      "number": 2,
      "name": "Moderate",
      "color": "#FFFF00"
    },
    "dominantPollutant": "PM2.5"
  },
  "recommendations": {
    "general": "Air quality is acceptable for most people.",
    "sensitiveGroups": "Unusually sensitive people should consider limiting prolonged outdoor exertion.",
    "activities": "Most outdoor activities are safe."
  },
  "observations": [
    {
      "parameterName": "PM2.5",
      "aqi": 85,
      "category": {
        "number": 2,
        "name": "Moderate"
      }
    },
    {
      "parameterName": "O3",
      "aqi": 45,
      "category": {
        "number": 1,
        "name": "Good"
      }
    }
  ]
}
```

---

### 4. 📈 Climate Trend Analysis

**Data Period**: 1970-Present (50+ years)

#### Statistical Methods

##### Linear Regression
- **Slope**: Rate of change per year (°C/year or mm/year)
- **R-squared**: Goodness of fit (0-1)
- **P-value**: Statistical significance
- **Interpretation**: Trend direction and magnitude

##### Extreme Event Analysis
- **Heat Waves**: 3+ consecutive days above 95th percentile
- **Cold Waves**: 3+ consecutive days below 5th percentile
- **Extreme Precipitation**: Days above 95th percentile
- **Record Events**: New temperature/precipitation records

##### Change Point Detection
- Identifies years with significant climate shifts
- Statistical significance testing
- Regime change identification

#### API Endpoint

```bash
# Get temperature trend analysis
GET /api/climate-trends?fips=36061&type=temperature&startYear=1970&endYear=2024

# Get precipitation trend analysis
GET /api/climate-trends?fips=36061&type=precipitation&startYear=1970&endYear=2024
```

**Response Format**:
```json
{
  "success": true,
  "fips": "36061",
  "type": "temperature",
  "period": {
    "startYear": 1970,
    "endYear": 2024,
    "yearsAnalyzed": 54
  },
  "trend": {
    "slope": 0.025,
    "intercept": 10.5,
    "rSquared": 0.72,
    "pValue": 0.001,
    "isSignificant": true,
    "trendDirection": "Increasing",
    "percentChange": 12.5,
    "interpretation": "Statistically significant warming trend of 0.025°C per year (p < 0.01). Total change: +12.5% over 54 years."
  },
  "extremes": {
    "recordHighs": 8,
    "recordLows": 2,
    "extremeHeatDays": 145,
    "extremeColdDays": 67,
    "extremePrecipitationDays": 89,
    "heatWaves": 12,
    "coldWaves": 5
  }
}
```

---

## Use Cases

### 1. Emergency Management
- Real-time weather alerts
- Severe weather prediction
- Public safety decisions
- Evacuation planning

### 2. Public Health
- Air quality monitoring
- Heat wave warnings
- Vulnerable population protection
- Healthcare resource planning

### 3. Research
- Climate change studies
- Extreme event analysis
- Trend identification
- Model validation

### 4. Agriculture
- Frost warnings
- Severe weather impact
- Growing season planning
- Crop protection

### 5. Aviation
- Severe weather avoidance
- Turbulence prediction
- Visibility forecasting
- Flight planning

### 6. Energy Sector
- Demand forecasting
- Renewable energy planning
- Infrastructure protection
- Grid management

---

## Data Quality

### NOAA Weather Data
- **Source**: National Weather Service
- **Update Frequency**: Real-time
- **Quality Control**: Operational standards
- **Reliability**: Government-grade

### EPA Air Quality Data
- **Source**: AirNow monitoring network
- **Update Frequency**: Hourly
- **Quality Control**: EPA standards
- **Reliability**: Regulatory-grade

### Climate Data
- **Source**: NOAA Climate Data
- **Period**: 1970-Present
- **Quality Control**: Homogenized datasets
- **Reliability**: Research-grade

---

## Scientific References

1. **CAPE and Severe Weather**: Thompson et al. (2003), "Close Proximity Soundings within Supercell Environments Obtained from the Rapid Update Cycle"

2. **Tornado Forecasting**: Thompson et al. (2012), "Effective Storm-Relative Helicity and Bulk Shear in Supercell Thunderstorm Environments"

3. **Air Quality Health Effects**: EPA (2024), "Integrated Science Assessment for Particulate Matter"

4. **Climate Trends**: IPCC (2021), "Climate Change 2021: The Physical Science Basis"

---

## Future Enhancements

- [ ] Real-time radar integration (NEXRAD)
- [ ] Satellite imagery (GOES-16/17)
- [ ] Hurricane track forecasting
- [ ] Wildfire smoke forecasting
- [ ] Climate model projections (CMIP6)
- [ ] Machine learning predictions
- [ ] Mobile app development
- [ ] Alert notification system

---

**For technical support or questions, please refer to the main documentation.**

