import React, { useState } from 'react'
import Shelf from './components/Shelf'
import Settings from './components/Settings'

type View = 'shelf' | 'settings'

export default function App(): React.ReactElement {
  const [view, setView] = useState<View>('shelf')

  return (
    <div className="app-root">
      {view === 'shelf' ? (
        <Shelf onOpenSettings={() => setView('settings')} />
      ) : (
        <Settings onClose={() => setView('shelf')} />
      )}
    </div>
  )
}
