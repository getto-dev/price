import sharp from 'sharp';
import * as fs from 'fs';

async function resizeIcons() {
  const inputFile = '/home/z/price-next/public/icons/android/android-512.png';
  
  const sizes = [
    { name: '72x72', width: 72, height: 72 },
    { name: '96x96', width: 96, height: 96 },
    { name: '128x128', width: 128, height: 128 },
    { name: '144x144', width: 144, height: 144 },
    { name: '152x152', width: 152, height: 152 },
    { name: '167x167', width: 167, height: 167 },
    { name: '180x180', width: 180, height: 180 },
    { name: '192x192', width: 192, height: 192 },
    { name: '384x384', width: 384, height: 384 },
    { name: '512x512', width: 512, height: 512 },
  ];

  const androidDir = '/home/z/price-next/public/icons/android';
  const iosDir = '/home/z/price-next/public/icons/ios';
  const iconsDir = '/home/z/price-next/public/icons';

  // Ensure directories exist
  if (!fs.existsSync(androidDir)) fs.mkdirSync(androidDir, { recursive: true });
  if (!fs.existsSync(iosDir)) fs.mkdirSync(iosDir, { recursive: true });

  for (const size of sizes) {
    const androidPath = `${androidDir}/android-${size.name}.png`;
    await sharp(inputFile)
      .resize(size.width, size.height)
      .png()
      .toFile(androidPath);
    console.log(`Created Android: ${androidPath}`);

    const iosPath = `${iosDir}/${size.name}.png`;
    await sharp(inputFile)
      .resize(size.width, size.height)
      .png()
      .toFile(iosPath);
    console.log(`Created iOS: ${iosPath}`);
  }

  // favicon
  const favicon16 = `${iconsDir}/favicon-16x16.png`;
  await sharp(inputFile)
    .resize(16, 16)
    .png()
    .toFile(favicon16);
  console.log(`Created favicon 16x16`);

  const favicon32 = `${iconsDir}/favicon-32x32.png`;
  await sharp(inputFile)
    .resize(32, 32)
    .png()
    .toFile(favicon32);
  console.log(`Created favicon 32x32`);

  // apple-touch-icon
  const appleTouch = `${iconsDir}/apple-touch-icon.png`;
  await sharp(inputFile)
    .resize(180, 180)
    .png()
    .toFile(appleTouch);
  console.log(`Created apple-touch-icon`);

  console.log('\nAll icons generated successfully!');
}

resizeIcons();
