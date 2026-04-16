const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgBuffer = fs.readFileSync(path.join(__dirname, 'public', 'logo.svg'));

async function generateIcons() {
  try {
    // Generate 192x192 icon
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, 'public', 'icon-192x192.png'));
    console.log('✓ Generated icon-192x192.png');

    // Generate 512x512 icon
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, 'public', 'icon-512x512.png'));
    console.log('✓ Generated icon-512x512.png');

    console.log('\nIcons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
