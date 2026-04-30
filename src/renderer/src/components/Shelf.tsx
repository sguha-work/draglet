import React, { useCallback, useEffect, useRef, useState } from 'react'
import ShelfItem from './ShelfItem'
import type { ShelfItem as ShelfItemType } from '../../../shared/types'

/**
 * Props for the Shelf component
 * @property {(section?: string) => void} onOpenSettings - Callback to switch to the settings view
 */
interface Props {
  onOpenSettings: (section?: string) => void
}

/**
 * Main Shelf component that manages the list of dragged items.
 * Acts as the drop zone and container for ShelfItem pills.
 */
export default function Shelf({ onOpenSettings }: Props): React.ReactElement {
  // State for items currently on the shelf
  const [items, setItems] = useState<ShelfItemType[]>([])
  // State to track if a file is being dragged over the shelf
  const [isDragOver, setIsDragOver] = useState(false)
  // State to track initial data load from disk
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Reference to the main container for drag-leave detection
  const dropZoneRef = useRef<HTMLDivElement>(null)

  /**
   * Initial data fetch and real-time update subscription
   */
  useEffect(() => {
    // Load existing items from the persistent store (Electron main process)
    window.api.shelf.getItems().then((data: ShelfItemType[]) => {
      setItems(data)
      setIsLoaded(true)
    })

    // Listen for updates from the main process (e.g., items added via shake-to-drop)
    window.api.shelf.onItemsUpdated((data: unknown) => {
      setItems(data as ShelfItemType[])
    })

    // Clean up event listener on unmount
    return () => {
      window.api.shelf.offItemsUpdated()
    }
  }, [])

  /**
   * Handle file hover over the shelf
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Indicate that dropping here will perform a copy operation
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }, [])

  /**
   * Handle drag leaving the shelf area
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set drag-over to false if the mouse actually left the component area
    // (not just entered a child element)
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }, [])

  /**
   * Handle file drop onto the shelf
   */
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    // Extract file paths from the dropped files
    const paths: string[] = []
    for (const file of Array.from(e.dataTransfer.files)) {
      paths.push(file.path)
    }

    // Add valid paths to the shelf via the main process
    if (paths.length > 0) {
      const updated = await window.api.shelf.addItems(paths)
      setItems(updated as ShelfItemType[])
    }
  }, [])

  /**
   * Remove a specific item from the shelf
   */
  const handleRemoveItem = useCallback(async (id: string) => {
    const updated = await window.api.shelf.removeItem(id)
    setItems(updated as ShelfItemType[])
  }, [])

  /**
   * Clear all items from the shelf
   */
  const handleClearAll = useCallback(async () => {
    await window.api.shelf.clear()
    setItems([])
  }, [])

  /**
   * Hide the shelf window
   */
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
      {/* Header with draggable region for window moving */}
      <div className="shelf__header" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <div className="shelf__header-left">
          <div className="shelf__logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 4H12C17 4 20 7 20 12C20 17 17 20 12 20H5V4ZM8 7V17H11C14 17 16 15 16 12C16 9 14 7 11 7H8Z"
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
        </div>
        
        {/* Navigation Buttons */}
        <div
          className="shelf__header-right"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button 
            className="shelf__btn shelf__btn--icon" 
            onClick={() => onOpenSettings('how-it-works')} 
            title="How it works"
          >
            💡
          </button>
          <button 
            className="shelf__btn shelf__btn--icon" 
            onClick={() => onOpenSettings('about-creator')} 
            title="About the Creator"
          >
            👤
          </button>
          <button className="shelf__btn shelf__btn--icon" onClick={() => onOpenSettings()} title="Settings">
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
          // Empty State
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
          // 3-Column Grid of Items
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

      {/* Footer Info */}
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

      {/* Drop-over overlay (shown when shelf has items but a new drag is occurring) */}
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
