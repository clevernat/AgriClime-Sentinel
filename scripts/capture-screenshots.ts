#!/usr/bin/env ts-node

/**
 * Automated Screenshot Capture Script
 * 
 * This script uses Playwright to automatically capture screenshots
 * of the AgriClime Sentinel application for README documentation.
 * 
 * Usage: npm run screenshots
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const LIVE_DEMO_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// Screenshot configuration
const VIEWPORT = { width: 1920, height: 1080 };
const SCREENSHOT_QUALITY = 90; // PNG quality

interface ScreenshotConfig {
  name: string;
  filename: string;
  description: string;
  steps: (page: Page) => Promise<void>;
}

/**
 * Ensure screenshots directory exists
 */
function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    console.log('✅ Created screenshots directory');
  }
}

/**
 * Wait for network to be idle (all data loaded)
 */
async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Screenshot configurations
 */
const screenshots: ScreenshotConfig[] = [
  {
    name: 'Map View',
    filename: 'map-view.png',
    description: 'Interactive map showing all US counties with climate data layers',
    steps: async (page: Page) => {
      console.log('  📍 Navigating to map view...');
      await page.goto(LIVE_DEMO_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

      console.log('  ⏳ Waiting for map to load...');
      // Wait for the map container with longer timeout
      await page.waitForSelector('.leaflet-container', { timeout: 30000 });

      // Wait for map tiles to load
      console.log('  🗺️  Waiting for map tiles...');
      await page.waitForTimeout(5000);

      console.log('  📸 Capturing map view...');
    }
  },
  {
    name: 'Dashboard Overview',
    filename: 'dashboard-overview.png',
    description: 'Atmospheric Science Dashboard with Weather Alerts tab',
    steps: async (page: Page) => {
      console.log('  📍 Navigating to application...');
      await page.goto(LIVE_DEMO_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

      console.log('  ⏳ Waiting for map to load...');
      await page.waitForSelector('.leaflet-container', { timeout: 30000 });
      await page.waitForTimeout(3000);

      console.log('  🖱️  Clicking on a county...');
      // Try to click on a county polygon (SVG path element)
      try {
        const countyPath = await page.$('.leaflet-interactive');
        if (countyPath) {
          await countyPath.click();
          console.log('  ✅ Clicked on county polygon');
        } else {
          // Fallback to clicking at a position
          await page.click('.leaflet-container', { position: { x: 400, y: 300 } });
          console.log('  ✅ Clicked on map at position');
        }
      } catch (e) {
        console.log('  ⚠️  Error clicking county:', e);
      }

      console.log('  ⏳ Waiting for dashboard modal to appear...');
      // Wait for the dashboard modal to appear
      try {
        await page.waitForSelector('text=Atmospheric Science Dashboard', { timeout: 10000 });
        console.log('  ✅ Dashboard modal appeared');
      } catch (e) {
        console.log('  ⚠️  Dashboard modal did not appear');
      }

      await page.waitForTimeout(3000);

      console.log('  📸 Capturing dashboard overview...');
    }
  },
  {
    name: 'Climate Trends',
    filename: 'climate-trends.png',
    description: 'Climate Trends tab with historical temperature data',
    steps: async (page: Page) => {
      console.log('  📍 Navigating to application...');
      await page.goto(LIVE_DEMO_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

      console.log('  ⏳ Waiting for map to load...');
      await page.waitForSelector('.leaflet-container', { timeout: 30000 });
      await page.waitForTimeout(3000);

      console.log('  🖱️  Clicking on a county...');
      // Try to click on a county polygon (SVG path element)
      try {
        const countyPath = await page.$('.leaflet-interactive');
        if (countyPath) {
          await countyPath.click();
          console.log('  ✅ Clicked on county polygon');
        } else {
          // Fallback to clicking at a position
          await page.click('.leaflet-container', { position: { x: 400, y: 300 } });
          console.log('  ✅ Clicked on map at position');
        }
      } catch (e) {
        console.log('  ⚠️  Error clicking county:', e);
      }

      console.log('  ⏳ Waiting for dashboard modal to appear...');
      // Wait for the dashboard modal to appear - look for the header text
      try {
        await page.waitForSelector('text=Atmospheric Science Dashboard', { timeout: 10000 });
        console.log('  ✅ Dashboard modal appeared');
      } catch (e) {
        console.log('  ⚠️  Dashboard modal did not appear');
      }

      await page.waitForTimeout(3000);

      console.log('  🔄 Switching to Trends tab...');
      try {
        // Look for Trends tab button - the text is just "Trends"
        const buttons = await page.$$('button');
        console.log(`  🔍 Found ${buttons.length} buttons on page`);

        let found = false;
        for (const button of buttons) {
          const text = await button.textContent();
          const trimmedText = text?.trim() || '';

          if (trimmedText === 'Trends') {
            console.log('  ✅ Found Trends tab, clicking...');
            await button.click();
            await page.waitForTimeout(5000); // Wait for chart to render
            found = true;
            break;
          }
        }
        if (!found) {
          console.log('  ⚠️  Could not find Trends tab button');
        }
      } catch (e) {
        console.log('  ⚠️  Error clicking Trends tab:', e);
      }

      console.log('  📸 Capturing climate trends...');
    }
  }
];

/**
 * Capture a single screenshot
 */
async function captureScreenshot(
  page: Page,
  config: ScreenshotConfig
): Promise<void> {
  console.log(`\n📸 Capturing: ${config.name}`);
  console.log(`   Description: ${config.description}`);
  
  try {
    // Execute the steps for this screenshot
    await config.steps(page);
    
    // Capture the screenshot
    const filepath = path.join(SCREENSHOTS_DIR, config.filename);
    await page.screenshot({
      path: filepath,
      fullPage: false,
      type: 'png',
    });
    
    // Check file size
    const stats = fs.statSync(filepath);
    const sizeKB = Math.round(stats.size / 1024);
    
    console.log(`   ✅ Saved: ${config.filename} (${sizeKB} KB)`);
    
    if (sizeKB > 500) {
      console.log(`   ⚠️  Warning: File size exceeds 500KB. Consider compressing.`);
    }
    
  } catch (error) {
    console.error(`   ❌ Error capturing ${config.name}:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 AgriClime Sentinel - Automated Screenshot Capture\n');
  console.log(`📍 Target URL: ${LIVE_DEMO_URL}`);
  console.log(`📁 Output Directory: ${SCREENSHOTS_DIR}\n`);
  
  // Ensure screenshots directory exists
  ensureScreenshotsDir();
  
  let browser: Browser | null = null;
  
  try {
    console.log('🌐 Launching browser...');
    browser = await chromium.launch({
      headless: true, // Set to false to see the browser in action
    });
    
    console.log('📄 Creating new page...');
    const page = await browser.newPage({
      viewport: VIEWPORT,
    });
    
    // Capture all screenshots
    for (const config of screenshots) {
      await captureScreenshot(page, config);
    }
    
    console.log('\n✅ All screenshots captured successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Review screenshots in the screenshots/ directory');
    console.log('   2. If file sizes > 500KB, compress them using TinyPNG or similar');
    console.log('   3. Run: npm run update-readme (or manually update README.md)');
    console.log('   4. Commit and push to GitHub\n');
    
  } catch (error) {
    console.error('\n❌ Error during screenshot capture:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Run the script
main().catch(console.error);

