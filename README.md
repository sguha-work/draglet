# Easy Drop

A drag-and-drop shelf app for Windows and macOS, inspired by Dropover. Stage files from multiple locations and drop them wherever you need.

## Features

- **Mouse shake to open** — shake your mouse quickly left-right while dragging to reveal the shelf
- **Drag detection** — start dragging any files and move the mouse; the shelf appears automatically
- **File staging** — collect files from multiple Finder/Explorer windows onto one shelf
- **Drag files out** — drag items from the shelf to any destination (folder, app, browser, etc.)
- **File previews** — image thumbnails, native OS file icons for all other types
- **Context menu** — right-click items to Open or Show in Folder
- **Launch at startup** — optional system startup integration
- **System tray** — always accessible from the tray; click to show/hide
- **Cross-platform** — works on Windows 10/11 and macOS

## Getting Started

### Development

```bash
npm install
npm run dev
```

### Build for Production

```bash
# Windows
npm run dist:win

# macOS
npm run dist:mac

# Both
npm run dist
```

Built installers are output to the `dist/` directory.

## How to Use

1. **Launch** Easy Drop — it lives in your system tray
2. **Shake your mouse** rapidly left-right while hovering over files to open the shelf
3. **Drag files** onto the shelf from any window
4. Navigate to your destination
5. **Drag files out** of the shelf to drop them where needed
6. Right-click any shelf item for more options

## Shelf Triggers

| Trigger | Action |
|---|---|
| Mouse shake (rapid left-right) | Opens shelf at cursor position |
| Dragging files + moving mouse | Shelf appears after a short delay |
| Click tray icon | Toggle shelf visibility |
| Settings → right-click tray | Open settings |

## Settings

- **Launch at startup** — registers Easy Drop with the OS login items
- Accessible via the ⚙️ icon in the shelf header

## Project Structure

```
draglet/
├── src/
│   ├── main/               # Electron main process
│   │   ├── index.ts        # App entry, IPC handlers
│   │   ├── shelf-window.ts # Floating shelf window
│   │   ├── drag-detector.ts # uiohook mouse listener
│   │   ├── tray.ts         # System tray
│   │   └── startup.ts      # Login items (startup)
│   ├── preload/
│   │   └── index.ts        # Secure IPC bridge
│   ├── renderer/
│   │   └── src/            # React UI
│   │       ├── App.tsx
│   │       ├── components/
│   │       │   ├── Shelf.tsx
│   │       │   ├── ShelfItem.tsx
│   │       │   └── Settings.tsx
│   │       └── styles/index.css
│   └── shared/
│       └── types.ts        # Shared TypeScript types
├── resources/              # App icons
├── electron.vite.config.ts
└── electron-builder.yml
```

## Requirements

- Node.js 18+
- npm 9+
- Windows 10+ or macOS 11+
