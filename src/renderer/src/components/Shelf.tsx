import React, { useCallback, useEffect, useRef, useState } from 'react'
import ShelfItem from './ShelfItem'
import type { ShelfItem as ShelfItemType } from '../../../shared/types'

interface Props {
  onOpenSettings: () => void
}

export default function Shelf({ onOpenSettings }: Props): React.ReactElement {
  const [items, setItems] = useState<ShelfItemType[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.api.shelf.getItems().then((data: ShelfItemType[]) => {
      setItems(data)
      setIsLoaded(true)
    })

    window.api.shelf.onItemsUpdated((data: unknown) => {
      setItems(data as ShelfItemType[])
    })

    return () => {
      window.api.shelf.offItemsUpdated()
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const paths: string[] = []
    for (const file of Array.from(e.dataTransfer.files)) {
      paths.push(file.path)
    }

    if (paths.length > 0) {
      const updated = await window.api.shelf.addItems(paths)
      setItems(updated as ShelfItemType[])
    }
  }, [])

  const handleRemoveItem = useCallback(async (id: string) => {
    const updated = await window.api.shelf.removeItem(id)
    setItems(updated as ShelfItemType[])
  }, [])

  const handleClearAll = useCallback(async () => {
    await window.api.shelf.clear()
    setItems([])
  }, [])

  const handleClose = useCallback(() => {
    window.api.shelf.hide()
  }, [])

  return (
    <div
      className={`shelf ${isDragOver ? 'shelf--drag-over' : ''}`}
      ref={dropZoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="shelf__header" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <div className="shelf__header-left">
          <div className="shelf__logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 8L12 3L21 8V16L12 21L3 16V8Z"
                fill="url(#gradient)"
                stroke="none"
              />
              <defs>
                <linearGradient id="gradient" x1="3" y1="3" x2="21" y2="21">
                  <stop stopColor="#58A6FF" />
                  <stop offset="1" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="shelf__title">Draglet</span>
        </div>
        <div
          className="shelf__header-right"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button className="shelf__btn shelf__btn--icon" onClick={onOpenSettings} title="Settings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button className="shelf__btn shelf__btn--close" onClick={handleClose} title="Close shelf">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Drop zone / Items grid */}
      <div className="shelf__content">
        {!isLoaded ? (
          <div className="shelf__empty">
            <div className="shelf__spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className={`shelf__empty ${isDragOver ? 'shelf__empty--active' : ''}`}>
            <div className="shelf__empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="shelf__empty-title">
              {isDragOver ? 'Release to add files' : 'Drop files here'}
            </p>
            <p className="shelf__empty-hint">
              Shake your mouse or drag files here
            </p>
          </div>
        ) : (
          <div className="shelf__grid">
            {items.map((item, index) => (
              <ShelfItem
                key={item.id}
                item={item}
                onRemove={() => handleRemoveItem(item.id)}
                columnIndex={index % 3}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="shelf__footer">
          <span className="shelf__count">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
          <button className="shelf__btn shelf__btn--text" onClick={handleClearAll}>
            Clear all
          </button>
        </div>
      )}

      {/* Drag-over overlay */}
      {isDragOver && items.length > 0 && (
        <div className="shelf__drop-overlay">
          <div className="shelf__drop-overlay-content">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12l7-7 7 7" />
            </svg>
            <span>Add to shelf</span>
          </div>
        </div>
      )}
    </div>
  )
}
