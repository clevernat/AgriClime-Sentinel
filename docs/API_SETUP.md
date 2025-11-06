# API Setup Guide

This guide will help you set up the external API keys needed for AgriClime Sentinel's Atmospheric Science Dashboard.

## 📊 Data Sources Overview

### ✅ Currently Working (No Setup Required)

1. **Weather Alerts** - NOAA Weather API (free, no key required)
2. **Climate Trends** - Your PostgreSQL/Supabase database
3. **Map Data** - Your PostgreSQL/Supabase database

### 🔑 Requires API Key Setup

4. **Air Quality Data** - AirNow API (free, requires registration)

### 📝 Sample Data (No Real API Available Yet)

5. **Severe Weather Indices** - Would require NOAA RAP/RUC model integration

---

## 🌬️ Setting Up AirNow API (Air Quality Data)

### Step 1: Request an API Key

1. Visit the AirNow API documentation: https://docs.airnowapi.org/
2. Click on "Request an API Key" or go to: https://docs.airnowapi.org/account/request/
3. Fill out the registration form:
   - **Email**: Your email address
   - **Organization**: Your name or "Personal Project"
   - **Purpose**: "Educational/Research - Climate monitoring dashboard"
   - **Website**: Optional (you can use your GitHub repo URL)
4. Submit the form
5. Check your email for the API key (usually arrives within a few minutes)

### Step 2: Add the API Key to Your Environment

1. Open the `.env` file in the root of your project
2. Find the line that says:
   ```
   AIRNOW_API_KEY=your_airnow_api_key_here
   ```
3. Replace `your_airnow_api_key_here` with your actual API key:
   ```
   AIRNOW_API_KEY=ABC123-YOUR-ACTUAL-KEY-HERE
   ```
4. Save the file

### Step 3: Restart Your Development Server

1. Stop the development server (press `Ctrl+C` in the terminal)
2. Start it again:
   ```bash
   npm run dev
   ```
3. The Air Quality tab should now show real data!

---

## 🧪 Testing the API

### Test Air Quality API

Once you've added your AirNow API key, you can test it by:

1. Opening your browser to: http://localhost:3000
2. Clicking on any county on the map
3. Switching to the **Atmospheric Science** dashboard
4. Clicking on the **Air Quality** tab
5. You should see real air quality data instead of sample data

### Check the Terminal

Look for these messages in your terminal:
- ✅ **Good**: No "AirNow API key not configured" messages
- ✅ **Good**: Air quality data being fetched successfully
- ❌ **Bad**: "AirNow API key not configured" - means the key isn't set up correctly

---

## 📈 Data Availability by Tab

| Tab | Data Source | Status | Setup Required |
|-----|-------------|--------|----------------|
| **Weather Alerts** | NOAA Weather API | ✅ Real Data | None |
| **Severe Weather** | Sample Data | ⚠️ Sample | Would need NOAA RAP/RUC integration |
| **Air Quality** | AirNow API | 🔑 Needs Key | Follow steps above |
| **Climate Trends** | Your Database | ✅ Real Data | None |

---

## 🔒 Security Notes

- **Never commit your `.env` file to Git** - it contains sensitive API keys
- The `.env` file is already in `.gitignore` to prevent accidental commits
- If you accidentally expose your API key, request a new one from AirNow
- The `.env.example` file shows the structure without real keys

---

## 🆘 Troubleshooting

### "AirNow API key not configured" message

**Problem**: The API key isn't being read from the environment file.

**Solutions**:
1. Make sure you saved the `.env` file after adding the key
2. Restart your development server (`Ctrl+C` then `npm run dev`)
3. Check that the key is on the correct line in `.env`:
   ```
   AIRNOW_API_KEY=your_actual_key_here
   ```
4. Make sure there are no extra spaces or quotes around the key

### Air Quality data shows "Sample Data"

**Problem**: The API call is failing even with a valid key.

**Solutions**:
1. Check your internet connection
2. Verify your API key is correct (copy-paste from the AirNow email)
3. Check the browser console for error messages (F12 → Console tab)
4. The AirNow API has rate limits - if you're making too many requests, wait a few minutes

### API Key Request Not Received

**Problem**: You didn't receive the API key email from AirNow.

**Solutions**:
1. Check your spam/junk folder
2. Wait up to 24 hours (usually much faster)
3. Try requesting again with a different email address
4. Contact AirNow support if the issue persists

---

## 🚀 Future Enhancements

### Severe Weather Real Data Integration

To get real severe weather indices, you would need to:

1. Integrate with NOAA's RAP (Rapid Refresh) or RUC (Rapid Update Cycle) models
2. Or use weather balloon (radiosonde) observation data
3. Parse atmospheric sounding data (pressure, temperature, dewpoint profiles)
4. Calculate indices from the real atmospheric profiles

This is a more complex integration and would require:
- Understanding of atmospheric science and thermodynamics
- Parsing GRIB2 or NetCDF data formats
- Significant computational resources for model data processing

For now, the sample data provides realistic values that vary by location.

---

## 📞 Support

If you encounter any issues:
1. Check the terminal logs for error messages
2. Check the browser console (F12) for client-side errors
3. Verify all environment variables are set correctly
4. Restart the development server

---

**Last Updated**: January 2025

