import { screen } from 'electron'
import { showShelf, getShelfWindow } from './shelf-window'

interface MousePos {
  x: number
  y: number
  t: number
}

const MOVE_THRESHOLD = 30
const SHAKE_THRESHOLD = 5
const SHAKE_WINDOW_MS = 600
const DRAG_SHOW_DELAY = 250

let isMouseDown = false
let mouseDownPos: MousePos | null = null
let shelfShownForDrag = false
let shakeHistory: MousePos[] = []
let dragShowTimer: ReturnType<typeof setTimeout> | null = null
let uiohook: typeof import('uiohook-napi') | null = null

export async function startDragDetector(): Promise<void> {
  try {
    uiohook = await import('uiohook-napi')

    uiohook.uIOhook.on('mousedown', (e) => {
      if (e.button === 1) {
        isMouseDown = true
        mouseDownPos = { x: e.x, y: e.y, t: Date.now() }
        shelfShownForDrag = false
        shakeHistory = [{ x: e.x, y: e.y, t: Date.now() }]
      }
    })

    uiohook.uIOhook.on('mouseup', (e) => {
      if (e.button === 1) {
        isMouseDown = false
        mouseDownPos = null
        shakeHistory = []
        if (dragShowTimer) {
          clearTimeout(dragShowTimer)
          dragShowTimer = null
        }
      }
    })

    uiohook.uIOhook.on('mousemove', (e) => {
      const now = Date.now()
      const pos = { x: e.x, y: e.y, t: now }

      // Shake detection (works whether or not mouse button is pressed)
      shakeHistory.push(pos)
      shakeHistory = shakeHistory.filter((p) => now - p.t < SHAKE_WINDOW_MS)

      if (detectShake(shakeHistory)) {
        shakeHistory = []
        const cursorPos = { x: e.x, y: e.y }
        showShelf(cursorPos)
        return
      }

      // Drag detection: mouse button held + moved enough
      if (isMouseDown && mouseDownPos && !shelfShownForDrag) {
        const dx = Math.abs(e.x - mouseDownPos.x)
        const dy = Math.abs(e.y - mouseDownPos.y)
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist >= MOVE_THRESHOLD) {
          if (!dragShowTimer) {
            dragShowTimer = setTimeout(() => {
              dragShowTimer = null
              if (isMouseDown) {
                shelfShownForDrag = true
                showShelf({ x: e.x, y: e.y })
              }
            }, DRAG_SHOW_DELAY)
          }
        }
      }
    })

    uiohook.uIOhook.start()
    console.log('[DragDetector] uiohook started')
  } catch (err) {
    console.warn('[DragDetector] uiohook-napi not available, falling back to polling', err)
    startPollingFallback()
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
  if (dragShowTimer) {
    clearTimeout(dragShowTimer)
    dragShowTimer = null
  }
}

function detectShake(history: MousePos[]): boolean {
  if (history.length < SHAKE_THRESHOLD) return false

  let directionChanges = 0
  let lastDx = 0

  for (let i = 1; i < history.length; i++) {
    const dx = history[i].x - history[i - 1].x
    if (Math.abs(dx) > 8) {
      if (lastDx !== 0 && dx * lastDx < 0) {
        directionChanges++
      }
      lastDx = dx
    }
  }

  return directionChanges >= 3
}

// Fallback: use setInterval to poll cursor position changes
// This catches drag operations through position change heuristic
let lastPollPos = { x: 0, y: 0 }
let lastPollTime = 0
let pollInterval: ReturnType<typeof setInterval> | null = null
let pollMoveHistory: MousePos[] = []

function startPollingFallback(): void {
  pollInterval = setInterval(() => {
    const pos = screen.getCursorScreenPoint()
    const now = Date.now()
    const dx = Math.abs(pos.x - lastPollPos.x)
    const dy = Math.abs(pos.y - lastPollPos.y)

    if (dx > 0 || dy > 0) {
      pollMoveHistory.push({ x: pos.x, y: pos.y, t: now })
      pollMoveHistory = pollMoveHistory.filter((p) => now - p.t < SHAKE_WINDOW_MS)

      if (detectShake(pollMoveHistory)) {
        pollMoveHistory = []
        showShelf({ x: pos.x, y: pos.y })
      }

      lastPollPos = { x: pos.x, y: pos.y }
      lastPollTime = now
    }
  }, 16)
}
