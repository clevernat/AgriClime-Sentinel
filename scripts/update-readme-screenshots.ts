#!/usr/bin/env ts-node

/**
 * Update README.md with Screenshot Paths
 * 
 * This script automatically replaces the TODO comments in README.md
 * with the actual screenshot image paths.
 * 
 * Usage: npm run update-readme
 */

import * as fs from 'fs';
import * as path from 'path';

const README_PATH = path.join(__dirname, '..', 'README.md');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

interface Replacement {
  oldText: string;
  newText: string;
  description: string;
}

const replacements: Replacement[] = [
  {
    oldText: '<!-- TODO: Add screenshot of map with data layers -->',
    newText: '![Interactive Map View](screenshots/map-view.png)',
    description: 'Map View screenshot'
  },
  {
    oldText: '<!-- TODO: Add screenshot of dashboard with all 4 tabs -->',
    newText: '![Atmospheric Science Dashboard](screenshots/dashboard-overview.png)',
    description: 'Dashboard Overview screenshot'
  },
  {
    oldText: '<!-- TODO: Add screenshot of climate trends tab -->',
    newText: '![Climate Trends Analysis](screenshots/climate-trends.png)',
    description: 'Climate Trends screenshot'
  }
];

/**
 * Check if screenshot files exist
 */
function checkScreenshotsExist(): boolean {
  const requiredFiles = [
    'map-view.png',
    'dashboard-overview.png',
    'climate-trends.png'
  ];
  
  let allExist = true;
  
  console.log('📁 Checking for screenshot files...\n');
  
  for (const file of requiredFiles) {
    const filepath = path.join(SCREENSHOTS_DIR, file);
    const exists = fs.existsSync(filepath);
    
    if (exists) {
      const stats = fs.statSync(filepath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`   ✅ ${file} (${sizeKB} KB)`);
    } else {
      console.log(`   ❌ ${file} - NOT FOUND`);
      allExist = false;
    }
  }
  
  console.log('');
  return allExist;
}

/**
 * Update README.md with screenshot paths
 */
function updateReadme(): void {
  console.log('📝 Updating README.md...\n');
  
  // Read README.md
  let content = fs.readFileSync(README_PATH, 'utf-8');
  let changesMade = 0;
  
  // Apply each replacement
  for (const replacement of replacements) {
    if (content.includes(replacement.oldText)) {
      content = content.replace(replacement.oldText, replacement.newText);
      console.log(`   ✅ Updated: ${replacement.description}`);
      changesMade++;
    } else if (content.includes(replacement.newText)) {
      console.log(`   ℹ️  Already updated: ${replacement.description}`);
    } else {
      console.log(`   ⚠️  Could not find: ${replacement.description}`);
    }
  }
  
  // Write back to README.md
  if (changesMade > 0) {
    fs.writeFileSync(README_PATH, content, 'utf-8');
    console.log(`\n✅ README.md updated successfully! (${changesMade} changes)`);
  } else {
    console.log('\nℹ️  No changes needed - README.md already up to date');
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 AgriClime Sentinel - Update README Screenshots\n');
  
  // Check if screenshots exist
  const screenshotsExist = checkScreenshotsExist();
  
  if (!screenshotsExist) {
    console.log('❌ Error: Not all screenshot files exist!');
    console.log('   Please run: npm run screenshots\n');
    process.exit(1);
  }
  
  // Update README
  updateReadme();
  
  console.log('\n📋 Next steps:');
  console.log('   1. Review the updated README.md');
  console.log('   2. Verify screenshots display correctly');
  console.log('   3. Commit changes: git add screenshots/ README.md');
  console.log('   4. Commit: git commit -m "docs: Add screenshots to README"');
  console.log('   5. Push: git push origin main\n');
}

// Run the script
main();

