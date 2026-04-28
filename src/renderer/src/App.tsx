import React, { useState } from 'react'
import Shelf from './components/Shelf'
import Settings from './components/Settings'

type View = 'shelf' | 'settings'

export default function App(): React.ReactElement {
  const [view, setView] = useState<View>('shelf')
  const [settingsSection, setSettingsSection] = useState<string | undefined>()

  const openSettings = (section?: string) => {
    setSettingsSection(section)
    setView('settings')
  }

  return (
    <div className="app-root">
      {view === 'shelf' ? (
        <Shelf onOpenSettings={openSettings} />
      ) : (
        <Settings initialSection={settingsSection} onClose={() => setView('shelf')} />
      )}
    </div>
  )
}
