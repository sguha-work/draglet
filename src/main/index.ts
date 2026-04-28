import { app, BrowserWindow, ipcMain, nativeImage, protocol, shell, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createTray } from './tray'
import { createShelfWindow, getShelfWindow, showShelf, hideShelf } from './shelf-window'
import { createOverlayWindow, hideOverlay } from './overlay-window'
import { startDragDetector, stopDragDetector } from './drag-detector'
import { getStartupStatus, setStartupEnabled } from './startup'
import { ShelfItem } from '../shared/types'
import { readFileSync } from 'fs'
import { extname, basename } from 'path'

const shelfItems: ShelfItem[] = []

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.draglet.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await createShelfWindow()
  createOverlayWindow()
  createTray()
  setupIpcHandlers()
  startDragDetector()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createShelfWindow()
    }
  })
})

app.on('window-all-closed', () => {
  stopDragDetector()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  stopDragDetector()
})

function setupIpcHandlers(): void {
  ipcMain.handle('shelf:get-items', () => shelfItems)

  ipcMain.handle('shelf:add-items', async (_event, paths: string[]) => {
    for (const filePath of paths) {
      if (!shelfItems.find((i) => i.path === filePath)) {
        const item = await buildShelfItem(filePath)
        shelfItems.push(item)
      }
    }
    broadcastItemsUpdate()
    return shelfItems
  })

  ipcMain.handle('shelf:remove-item', (_event, id: string) => {
    const idx = shelfItems.findIndex((i) => i.id === id)
    if (idx !== -1) shelfItems.splice(idx, 1)
    broadcastItemsUpdate()
    return shelfItems
  })

  ipcMain.handle('shelf:clear', () => {
    shelfItems.length = 0
    broadcastItemsUpdate()
    return []
  })

  ipcMain.handle('shelf:show', () => showShelf())
  ipcMain.handle('shelf:hide', () => hideShelf())

  ipcMain.handle('shelf:drag-start', async (_event, id: string) => {
    const item = shelfItems.find((i) => i.id === id)
    if (!item) return
    const win = getShelfWindow()
    if (!win) return
    try {
      const icon = await app.getFileIcon(item.path, { size: 'normal' })
      win.webContents.startDrag({ file: item.path, icon })
    } catch {
      const fallback = nativeImage.createFromDataURL(item.iconDataUrl || '')
      win.webContents.startDrag({ file: item.path, icon: fallback })
    }
  })

  ipcMain.handle('shelf:open-item', (_event, id: string) => {
    const item = shelfItems.find((i) => i.id === id)
    if (item) shell.openPath(item.path)
  })

  ipcMain.handle('shelf:reveal-item', (_event, id: string) => {
    const item = shelfItems.find((i) => i.id === id)
    if (item) shell.showItemInFolder(item.path)
  })

  ipcMain.handle('settings:get', async () => {
    const startupEnabled = await getStartupStatus()
    return { startupEnabled }
  })

  ipcMain.handle('settings:set-startup', async (_event, enabled: boolean) => {
    await setStartupEnabled(enabled)
    return { ok: true }
  })

  ipcMain.handle('file:get-icon', async (_event, filePath: string) => {
    try {
      const icon = await app.getFileIcon(filePath, { size: 'large' })
      return icon.toDataURL()
    } catch {
      return null
    }
  })

  ipcMain.on('drag:detected', () => {
    const pos = screen.getCursorScreenPoint()
    showShelf(pos)
    hideOverlay()
  })
}

async function buildShelfItem(filePath: string): Promise<ShelfItem> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const name = basename(filePath)
  const ext = extname(filePath).toLowerCase()
  let iconDataUrl: string | null = null
  let previewDataUrl: string | null = null

  try {
    const icon = await app.getFileIcon(filePath, { size: 'large' })
    iconDataUrl = icon.toDataURL()
  } catch {
    // ignore
  }

  const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']
  if (imageExts.includes(ext)) {
    try {
      const data = readFileSync(filePath)
      const mimeMap: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp',
        '.svg': 'image/svg+xml'
      }
      const mime = mimeMap[ext] || 'image/png'
      previewDataUrl = `data:${mime};base64,${data.toString('base64')}`
    } catch {
      // ignore
    }
  }

  return {
    id,
    path: filePath,
    name,
    ext,
    iconDataUrl,
    previewDataUrl,
    addedAt: Date.now()
  }
}

function broadcastItemsUpdate(): void {
  const win = getShelfWindow()
  if (win && !win.isDestroyed()) {
    win.webContents.send('shelf:items-updated', shelfItems)
  }
}
