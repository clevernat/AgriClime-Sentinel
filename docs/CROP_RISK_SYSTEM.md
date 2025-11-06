# Crop Risk Assessment System

## Overview

The AgriClime Sentinel Crop Risk Assessment System provides real-time crop yield risk analysis for all 3,221 U.S. counties across 5 major crop types: **Corn**, **Wheat**, **Soybeans**, **Cotton**, and **Rice**.

## Supported Crops

### 1. **Corn**
- **Optimal Temperature**: 18-30°C
- **Critical Heat Threshold**: 35°C
- **Optimal Soil Moisture**: 25-40%
- **Optimal Monthly Precipitation**: 75-125mm
- **Drought Sensitivity**: High (0.8)
- **Growing Season**: April-September
- **Growth Stages**:
  - April: Planting
  - May: Emergence
  - June: Vegetative
  - July: Tasseling/Silking (Critical)
  - August: Grain Fill
  - September: Maturity

### 2. **Wheat**
- **Optimal Temperature**: 15-25°C
- **Critical Heat Threshold**: 32°C
- **Optimal Soil Moisture**: 20-35%
- **Optimal Monthly Precipitation**: 50-100mm
- **Drought Sensitivity**: Medium (0.6)
- **Growing Season**: March-July (Spring Wheat)
- **Growth Stages**:
  - March: Planting
  - April: Tillering
  - May: Stem Extension
  - June: Heading (Critical)
  - July: Grain Fill/Maturity

### 3. **Soybeans**
- **Optimal Temperature**: 20-30°C
- **Critical Heat Threshold**: 35°C
- **Optimal Soil Moisture**: 25-40%
- **Optimal Monthly Precipitation**: 75-125mm
- **Drought Sensitivity**: High (0.75)
- **Growing Season**: May-September
- **Growth Stages**:
  - May: Planting
  - June: Vegetative
  - July: Flowering (Critical)
  - August: Pod Fill
  - September: Maturity

### 4. **Cotton**
- **Optimal Temperature**: 21-32°C
- **Critical Heat Threshold**: 38°C
- **Optimal Soil Moisture**: 20-35%
- **Optimal Monthly Precipitation**: 50-100mm
- **Drought Sensitivity**: Medium-High (0.7)
- **Growing Season**: April-September
- **Growth Stages**:
  - April: Planting
  - May: Emergence
  - June: Squaring
  - July: Flowering (Critical)
  - August: Boll Development
  - September: Maturity

### 5. **Rice**
- **Optimal Temperature**: 20-35°C
- **Critical Heat Threshold**: 40°C
- **Optimal Soil Moisture**: 35-50% (Higher water requirement)
- **Optimal Monthly Precipitation**: 100-200mm
- **Drought Sensitivity**: Very High (0.9)
- **Growing Season**: April-September
- **Growth Stages**:
  - April: Planting/Flooding
  - May: Tillering
  - June: Stem Extension
  - July: Panicle Initiation (Critical)
  - August: Flowering/Grain Fill
  - September: Maturity

## Risk Score Calculation

The overall **Risk Score** (0-100) is calculated as a weighted average of four component scores:

### Component Scores

#### 1. **Heat Stress Score** (25% weight)
- Measures temperature deviation from optimal range
- **Critical**: Temperature > crop-specific threshold
- **Moderate**: Temperature above optimal but below critical
- **Low**: Temperature below optimal range

#### 2. **Soil Moisture Score** (30% weight)
- Measures soil moisture adequacy
- **Critical**: Below minimum threshold (100 points)
- **High**: Below optimal range
- **Moderate**: Above optimal range (waterlogging)

#### 3. **Rainfall Deficit Score** (25% weight)
- Measures precipitation adequacy
- **High**: Below optimal monthly precipitation
- **Moderate**: Above optimal (excess rainfall)

#### 4. **Drought Severity Score** (20% weight)
- Based on USDM drought index (D0-D4)
- Weighted by crop-specific drought sensitivity
- Formula: `(drought_index / 5) × 100 × sensitivity`

### Overall Risk Score Formula

```
Risk Score = (Heat Stress × 0.25) + 
             (Soil Moisture × 0.30) + 
             (Rainfall Deficit × 0.25) + 
             (Drought Severity × 0.20)
```

### Risk Score Interpretation

| Score Range | Risk Level | Description |
|-------------|------------|-------------|
| 0-20 | **Low** | Optimal growing conditions |
| 21-40 | **Moderate** | Some stress factors present |
| 41-60 | **High** | Multiple stress factors |
| 61-80 | **Very High** | Severe stress conditions |
| 81-100 | **Critical** | Extreme risk to crop yield |

## Growing Season vs Off-Season

- **During Growing Season**: Risk scores are calculated based on current climate conditions
- **Off-Season**: Risk score = 0, Growth Stage = "Off-Season"
- This ensures risk assessment is only active when crops are actually growing

## Data Updates

- **Frequency**: Daily updates based on current climate data
- **Coverage**: All 3,221 U.S. counties
- **Total Records**: 16,105 (3,221 counties × 5 crops)

## API Usage

### Get Crop Risk Data

```bash
GET /api/map-data?layer=crop_risk&cropType=corn
```

**Supported Crop Types**: `corn`, `wheat`, `soybeans`, `cotton`, `rice`

### Response Format

```json
{
  "layer": "crop_risk",
  "data": [
    {
      "county_fips": "19001",
      "crop_type": "corn",
      "date": "2025-11-05",
      "risk_score": 45,
      "rainfall_deficit_score": 60,
      "soil_moisture_score": 40,
      "heat_stress_score": 30,
      "drought_severity_score": 50,
      "growth_stage": "Grain Fill"
    }
  ]
}
```

## Visualization

The crop risk layer displays on the map with color-coded counties:

- **Green**: Low risk (0-20)
- **Yellow**: Moderate risk (21-40)
- **Orange**: High risk (41-60)
- **Red**: Very high risk (61-80)
- **Dark Red**: Critical risk (81-100)

## Use Cases

1. **Farmers**: Monitor crop-specific risks in their county
2. **Agricultural Insurers**: Assess regional crop risk exposure
3. **Policy Makers**: Identify areas needing agricultural support
4. **Researchers**: Analyze climate impact on different crops
5. **Supply Chain**: Anticipate potential crop yield issues

## Technical Implementation

- **Database Table**: `crop_risk_index`
- **Script**: `scripts/populate-crop-risk-data.ts`
- **API Function**: `getAllCropRiskIndices()` in `lib/api/climate-data.ts`
- **UI Component**: `LayerSelector` with crop type dropdown

## Future Enhancements

1. **Historical Trends**: Track crop risk over multiple seasons
2. **Yield Predictions**: Integrate with actual yield data
3. **Multi-Year Analysis**: Compare current risk to historical averages
4. **Crop-Specific Alerts**: Notify when risk exceeds thresholds
5. **Regional Aggregation**: State and national crop risk summaries

