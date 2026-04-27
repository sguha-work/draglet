import { app } from 'electron'

export async function getStartupStatus(): Promise<boolean> {
  if (process.platform === 'linux') {
    return false
  }

  // Use Electron's built-in login items API (works on macOS and Windows)
  try {
    const settings = app.getLoginItemSettings()
    return settings.openAtLogin
  } catch {
    return false
  }
}

export async function setStartupEnabled(enabled: boolean): Promise<void> {
  if (process.platform === 'linux') {
    return
  }

  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true,
      name: 'Easy Drop',
      args: ['--hidden']
    })
  } catch (err) {
    console.error('[Startup] Failed to set login item:', err)
  }
}
