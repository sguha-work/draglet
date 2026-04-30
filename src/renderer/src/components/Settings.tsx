import React, { useCallback, useEffect, useState } from 'react'

/**
 * Props for the Settings component
 * @property {string} initialSection - Optional ID of the section to scroll to on mount
 * @property {() => void} onClose - Callback to return to the shelf view
 */
interface Props {
  initialSection?: string
  onClose: () => void
}

/**
 * Settings view component.
 * Allows users to configure application behavior (startup), view tutorials,
 * and information about the application and its creator.
 */
export default function Settings({ initialSection, onClose }: Props): React.ReactElement {
  // State for the "Launch at startup" setting
  const [startupEnabled, setStartupEnabled] = useState(false)
  // Loading state during settings save operations
  const [saving, setSaving] = useState(false)

  /**
   * Fetch current settings from the main process on mount
   */
  useEffect(() => {
    window.api.settings.get().then((s: { startupEnabled: boolean }) => {
      setStartupEnabled(s.startupEnabled)
    })
  }, [])

  /**
   * Handle deep-linking to specific settings sections
   */
  useEffect(() => {
    if (initialSection) {
      // Find the target section by ID and scroll it into view
      const el = document.getElementById(initialSection)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [initialSection])

  /**
   * Toggles the "Launch at startup" setting
   */
  const handleStartupToggle = useCallback(async () => {
    const next = !startupEnabled
    setSaving(true)
    try {
      // Persist the new setting to the OS (via main process)
      await window.api.settings.setStartup(next)
      setStartupEnabled(next)
    } finally {
      setSaving(false)
    }
  }, [startupEnabled])

  return (
    <div className="settings">
      {/* Header with back button and draggable handle */}
      <div className="settings__header" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <button
          className="shelf__btn shelf__btn--icon settings__back"
          onClick={onClose}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          title="Back"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="shelf__title">Settings</span>
        <div style={{ width: 28 }} />
      </div>

      <div className="settings__content">
        {/* General Settings Section */}
        <section className="settings__section" id="general">
          <h3 className="settings__section-title">General</h3>

          <div className="settings__row">
            <div className="settings__row-label">
              <span className="settings__row-title">Launch at startup</span>
              <span className="settings__row-desc">Open Draglet when you log in</span>
            </div>
            {/* Custom Toggle Switch */}
            <button
              className={`toggle ${startupEnabled ? 'toggle--on' : ''} ${saving ? 'toggle--saving' : ''}`}
              onClick={handleStartupToggle}
              disabled={saving}
            >
              <span className="toggle__thumb" />
            </button>
          </div>
        </section>

        {/* User Guide Section */}
        <section className="settings__section" id="how-it-works">
          <h3 className="settings__section-title">How it works</h3>
          <div className="settings__tips">
            <div className="settings__tip">
              <div className="settings__tip-icon">🖱️</div>
              <div>
                <strong>Shake your mouse</strong>
                <p>Move your mouse quickly left-right while dragging to reveal the shelf</p>
              </div>
            </div>
            <div className="settings__tip">
              <div className="settings__tip-icon">📂</div>
              <div>
                <strong>Drag &amp; drop files</strong>
                <p>Drop files onto the shelf to stage them for later</p>
              </div>
            </div>
            <div className="settings__tip">
              <div className="settings__tip-icon">↗️</div>
              <div>
                <strong>Drag files out</strong>
                <p>Drag items from the shelf to any destination</p>
              </div>
            </div>
            <div className="settings__tip">
              <div className="settings__tip-icon">⚙️</div>
              <div>
                <strong>System tray</strong>
                <p>Click the tray icon to show or hide the shelf</p>
              </div>
            </div>
          </div>
        </section>

        {/* Creator Info Section */}
        <section className="settings__section" id="about-creator">
          <h3 className="settings__section-title">About the Creator</h3>
          <div className="settings__row">
            <div className="settings__row-label">
              <span className="settings__row-title">Sahasrangshu Guha</span>
              <span className="settings__row-desc">sguha1988.life@gmail.com</span>
              <span className="settings__row-desc">GitHub: <a target='_blank' href='https://github.com/sguha-work'>sguha-work</a></span>
            </div>
          </div>
        </section>

        {/* App Version Info Section */}
        <section className="settings__section settings__section--about" id="about-app">
          <div className="settings__about">
            <div className="settings__about-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 8L12 3L21 8V16L12 21L3 16V8Z" fill="url(#g2)" />
                <defs>
                  <linearGradient id="g2" x1="3" y1="3" x2="21" y2="21">
                    <stop stopColor="#58A6FF" />
                    <stop offset="1" stopColor="#A78BFA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <p className="settings__app-name">Draglet</p>
              <p className="settings__app-version">Version 1.0.0</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
