import { BrowserWindow, screen, nativeImage } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let shelfWindow: BrowserWindow | null = null
const WINDOW_WIDTH = 320
const WINDOW_HEIGHT = 420

export async function createShelfWindow(): Promise<BrowserWindow> {
  const display = screen.getPrimaryDisplay()
  const { width, height } = display.workAreaSize

  shelfWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: width - WINDOW_WIDTH - 24,
    y: Math.floor((height - WINDOW_HEIGHT) / 2),
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: true,
    roundedCorners: true,
    ...(process.platform === 'darwin'
      ? { vibrancy: 'under-window', visualEffectState: 'active', titleBarStyle: 'hidden' }
      : {}),
    ...(process.platform === 'win32'
      ? { backgroundMaterial: 'acrylic' }
      : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    }
  })

  shelfWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  shelfWindow.on('ready-to-show', () => {
    // Don't auto-show; we control visibility
  })

  shelfWindow.webContents.on('did-finish-load', () => {
    // Window is ready
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await shelfWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    await shelfWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return shelfWindow
}

export function getShelfWindow(): BrowserWindow | null {
  return shelfWindow
}

export function showShelf(position?: { x: number; y: number }): void {
  if (!shelfWindow || shelfWindow.isDestroyed()) return

  if (position) {
    const display = screen.getDisplayNearestPoint(position)
    const { x: dx, y: dy, width: dw, height: dh } = display.workArea

    let wx = position.x + 20
    let wy = position.y - WINDOW_HEIGHT / 2

    if (wx + WINDOW_WIDTH > dx + dw) wx = position.x - WINDOW_WIDTH - 20
    if (wy < dy) wy = dy + 8
    if (wy + WINDOW_HEIGHT > dy + dh) wy = dy + dh - WINDOW_HEIGHT - 8

    shelfWindow.setPosition(Math.round(wx), Math.round(wy))
  }

  shelfWindow.showInactive()
  shelfWindow.setAlwaysOnTop(true, 'floating')
}

export function hideShelf(): void {
  if (!shelfWindow || shelfWindow.isDestroyed()) return
  shelfWindow.hide()
}

export function toggleShelf(): void {
  if (!shelfWindow || shelfWindow.isDestroyed()) return
  if (shelfWindow.isVisible()) {
    hideShelf()
  } else {
    showShelf()
  }
}
