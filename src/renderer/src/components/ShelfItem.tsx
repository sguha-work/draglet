import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ShelfItem as ShelfItemType } from '../../../shared/types'

interface Props {
  item: ShelfItemType
  onRemove: () => void
  columnIndex: number
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'])
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.avi', '.mkv', '.webm'])
const AUDIO_EXTS = new Set(['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'])
const DOC_EXTS = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'])
const CODE_EXTS = new Set(['.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.go', '.rs', '.cpp', '.c', '.h', '.css', '.html', '.json', '.yaml', '.yml', '.md'])

function getFileCategory(ext: string): string {
  if (IMAGE_EXTS.has(ext)) return 'image'
  if (VIDEO_EXTS.has(ext)) return 'video'
  if (AUDIO_EXTS.has(ext)) return 'audio'
  if (DOC_EXTS.has(ext)) return 'doc'
  if (CODE_EXTS.has(ext)) return 'code'
  if (ext === '.zip' || ext === '.tar' || ext === '.gz' || ext === '.rar' || ext === '.7z') return 'archive'
  if (ext === '') return 'folder'
  return 'file'
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'image': return '#34D399'
    case 'video': return '#F472B6'
    case 'audio': return '#A78BFA'
    case 'doc': return '#60A5FA'
    case 'code': return '#FCD34D'
    case 'archive': return '#FB923C'
    case 'folder': return '#38BDF8'
    default: return '#9CA3AF'
  }
}

function CategoryIcon({ category }: { category: string }): React.ReactElement {
  switch (category) {
    case 'image':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      )
    case 'video':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      )
    case 'audio':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )
    case 'doc':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    case 'code':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      )
    case 'archive':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      )
    case 'folder':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
      )
  }
}

export default function ShelfItem({ item, onRemove, columnIndex }: Props): React.ReactElement {
  const [hovered, setHovered] = useState(false)
  const [contextMenu, setContextMenu] = useState(false)
  const category = getFileCategory(item.ext)
  const color = getCategoryColor(category)
  const hasPreview = !!item.previewDataUrl
  const hasIcon = !!item.iconDataUrl

  const handleDragStart = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      await window.api.shelf.dragStart(item.id)
    },
    [item.id]
  )

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu(true)
  }, [])

  const handleOpen = useCallback(() => {
    window.api.shelf.openItem(item.id)
    setContextMenu(false)
  }, [item.id])

  const handleReveal = useCallback(() => {
    window.api.shelf.revealItem(item.id)
    setContextMenu(false)
  }, [item.id])

  useEffect(() => {
    if (!contextMenu) return
    const handler = () => setContextMenu(false)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [contextMenu])

  const truncatedName = item.name.length > 5 ? item.name.slice(0, 5) + '...' : item.name
  const displayName = hovered ? item.name : truncatedName

  return (
    <div
      className={`shelf-item ${hovered ? 'shelf-item--hovered' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setContextMenu(false)
      }}
      onContextMenu={handleContextMenu}
      title={item.name}
    >
      <div 
        className="shelf-item__pill" 
        style={{ 
          '--item-color': color,
          '--column-index': columnIndex 
        } as React.CSSProperties}
      >
        <div className="shelf-item__content">
          <span className="shelf-item__name">{displayName}</span>
          {item.ext && !hovered && <span className="shelf-item__ext">{item.ext.slice(1).toUpperCase()}</span>}
        </div>
        
        <button
          className="shelf-item__remove"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          title="Remove"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div 
          className="context-menu" 
          onClick={(e) => e.stopPropagation()}
          style={
            columnIndex === 0 
              ? { left: '0', transform: 'none' } 
              : columnIndex === 2 
                ? { right: '0', left: 'auto', transform: 'none' } 
                : {}
          }
        >
          <button className="context-menu__item" onClick={handleOpen}>Open</button>
          <button className="context-menu__item" onClick={handleReveal}>Show in Folder</button>
          <div className="context-menu__divider" />
          <button className="context-menu__item context-menu__item--danger" onClick={onRemove}>
            Remove from Shelf
          </button>
        </div>
      )}
    </div>
  )
}
