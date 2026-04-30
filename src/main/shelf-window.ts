import { BrowserWindow, screen, nativeImage } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

/**
 * Global reference to the shelf window instance
 */
let shelfWindow: BrowserWindow | null = null

// Constant dimensions for the shelf window
const WINDOW_WIDTH = 250
const WINDOW_HEIGHT = 270

/**
 * Creates and configures the floating shelf window.
 * This window is designed to be translucent, always-on-top, and minimalist.
 * @returns {Promise<BrowserWindow>} The created BrowserWindow instance
 */
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
    // Position at top-center of the screen by default
    x: Math.floor((width - WINDOW_WIDTH) / 2),
    y: 24,
    show: false, // Hidden until triggered
    frame: false, // No title bar or window borders
    transparent: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true, // Don't show in Dock/Taskbar
    alwaysOnTop: true, // Stay above other windows
    hasShadow: true,
    roundedCorners: true,
    opacity: 0.8,
    // Platform-specific visual effects
    ...(process.platform === 'darwin'
      ? { 
          vibrancy: 'under-window', // macOS glass effect
          visualEffectState: 'active', 
          titleBarStyle: 'hidden' 
        }
      : {}),
    ...(process.platform === 'win32'
      ? { backgroundMaterial: 'acrylic' } // Windows acrylic effect
      : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // Necessary for loading local file previews/icons
    }
  })

  // Ensure window stays above full-screen apps and across all virtual desktops
  shelfWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  if (process.platform === 'darwin') {
    // Hide standard macOS window controls (traffic lights)
    shelfWindow.setWindowButtonVisibility(false)
  }

  shelfWindow.on('ready-to-show', () => {
    // Window is fully loaded and ready to be displayed
  })

  // Load the appropriate URL based on environment (Dev vs Production)
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await shelfWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    await shelfWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return shelfWindow
}

/**
 * Returns the current shelf window instance
 */
export function getShelfWindow(): BrowserWindow | null {
  return shelfWindow
}

/**
 * Shows the shelf window.
 * Defaults to its fixed position at the top-middle of the screen.
 */
export function showShelf(position?: { x: number; y: number }): void {
  if (!shelfWindow || shelfWindow.isDestroyed()) return

  // Show without taking focus from the currently active application
  shelfWindow.showInactive()
  shelfWindow.setAlwaysOnTop(true, 'floating')
}

/**
 * Hides the shelf window
 */
export function hideShelf(): void {
  if (!shelfWindow || shelfWindow.isDestroyed()) return
  shelfWindow.hide()
}

/**
 * Toggles the shelf visibility
 */
export function toggleShelf(): void {
  if (!shelfWindow || shelfWindow.isDestroyed()) return
  if (shelfWindow.isVisible()) {
    hideShelf()
  } else {
    showShelf()
  }
}
