import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  shelf: {
    getItems: () => ipcRenderer.invoke('shelf:get-items'),
    addItems: (paths: string[]) => ipcRenderer.invoke('shelf:add-items', paths),
    removeItem: (id: string) => ipcRenderer.invoke('shelf:remove-item', id),
    clear: () => ipcRenderer.invoke('shelf:clear'),
    show: () => ipcRenderer.invoke('shelf:show'),
    hide: () => ipcRenderer.invoke('shelf:hide'),
    dragStart: (id: string) => ipcRenderer.invoke('shelf:drag-start', id),
    openItem: (id: string) => ipcRenderer.invoke('shelf:open-item', id),
    revealItem: (id: string) => ipcRenderer.invoke('shelf:reveal-item', id),
    onItemsUpdated: (cb: (items: unknown[]) => void) => {
      ipcRenderer.on('shelf:items-updated', (_e, items) => cb(items))
    },
    offItemsUpdated: () => {
      ipcRenderer.removeAllListeners('shelf:items-updated')
    }
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    setStartup: (enabled: boolean) => ipcRenderer.invoke('settings:set-startup', enabled)
  },
  file: {
    getIcon: (filePath: string) => ipcRenderer.invoke('file:get-icon', filePath)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
