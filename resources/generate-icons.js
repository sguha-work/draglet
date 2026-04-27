/**
 * Script to generate platform icons from SVG.
 * Run: node resources/generate-icons.js
 * Requires: npm install -g sharp (or install sharp in the project)
 */
const fs = require('fs')
const path = require('path')

// Simple PNG generator using Canvas API if available, otherwise just copies SVG
async function generateIcons() {
  const svgPath = path.join(__dirname, 'icon.svg')
  const svgData = fs.readFileSync(svgPath)

  try {
    const sharp = require('sharp')

    // Generate PNG at different sizes
    const sizes = [16, 32, 48, 64, 128, 256, 512, 1024]
    for (const size of sizes) {
      await sharp(svgData)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, `icon-${size}.png`))
      console.log(`Generated icon-${size}.png`)
    }

    // Generate main icon.png (512x512)
    await sharp(svgData)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, 'icon.png'))
    console.log('Generated icon.png')

    // Generate tray icon (22x22 for macOS, 16x16 for Windows)
    await sharp(svgData)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, 'tray-icon.png'))
    console.log('Generated tray-icon.png')

    await sharp(svgData)
      .resize(64, 64)
      .png()
      .toFile(path.join(__dirname, 'tray-icon@2x.png'))
    console.log('Generated tray-icon@2x.png')

    console.log('\nAll icons generated!')
    console.log('\nFor .icns (macOS), use:')
    console.log('  iconutil -c icns icon.iconset')
    console.log('\nFor .ico (Windows), use:')
    console.log('  Use an online converter or png-to-ico npm package')
  } catch (err) {
    console.warn('sharp not available, generating placeholder PNG files...')
    generatePlaceholderPNGs()
  }
}

function generatePlaceholderPNGs() {
  // Generate minimal valid 1x1 PNG as placeholder
  // Real icons should be generated using the SVG
  const minimalPNG = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000200000002008020000' +
    'fc18eda30000006049444154789c63f8cfc0c0c0c080c140c8c0c060' +
    'c000180100040002e0050110100002000040000800c5c0102006004c' +
    '0c000090200604000008000900000000000000000000000000000000' +
    '0000000000000000000049454e44ae426082',
    'hex'
  )

  // Actually write a proper 32x32 colored PNG via raw bytes
  const width = 32, height = 32
  const png = createSimplePNG(width, height)
  
  fs.writeFileSync(path.join(__dirname, 'tray-icon.png'), png)
  fs.writeFileSync(path.join(__dirname, 'tray-icon@2x.png'), png)
  
  // Create a larger placeholder for icon.png
  const png256 = createSimplePNG(256, 256)
  fs.writeFileSync(path.join(__dirname, 'icon.png'), png256)
  
  console.log('Placeholder icons written.')
}

function createSimplePNG(width, height) {
  const { createCanvas } = (() => {
    try { return require('canvas') } catch { return null }
  })() || {}

  if (createCanvas) {
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, '#58A6FF')
    grad.addColorStop(1, '#A78BFA')
    ctx.fillStyle = grad
    const r = width * 0.15
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.lineTo(width - r, 0)
    ctx.quadraticCurveTo(width, 0, width, r)
    ctx.lineTo(width, height - r)
    ctx.quadraticCurveTo(width, height, width - r, height)
    ctx.lineTo(r, height)
    ctx.quadraticCurveTo(0, height, 0, height - r)
    ctx.lineTo(0, r)
    ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.closePath()
    ctx.fill()
    return canvas.toBuffer('image/png')
  }

  // Fallback: minimal 1x1 PNG
  return Buffer.from('89504e470d0a1a0a0000000d494844520000000100000001080200000090' +
    '77533de0000000c4944415478016360f8cfc0000000020001e221bc330000000049454e44ae426082', 'hex')
}

generateIcons().catch(console.error)
