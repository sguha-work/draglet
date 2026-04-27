/// <reference types="vite/client" />

import type { ShelfItem, AppSettings } from '../../shared/types'

interface Window {
  api: {
    shelf: {
      getItems: () => Promise<ShelfItem[]>
      addItems: (paths: string[]) => Promise<ShelfItem[]>
      removeItem: (id: string) => Promise<ShelfItem[]>
      clear: () => Promise<ShelfItem[]>
      show: () => Promise<void>
      hide: () => Promise<void>
      dragStart: (id: string) => Promise<void>
      openItem: (id: string) => Promise<void>
      revealItem: (id: string) => Promise<void>
      onItemsUpdated: (cb: (items: ShelfItem[]) => void) => void
      offItemsUpdated: () => void
    }
    settings: {
      get: () => Promise<AppSettings>
      setStartup: (enabled: boolean) => Promise<{ ok: boolean }>
    }
    file: {
      getIcon: (filePath: string) => Promise<string | null>
    }
  }
}
