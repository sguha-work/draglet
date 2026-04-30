import { BrowserWindow, screen, nativeImage } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let shelfWindow: BrowserWindow | null = null
const WINDOW_WIDTH = 250
const WINDOW_HEIGHT = 270

export async function createShelfWindow(): Promise<BrowserWindow> {
  const display = screen.getPrimaryDisplay()
  const { width, height } = display.workAreaSize

  shelfWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: WINDOW_WIDTH,
    maxWidth: WINDOW_WIDTH,
    minHeight: WINDOW_HEIGHT,
    maxHeight: WINDOW_HEIGHT,
    x: Math.floor((width - WINDOW_WIDTH) / 2),
    y: 24,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: true,
    roundedCorners: true,
    opacity: 0.8,
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

  if (process.platform === 'darwin') {
    shelfWindow.setWindowButtonVisibility(false)
  }

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

  // The shelf now defaults to top-middle and is draggable. 
  // We no longer move it to the cursor position to keep placement predictable.

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
