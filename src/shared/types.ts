export interface ShelfItem {
  id: string
  path: string
  name: string
  ext: string
  iconDataUrl: string | null
  previewDataUrl: string | null
  addedAt: number
}

export interface AppSettings {
  startupEnabled: boolean
}

export interface MousePosition {
  x: number
  y: number
}
