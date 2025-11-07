#!/usr/bin/env tsx

/**
 * Compress Screenshots
 * 
 * This script compresses PNG screenshots to reduce file size
 * while maintaining good quality.
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const TARGET_SIZE_KB = 500;

async function compressImage(filepath: string): Promise<void> {
  const filename = path.basename(filepath);
  const stats = fs.statSync(filepath);
  const originalSizeKB = Math.round(stats.size / 1024);
  
  console.log(`\n📸 Compressing: ${filename}`);
  console.log(`   Original size: ${originalSizeKB} KB`);
  
  if (originalSizeKB <= TARGET_SIZE_KB) {
    console.log(`   ✅ Already under ${TARGET_SIZE_KB}KB, skipping`);
    return;
  }
  
  try {
    // Read the image
    const image = sharp(filepath);
    const metadata = await image.metadata();
    
    // Compress with quality 85
    await image
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(filepath + '.tmp');
    
    // Check new size
    const newStats = fs.statSync(filepath + '.tmp');
    const newSizeKB = Math.round(newStats.size / 1024);
    
    // Replace original with compressed version
    fs.renameSync(filepath + '.tmp', filepath);
    
    const reduction = Math.round(((originalSizeKB - newSizeKB) / originalSizeKB) * 100);
    console.log(`   ✅ Compressed to: ${newSizeKB} KB (${reduction}% reduction)`);
    
    if (newSizeKB > TARGET_SIZE_KB) {
      console.log(`   ⚠️  Still over ${TARGET_SIZE_KB}KB - consider manual compression`);
    }
    
  } catch (error) {
    console.error(`   ❌ Error compressing ${filename}:`, error);
    // Clean up temp file if it exists
    if (fs.existsSync(filepath + '.tmp')) {
      fs.unlinkSync(filepath + '.tmp');
    }
  }
}

async function main() {
  console.log('🗜️  AgriClime Sentinel - Screenshot Compression\n');
  console.log(`📁 Directory: ${SCREENSHOTS_DIR}`);
  console.log(`🎯 Target size: <${TARGET_SIZE_KB}KB per image\n`);
  
  const files = fs.readdirSync(SCREENSHOTS_DIR)
    .filter(f => f.endsWith('.png'))
    .map(f => path.join(SCREENSHOTS_DIR, f));
  
  if (files.length === 0) {
    console.log('❌ No PNG files found in screenshots directory');
    process.exit(1);
  }
  
  for (const file of files) {
    await compressImage(file);
  }
  
  console.log('\n✅ Compression complete!\n');
}

main().catch(console.error);

