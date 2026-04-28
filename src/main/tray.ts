import { Tray, Menu, app, nativeImage } from 'electron'
import { join } from 'path'
import { showShelf, hideShelf, toggleShelf, getShelfWindow } from './shelf-window'

let tray: Tray | null = null

export function createTray(): void {
  const iconPath = join(__dirname, '../../resources/tray-icon.svg')
  let icon: Electron.NativeImage

  try {
    icon = nativeImage.createFromPath(iconPath)
    if (icon.isEmpty()) throw new Error('empty')
  } catch {
    icon = createFallbackIcon()
  }

  if (process.platform === 'darwin') {
    icon = icon.resize({ width: 16, height: 16 })
    icon.setTemplateImage(true)
  } else {
    icon = icon.resize({ width: 16, height: 16 })
  }

  tray = new Tray(icon)
  tray.setToolTip('Draglet')
  updateContextMenu()

  tray.on('click', () => {
    toggleShelf()
    updateContextMenu()
  })
  tray.on('double-click', () => {
    toggleShelf()
    updateContextMenu()
  })
}

function updateContextMenu(): void {
  if (!tray) return
  const win = getShelfWindow()
  const isVisible = win?.isVisible() ?? false

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isVisible ? 'Hide Shelf' : 'Show Shelf',
      click: () => {
        toggleShelf()
        updateContextMenu()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Draglet',
      click: () => app.quit()
    }
  ])

  tray!.setContextMenu(contextMenu)
}

function createFallbackIcon(): Electron.NativeImage {
  const size = 16
  const pixels = new Uint8Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    const x = i % size
    const y = Math.floor(i / size)
    
    // Draw a "D" shape
    const inVerticalBar = x >= 3 && x <= 5 && y >= 2 && y <= 13
    const inTopBar = x >= 5 && x <= 8 && y >= 2 && y <= 3
    const inBottomBar = x >= 5 && x <= 8 && y >= 12 && y <= 13
    const dx = x - 8
    const dy = y - 7.5
    const inCurve = dx >= 0 && (dx * dx + dy * dy) <= 30 && y >= 2 && y <= 13

    const isD = inVerticalBar || inTopBar || inBottomBar || inCurve

    pixels[i * 4] = 0
    pixels[i * 4 + 1] = 0
    pixels[i * 4 + 2] = 0
    pixels[i * 4 + 3] = isD ? 255 : 0
  }
  return nativeImage.createFromBuffer(Buffer.from(pixels), { width: size, height: size })
}
