import { screen } from 'electron'
import { showShelf } from './shelf-window'
import { showOverlay, hideOverlay } from './overlay-window'

let isMouseDown = false
let mouseDownPos: { x: number; y: number } | null = null
let overlayShown = false
let uiohook: typeof import('uiohook-napi') | null = null

const DRAG_THRESHOLD = 10 // Pixels to move before activating overlay

export async function startDragDetector(): Promise<void> {
  try {
    uiohook = await import('uiohook-napi')

    uiohook.uIOhook.on('mousedown', (e) => {
      if (e.button === 1) {
        isMouseDown = true
        mouseDownPos = { x: e.x, y: e.y }
        overlayShown = false
      }
    })

    uiohook.uIOhook.on('mouseup', (e) => {
      if (e.button === 1) {
        isMouseDown = false
        mouseDownPos = null
        overlayShown = false
        hideOverlay()
      }
    })

    uiohook.uIOhook.on('mousemove', (e) => {
      if (isMouseDown && mouseDownPos && !overlayShown) {
        const dx = e.x - mouseDownPos.x
        const dy = e.y - mouseDownPos.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > DRAG_THRESHOLD) {
          overlayShown = true
          showOverlay() // Only activate overlay if user is actually dragging
        }
      }
    })

    uiohook.uIOhook.start()
    console.log('[DragDetector] uiohook started (File Detection with Threshold)')
  } catch (err) {
    console.warn('[DragDetector] uiohook-napi not available', err)
  }
}

export function stopDragDetector(): void {
  try {
    if (uiohook) {
      uiohook.uIOhook.stop()
    }
  } catch {
    // ignore
  }
}
