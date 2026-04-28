import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

let overlayWindow: BrowserWindow | null = null

export function createOverlayWindow(): BrowserWindow {
  const display = screen.getPrimaryDisplay()
  const { width, height } = display.bounds

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  // We need this window to stay above but not block clicks normally
  // However, it MUST block mouse events to receive drag events when shown.
  // When it's hidden, it doesn't matter.

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body, html { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background: transparent; }
      </style>
    </head>
    <body>
      <script>
        document.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        document.addEventListener('dragenter', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const items = e.dataTransfer.items;
          let hasFiles = false;
          for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
              hasFiles = true;
              break;
            }
          }
          if (hasFiles) {
            // @ts-ignore
            window.api.dragDetected();
          }
        });
      </script>
    </body>
    </html>
  `
  overlayWindow.loadURL(`data:text/html;base64,${Buffer.from(html).toString('base64')}`)

  return overlayWindow
}

export function showOverlay(): void {
  if (!overlayWindow) return
  const display = screen.getPrimaryDisplay()
  overlayWindow.setBounds(display.bounds)
  overlayWindow.showInactive()
}

export function hideOverlay(): void {
  overlayWindow?.hide()
}
