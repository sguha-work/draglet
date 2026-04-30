# 🚀 Draglet

**Draglet** is a premium, lightweight productivity utility for macOS and Windows, inspired by apps like Dropover. It provides a temporary "shelf" to stage files while you navigate between folders, applications, or browser tabs.

![Draglet Banner](https://raw.githubusercontent.com/sguha-work/draglet/main/resources/banner.png) *(Placeholder for banner)*

## ✨ Key Features

- **Liquid Glass UI** — A beautiful, translucent macOS-inspired interface that feels native and premium.
* **Intelligent File Categorization** — Pills are automatically color-coded based on file type (Images, Code, Documents, etc.) for instant visual recognition.
* **Shake-to-Drop** — Move your mouse quickly left-to-right while dragging files to instantly reveal the shelf at your cursor position.
* **Seamless Drag-and-Drop** — Collect files from multiple locations and drag them out to any destination in one go.
* **Smart Truncation** — Clean, minimalist "pill" design that expands on hover to show full filenames.
* **System Tray Integration** — Always available in the background; toggle visibility with a single click.

---

## 📖 User Guide

### 1. Installation
Currently, Draglet is in development. To run it from source:
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Clone the repository.
3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the application.

### 2. Adding Files to the Shelf
There are three ways to reveal the shelf:
- **The Shake**: While dragging a file, shake your mouse rapidly left-to-right. The shelf will appear right under your cursor.
- **The Drag-Detect**: Start dragging a file and move it slightly; the shelf will fade in nearby.
- **The Tray**: Click the Draglet icon in your System Tray (macOS Menu Bar or Windows Taskbar).

Once the shelf is visible, simply **drop your files** into the drop zone.

### 3. Managing Staged Items
- **Identify by Color**: 
  - 🟢 **Emerald**: Images
  - 🔴 **Rose**: Videos
  - 🟡 **Amber**: Code files
  - 🔵 **Blue**: Documents
  - 📂 **Sky**: Folders
- **Hover**: Hover over a "pill" to see the full filename and the remove button.
- **Right-Click**: Open a context menu to **Open** the file directly or **Show in Folder**.

### 4. Moving Files Out
When you've reached your destination folder or app:
1. Click and hold a pill on the shelf.
2. Drag it out to the destination and release.
3. Use the **"Clear All"** button in the footer to empty the shelf when you're done.

---

## 🛠️ Developer Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Python (for `uiohook-napi` native dependencies)

### Development
```bash
npm install
npm run dev
```

### Building for Distribution
```bash
# Build for current OS
npm run dist

# Targeted builds
npm run dist:mac  # macOS
npm run dist:win  # Windows
```

---

## 🏗️ Architecture

- **Framework**: [Electron](https://www.electronjs.org/) with [Vite](https://vitejs.dev/)
- **UI Stack**: [React](https://reactjs.org/) + [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **Native Hooks**: [uiohook-napi](https://github.com/the-asura/uiohook-napi) for global mouse gesture detection.

---

## 👤 About the Creator

Developed with ❤️ by **Sahasrangshu Guha**.
- **Email**: sguha1988.life@gmail.com
- **GitHub**: [@sguha-work](https://github.com/sguha-work)

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
