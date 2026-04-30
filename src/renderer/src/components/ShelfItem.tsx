import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ShelfItem as ShelfItemType } from '../../../shared/types'

interface Props {
  item: ShelfItemType
  onRemove: () => void
  columnIndex: number
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.heic', '.ico'])
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'])
const AUDIO_EXTS = new Set(['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.aiff'])
const DOC_EXTS = new Set(['.pdf', '.doc', '.docx', '.txt', '.pages', '.rtf', '.odt'])
const SHEET_EXTS = new Set(['.xls', '.xlsx', '.csv', '.numbers', '.ods'])
const SLIDE_EXTS = new Set(['.ppt', '.pptx', '.key', '.odp'])
const CODE_EXTS = new Set(['.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.go', '.rs', '.cpp', '.c', '.h', '.css', '.html', '.json', '.yaml', '.yml', '.md', '.sh', '.sql', '.php'])
const ARCHIVE_EXTS = new Set(['.zip', '.tar', '.gz', '.rar', '.7z', '.iso', '.dmg'])
const DESIGN_EXTS = new Set(['.psd', '.ai', '.fig', '.sketch', '.xd'])

function getFileCategory(ext: string): string {
  const e = ext.toLowerCase()
  if (IMAGE_EXTS.has(e)) return 'image'
  if (VIDEO_EXTS.has(e)) return 'video'
  if (AUDIO_EXTS.has(e)) return 'audio'
  if (DOC_EXTS.has(e)) return 'doc'
  if (SHEET_EXTS.has(e)) return 'sheet'
  if (SLIDE_EXTS.has(e)) return 'slide'
  if (CODE_EXTS.has(e)) return 'code'
  if (ARCHIVE_EXTS.has(e)) return 'archive'
  if (DESIGN_EXTS.has(e)) return 'design'
  if (e === '.exe' || e === '.app' || e === '.pkg' || e === '.deb') return 'system'
  if (e === '') return 'folder'
  return 'file'
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'image': return '150, 70%, 50%' // Emerald
    case 'video': return '330, 80%, 60%' // Rose
    case 'audio': return '260, 70%, 65%' // Violet
    case 'doc': return '210, 80%, 55%' // Blue
    case 'sheet': return '120, 60%, 50%' // Green
    case 'slide': return '25, 90%, 55%' // Orange
    case 'code': return '45, 90%, 50%' // Amber
    case 'archive': return '30, 50%, 45%' // Brown
    case 'design': return '240, 60%, 60%' // Indigo
    case 'system': return '210, 15%, 50%' // Slate
    case 'folder': return '200, 80%, 50%' // Sky
    default: return '210, 10%, 60%' // Gray
  }
}



export default function ShelfItem({ item, onRemove, columnIndex }: Props): React.ReactElement {
  const [hovered, setHovered] = useState(false)
  const [contextMenu, setContextMenu] = useState(false)
  const category = getFileCategory(item.ext)
  const color = getCategoryColor(category)

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

  const truncatedName = item.name.length > 4 ? item.name.slice(0, 4) + '..' : item.name
  const displayName = hovered ? (item.name.length>22?item.name.slice(0,22)+'...':item.name) : truncatedName

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
          {item.ext  && <span className="shelf-item__ext">{item.ext.slice(1).toUpperCase()}</span>}
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
