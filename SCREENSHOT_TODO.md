# 📸 TODO: Add Screenshots to README

This file tracks the remaining task of adding screenshots to the README.

---

## ✅ Completed

- [x] Updated README.md with comprehensive documentation
- [x] Added screenshot placeholders in README
- [x] Created `docs/SCREENSHOT_GUIDE.md` with detailed instructions
- [x] Documented data architecture in README
- [x] Added all necessary sections and links
- [x] Committed and pushed to GitHub

---

## 📋 Next Steps

### 1. Create Screenshots Directory

```bash
mkdir screenshots
```

### 2. Take Required Screenshots

Follow the guide in `docs/SCREENSHOT_GUIDE.md` to capture:

#### **Required Screenshots:**

1. **`screenshots/map-view.png`**
   - Full map view with data layer selected
   - Show all US counties
   - Include legend and layer selector
   - Recommended: Select "Drought Status" or "30-Day Precipitation"

2. **`screenshots/dashboard-overview.png`**
   - Dashboard with "Weather Alerts" tab active
   - Show county name and coordinates
   - Include all 4 tab buttons
   - Recommended: Select a county with active alerts (e.g., California, Texas)

3. **`screenshots/climate-trends.png`**
   - Dashboard with "Climate Trends" tab active
   - Show the temperature trend chart
   - Include trend statistics and interpretation
   - Recommended: Select any county (all have 55 years of data)

#### **Optional Screenshots:**

4. **`screenshots/air-quality.png`**
   - Dashboard with "Air Quality" tab active
   - Show AQI value, category, and pollutant readings
   - Recommended: Select a major city (Los Angeles, New York, Chicago)

5. **`screenshots/severe-weather.png`**
   - Dashboard with "Severe Weather" tab active
   - Show atmospheric sounding chart and indices
   - Recommended: Select any county

### 3. Optimize Images

Use tools to compress images to <500KB:
- **Online:** [TinyPNG](https://tinypng.com/)
- **macOS:** Preview (Export with reduced quality)
- **Command line:** `pngquant` or `imagemagick`

### 4. Update README

Replace the TODO comments in README.md with actual image paths:

**Current (line 19):**
```markdown
<!-- TODO: Add screenshot of map with data layers -->
```

**Replace with:**
```markdown
![Interactive Map View](screenshots/map-view.png)
```

**Current (line 25):**
```markdown
<!-- TODO: Add screenshot of dashboard with all 4 tabs -->
```

**Replace with:**
```markdown
![Atmospheric Science Dashboard](screenshots/dashboard-overview.png)
```

**Current (line 31):**
```markdown
<!-- TODO: Add screenshot of climate trends tab -->
```

**Replace with:**
```markdown
![Climate Trends Analysis](screenshots/climate-trends.png)
```

### 5. Commit and Push

```bash
git add screenshots/
git add README.md
git commit -m "docs: Add screenshots to README

Added screenshots:
- Map view with data layers
- Atmospheric Science Dashboard
- Climate Trends analysis
- Air Quality monitoring (optional)
- Severe Weather indices (optional)

All images optimized to <500KB and 1920x1080+ resolution"
git push origin main
```

### 6. Verify on GitHub

- Go to https://github.com/clevernat/AgriClime-Sentinel
- Check that all images display correctly
- Verify image quality and sizing

---

## 📝 Screenshot Specifications

### Resolution
- **Minimum:** 1920x1080 (Full HD)
- **Recommended:** 2560x1440 (2K)

### Format
- **Format:** PNG
- **Max Size:** 500KB per image

### Content
- Clean UI (no dev tools, no personal info)
- Good data (select counties with interesting data)
- Full context (include legends, labels, UI elements)
- Wait for all data to load before capturing

---

## 🎯 Quick Capture Guide

### Map View Screenshot
1. Open http://localhost:3000 or live demo
2. Select "Drought Status" layer
3. Zoom to show entire US
4. Press Cmd+Shift+4 (macOS) or Windows+Shift+S (Windows)
5. Save as `screenshots/map-view.png`

### Dashboard Screenshot
1. Click on Los Angeles County, CA (or any county)
2. Wait for dashboard to load
3. Make sure "Weather Alerts" tab is selected
4. Capture the entire dashboard
5. Save as `screenshots/dashboard-overview.png`

### Climate Trends Screenshot
1. Click on any county
2. Click "Climate Trends" tab
3. Wait for chart to render
4. Capture the dashboard
5. Save as `screenshots/climate-trends.png`

---

## ✅ Checklist

Before marking this task complete:

- [ ] Created `screenshots/` directory
- [ ] Captured map-view.png
- [ ] Captured dashboard-overview.png
- [ ] Captured climate-trends.png
- [ ] (Optional) Captured air-quality.png
- [ ] (Optional) Captured severe-weather.png
- [ ] All images are PNG format
- [ ] All images are <500KB
- [ ] All images are 1920x1080+
- [ ] Updated README.md with image paths
- [ ] Removed TODO comments from README
- [ ] Committed and pushed to GitHub
- [ ] Verified images display on GitHub

---

## 📚 Reference

- **Screenshot Guide:** `docs/SCREENSHOT_GUIDE.md`
- **README:** `README.md` (lines 15-34 for screenshot section)
- **Live Demo:** https://agri-clime-sentinel-ng1cxkfz1-clevernats-projects.vercel.app

---

**Once all screenshots are added, delete this file!**

