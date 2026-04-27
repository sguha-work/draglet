import { Tray, Menu, app, nativeImage } from 'electron'
import { join } from 'path'
import { showShelf, hideShelf, toggleShelf, getShelfWindow } from './shelf-window'

let tray: Tray | null = null

export function createTray(): void {
  const iconPath = join(__dirname, '../../resources/tray-icon.png')
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
  tray.setToolTip('Easy Drop')
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
      label: 'Quit Easy Drop',
      click: () => app.quit()
    }
  ])

  tray!.setContextMenu(contextMenu)
}

function createFallbackIcon(): Electron.NativeImage {
  // 16x16 PNG: simple colored square as fallback
  const size = 16
  const pixels = new Uint8Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    const x = i % size
    const y = Math.floor(i / size)
    const inCircle =
      Math.sqrt(Math.pow(x - size / 2, 2) + Math.pow(y - size / 2, 2)) < size / 2 - 1
    pixels[i * 4] = inCircle ? 88 : 0
    pixels[i * 4 + 1] = inCircle ? 166 : 0
    pixels[i * 4 + 2] = inCircle ? 255 : 0
    pixels[i * 4 + 3] = inCircle ? 255 : 0
  }
  return nativeImage.createFromBuffer(Buffer.from(pixels), { width: size, height: size })
}
