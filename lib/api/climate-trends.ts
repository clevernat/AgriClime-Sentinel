/**
 * Climate Trends Analysis
 * Statistical analysis of long-term climate trends
 * Used for climate change research and impact assessment
 */

export interface TrendAnalysis {
  slope: number; // Rate of change per year
  intercept: number;
  rSquared: number; // Coefficient of determination (0-1)
  pValue: number; // Statistical significance
  isSignificant: boolean; // p < 0.05
  trendDirection: "Increasing" | "Decreasing" | "No Trend";
  percentChange: number; // Total percent change over period
  interpretation: string;
}

export interface ClimateTrendData {
  year: number;
  value: number;
}

export interface ExtremesAnalysis {
  recordHighs: number; // Count of record high events
  recordLows: number; // Count of record low events
  extremeHeatDays: number; // Days above 95th percentile
  extremeColdDays: number; // Days below 5th percentile
  extremePrecipitationDays: number; // Days above 95th percentile
  heatWaves: number; // Number of heat wave events
  coldWaves: number; // Number of cold wave events
}

/**
 * Calculate linear regression for trend analysis
 * Uses least squares method
 */
function linearRegression(data: ClimateTrendData[]): {
  slope: number;
  intercept: number;
  rSquared: number;
} {
  const n = data.length;

  // Calculate means
  const meanX = data.reduce((sum, d) => sum + d.year, 0) / n;
  const meanY = data.reduce((sum, d) => sum + d.value, 0) / n;

  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;

  for (const point of data) {
    numerator += (point.year - meanX) * (point.value - meanY);
    denominator += Math.pow(point.year - meanX, 2);
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Calculate R-squared
  let ssRes = 0; // Sum of squares of residuals
  let ssTot = 0; // Total sum of squares

  for (const point of data) {
    const predicted = slope * point.year + intercept;
    ssRes += Math.pow(point.value - predicted, 2);
    ssTot += Math.pow(point.value - meanY, 2);
  }

  const rSquared = 1 - ssRes / ssTot;

  return { slope, intercept, rSquared };
}

/**
 * Calculate statistical significance (p-value)
 * Using t-test for regression slope
 */
function calculatePValue(
  data: ClimateTrendData[],
  slope: number,
  intercept: number
): number {
  const n = data.length;

  // Calculate standard error
  let sumSquaredResiduals = 0;
  let sumSquaredX = 0;
  const meanX = data.reduce((sum, d) => sum + d.year, 0) / n;

  for (const point of data) {
    const predicted = slope * point.year + intercept;
    sumSquaredResiduals += Math.pow(point.value - predicted, 2);
    sumSquaredX += Math.pow(point.year - meanX, 2);
  }

  const standardError =
    Math.sqrt(sumSquaredResiduals / (n - 2)) / Math.sqrt(sumSquaredX);

  // Calculate t-statistic
  const tStat = Math.abs(slope / standardError);

  // Approximate p-value using t-distribution
  // For simplicity, using rough approximation
  // In production, use a proper statistical library
  if (tStat > 2.576) return 0.01; // p < 0.01
  if (tStat > 1.96) return 0.05; // p < 0.05
  if (tStat > 1.645) return 0.1; // p < 0.10
  return 0.2; // p > 0.10
}

/**
 * Analyze temperature trends
 */
export function analyzeTemperatureTrend(
  data: ClimateTrendData[]
): TrendAnalysis {
  if (data.length < 10) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      pValue: 1,
      isSignificant: false,
      trendDirection: "No Trend",
      percentChange: 0,
      interpretation:
        "Insufficient data for trend analysis (minimum 10 years required)",
    };
  }

  const { slope, intercept, rSquared } = linearRegression(data);
  const pValue = calculatePValue(data, slope, intercept);
  const isSignificant = pValue < 0.05;

  // Calculate percent change
  const firstYear = data[0].year;
  const lastYear = data[data.length - 1].year;
  const firstValue = slope * firstYear + intercept;
  const lastValue = slope * lastYear + intercept;
  const percentChange = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;

  // Determine trend direction
  let trendDirection: TrendAnalysis["trendDirection"] = "No Trend";
  if (isSignificant) {
    trendDirection = slope > 0 ? "Increasing" : "Decreasing";
  }

  // Generate interpretation
  let interpretation = "";
  if (isSignificant) {
    const direction = slope > 0 ? "warming" : "cooling";
    const rate = Math.abs(slope).toFixed(3);
    interpretation = `Statistically significant ${direction} trend of ${rate}°C per year (p < ${pValue.toFixed(
      2
    )}). `;
    interpretation += `Total change: ${
      percentChange > 0 ? "+" : ""
    }${percentChange.toFixed(2)}% over ${lastYear - firstYear} years.`;
  } else {
    interpretation = `No statistically significant trend detected (p = ${pValue.toFixed(
      2
    )}).`;
  }

  return {
    slope,
    intercept,
    rSquared,
    pValue,
    isSignificant,
    trendDirection,
    percentChange,
    interpretation,
  };
}

/**
 * Analyze precipitation trends
 */
export function analyzePrecipitationTrend(
  data: ClimateTrendData[]
): TrendAnalysis {
  if (data.length < 10) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      pValue: 1,
      isSignificant: false,
      trendDirection: "No Trend",
      percentChange: 0,
      interpretation:
        "Insufficient data for trend analysis (minimum 10 years required)",
    };
  }

  const { slope, intercept, rSquared } = linearRegression(data);
  const pValue = calculatePValue(data, slope, intercept);
  const isSignificant = pValue < 0.05;

  // Calculate percent change
  const firstYear = data[0].year;
  const lastYear = data[data.length - 1].year;
  const firstValue = slope * firstYear + intercept;
  const lastValue = slope * lastYear + intercept;
  const percentChange = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;

  // Determine trend direction
  let trendDirection: TrendAnalysis["trendDirection"] = "No Trend";
  if (isSignificant) {
    trendDirection = slope > 0 ? "Increasing" : "Decreasing";
  }

  // Generate interpretation
  let interpretation = "";
  if (isSignificant) {
    const direction = slope > 0 ? "wetter" : "drier";
    const rate = Math.abs(slope).toFixed(2);
    interpretation = `Statistically significant ${direction} trend of ${rate} mm per year (p < ${pValue.toFixed(
      2
    )}). `;
    interpretation += `Total change: ${
      percentChange > 0 ? "+" : ""
    }${percentChange.toFixed(2)}% over ${lastYear - firstYear} years.`;
  } else {
    interpretation = `No statistically significant trend detected (p = ${pValue.toFixed(
      2
    )}).`;
  }

  return {
    slope,
    intercept,
    rSquared,
    pValue,
    isSignificant,
    trendDirection,
    percentChange,
    interpretation,
  };
}

/**
 * Analyze extreme weather events
 */
export function analyzeExtremeEvents(
  temperatureData: number[],
  precipitationData: number[]
): ExtremesAnalysis {
  // Calculate percentiles
  const sortedTemp = [...temperatureData].sort((a, b) => a - b);
  const sortedPrecip = [...precipitationData].sort((a, b) => a - b);

  const temp95 = sortedTemp[Math.floor(sortedTemp.length * 0.95)];
  const temp5 = sortedTemp[Math.floor(sortedTemp.length * 0.05)];
  const precip95 = sortedPrecip[Math.floor(sortedPrecip.length * 0.95)];

  // Count extreme events
  const extremeHeatDays = temperatureData.filter((t) => t > temp95).length;
  const extremeColdDays = temperatureData.filter((t) => t < temp5).length;
  const extremePrecipitationDays = precipitationData.filter(
    (p) => p > precip95
  ).length;

  // Detect heat waves (3+ consecutive days above 95th percentile)
  let heatWaves = 0;
  let consecutiveHot = 0;
  for (const temp of temperatureData) {
    if (temp > temp95) {
      consecutiveHot++;
      if (consecutiveHot === 3) {
        heatWaves++;
      }
    } else {
      consecutiveHot = 0;
    }
  }

  // Detect cold waves (3+ consecutive days below 5th percentile)
  let coldWaves = 0;
  let consecutiveCold = 0;
  for (const temp of temperatureData) {
    if (temp < temp5) {
      consecutiveCold++;
      if (consecutiveCold === 3) {
        coldWaves++;
      }
    } else {
      consecutiveCold = 0;
    }
  }

  // Record highs and lows (simplified - would need historical records)
  const recordHighs = Math.floor(extremeHeatDays * 0.1);
  const recordLows = Math.floor(extremeColdDays * 0.1);

  return {
    recordHighs,
    recordLows,
    extremeHeatDays,
    extremeColdDays,
    extremePrecipitationDays,
    heatWaves,
    coldWaves,
  };
}

/**
 * Calculate moving average for smoothing trends
 */
export function calculateMovingAverage(
  data: ClimateTrendData[],
  windowSize: number = 5
): ClimateTrendData[] {
  const result: ClimateTrendData[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
    const window = data.slice(start, end);
    const avg = window.reduce((sum, d) => sum + d.value, 0) / window.length;

    result.push({
      year: data[i].year,
      value: avg,
    });
  }

  return result;
}

/**
 * Detect change points in climate data
 * Identifies years where significant shifts occurred
 */
export function detectChangePoints(data: ClimateTrendData[]): number[] {
  const changePoints: number[] = [];
  const windowSize = 10;

  for (let i = windowSize; i < data.length - windowSize; i++) {
    const before = data.slice(i - windowSize, i);
    const after = data.slice(i, i + windowSize);

    const meanBefore =
      before.reduce((sum, d) => sum + d.value, 0) / before.length;
    const meanAfter = after.reduce((sum, d) => sum + d.value, 0) / after.length;

    // If difference is significant (> 1 standard deviation)
    const stdDev = Math.sqrt(
      data.reduce((sum, d) => sum + Math.pow(d.value - meanBefore, 2), 0) /
        data.length
    );

    if (Math.abs(meanAfter - meanBefore) > stdDev) {
      changePoints.push(data[i].year);
    }
  }

  return changePoints;
}
