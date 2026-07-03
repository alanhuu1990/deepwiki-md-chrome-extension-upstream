# DeepWiki to Markdown Extension

A Chrome extension to convert [DeepWiki](https://deepwiki.com) and [Devin](https://app.devin.ai) documentation pages to Markdown for local editing and archiving.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/giidpddkhhjaikgjkkfclfidbnekghde?label=Chrome%20Web%20Store)](https://chromewebstore.google.com/detail/deepwiki-to-markdown/giidpddkhhjaikgjkkfclfidbnekghde)

[简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md)

## ☕ Support This Project

<a href="https://buymeacoffee.com/philipz" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## Overview

This extension runs entirely in your browser. It reads the current wiki page, converts the article to Markdown, and triggers a download. No account or server is required.

Use it to:

- Create local backups of documentation
- Read offline or in your notes app
- Repurpose content for blogs or internal wikis
- Preserve repo documentation from DeepWiki or Devin wikis

**Current version:** [0.5.0](CHANGELOG.md) — see [CHANGELOG.md](CHANGELOG.md) for release notes.

### Recent releases

| Version | Highlights |
|---------|------------|
| **0.5.0** | Batch operation queue, recent batches increased to 20 entries |
| **0.4.0** | Diagram PNG export, batch download history, reliable batch ZIP download in the service worker |
| **0.3.0** | **Batch image download fixes** — diagram PNGs are collected per page, written into the ZIP with unique `images/` paths, and Markdown links stay in sync; batch history to re-download completed archives |

## Features

### 1. Single page download

Convert the current page to Markdown.

- Plain `.md` when there are no diagrams
- **ZIP** (Markdown + `images/` folder) when the page contains Mermaid or diagram SVGs — diagrams are exported as **PNG** files (SVG fallback in Markdown if rasterization fails)

### 2. Batch download (ZIP archive)

Download every subpage listed in the sidebar as its own `.md` file, packaged in a ZIP with:

- An auto-generated `README.md` index
- Per-page Markdown files
- **`images/`** — diagram PNGs (and SVG fallback files when PNG rasterization fails)

Progress and cancel are shown in the popup while the extension navigates each page. While a batch is running, you can queue additional **Download All Pages** or **Download as one md file** jobs from other wiki tabs; they run one after another automatically.

**Batch queue:** Open the popup → **Batch queue** to see the active job and waiting jobs. Remove individual queued jobs or **Clear queue**. **Cancel current batch** stops only the job in progress.

**Batch diagram images (v0.3.0+):** Each wiki page is converted on its own, with diagrams rasterized from the live DOM before Markdown is generated. Image files use **page-specific names** (for example `images/PageTitle-diagram-1.png`) so multiple pages in one batch do not overwrite each other’s assets. The `.md` files in the ZIP reference those same paths, so viewers and static-site tools can resolve images offline. This fixes earlier batch runs where diagrams were missing, duplicated, or broken links inside the archive.

### 3. Single-file batch download

Merge all sidebar pages into **one** Markdown file. Diagram images are **inlined as base64** in that file so it stays self-contained.

### 4. Batch download history

After a successful batch (ZIP or single-file), the extension saves the result locally so you can download again without re-running conversion.

- Open the popup → **Recent batches**
- **Download** — opens the save dialog again (useful if you dismissed it by mistake)
- **Remove** (×) or **Clear all** — delete stored copies
- Keeps up to **20** recent batches; entries over **80 MB** are not stored (the first download still runs)

History is stored in **IndexedDB** on your device only. Single-page downloads are not kept in history.

### 5. Advanced conversion

- Code blocks with language tags preserved
- **Mermaid** diagrams: flowcharts, sequence, class, state, and related diagram types
- **Diagram PNG export** for wiki SVG/Mermaid renderings (embedded in ZIPs or inlined in merged batch files)
- Tables, lists, headings, and links
- Metadata such as last-indexed date in filenames where available

## Installation

### Option 1: Install from Chrome Web Store (recommended)

1. Visit the [Chrome Web Store](https://chromewebstore.google.com/detail/deepwiki-to-markdown/giidpddkhhjaikgjkkfclfidbnekghde)
2. Click **Add to Chrome**
3. Confirm the extension icon appears in the toolbar

### Option 2: Install from source

1. **Get the code**
   - Clone: `git clone https://github.com/philipz/deepwiki-md-chrome-extension.git`
   - Or download a [release](https://github.com/philipz/deepwiki-md-chrome-extension/releases) / build a store zip: `./build-for-store.sh` → `deepwiki-md-extension-v<version>.zip`

2. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable **Developer mode**
   - **Load unpacked** → select the repository root

3. **After code changes**
   - Click the reload icon on the extension card at `chrome://extensions/`

## Usage

![Extension UI](./images/UI.png)

Supported URLs: `https://deepwiki.com/<org>/<project>/...` and Devin wiki pages on `https://app.devin.ai/...` (path must include at least two segments, e.g. `/org/project`).

### Single page download

1. Open a documentation page (example: [ThinkInAIXYZ/go-mcp](https://deepwiki.com/ThinkInAIXYZ/go-mcp))
2. Click the extension icon
3. Click **Download Current Page**
4. Save the `.md` file, or a `.zip` if the page had diagrams

### Batch download (ZIP)

1. Open the **main** page of a wiki (sidebar visible)
2. Click the extension icon → **Download All Pages**
3. Wait for progress in the popup (use **Cancel Batch Operation** or **Cancel current batch** if needed)
4. Optionally queue more batch jobs from other wiki tabs while one is running
5. Save the ZIP when prompted

**ZIP layout (pages with diagrams):**

```text
MyWiki.zip
├── README.md              # index of all pages
├── Introduction.md
├── Architecture.md
└── images/
    ├── Introduction-diagram-1.png
    └── Architecture-diagram-1.png
```

If you close the save dialog without saving, use **Recent batches** → **Download** on that run instead of starting over (the stored ZIP includes the same Markdown and image files).

### Single-file batch download

1. Open the main wiki page
2. Click **Download as one md file**
3. Wait for all pages to merge
4. Save the combined `.md` file (or recover from **Recent batches** if you dismissed the dialog)

### Recent batches

1. Open the extension popup
2. Expand **Recent batches** (shown when at least one batch is stored)
3. Use **Download**, **×**, or **Clear all** as needed

## Example

**Before (DeepWiki):**

![DeepWiki Page](./images/deepwiki-github.png)

**After (Markdown):**

![Markdown Output](./images/deepwiki-markdown.png)

## Technical details

| Topic | Details |
|--------|---------|
| **Sites** | `https://deepwiki.com/*`, `https://app.devin.ai/*` |
| **Format** | UTF-8 Markdown (`.md`); batch ZIP uses DEFLATE |
| **Diagrams** | Per-page PNG (or SVG) under `images/` in batch ZIPs, with paths prefixed by page title; base64 inline in single-file batch; Mermaid text fallback when export fails |
| **Batch history** | IndexedDB (`deepwiki-batch-history`), max 20 entries, 80 MB per-entry storage cap |
| **Batch queue** | In-memory FIFO in service worker (max 20 waiting jobs); lost on extension reload |
| **Permissions** | `downloads`, `tabs`, `webNavigation`, `scripting` — no `storage` permission; history uses IndexedDB |

## Requirements

- Google Chrome or a Chromium-based browser (Edge, Brave, etc.)
- Network access to DeepWiki or Devin while converting (content is not sent to extension authors)

## Troubleshooting

**Extension not working**

- Use a valid wiki URL (`/org/project` or deeper)
- Let the page finish loading before converting
- Refresh the page, or reload the extension at `chrome://extensions/`
- If you reloaded the extension without refreshing the tab, refresh the wiki page once

**Download fails or save dialog was dismissed**

- Check browser download settings and disk space
- For batch jobs: open the popup → **Recent batches** → **Download** (no re-conversion)
- Very large wikis may produce ZIPs too large to keep in history; the initial download still runs

**Batch conversion stuck**

- Click **Cancel Batch Operation**
- Refresh the wiki tab and try again
- For debugging: set `DEBUG_MODE = true` in `content.js`, reload the extension, check the page console (F12)

**Diagrams missing or broken in a batch ZIP**

- Use extension **v0.3.0 or later** (current **0.5.0**) — batch image packaging was fixed in that release line
- Let each page finish rendering before the extension moves on (diagrams are captured from the DOM)
- Unzip and confirm `images/` contains `PageName-diagram-N.png` files matching `![](images/...)` links in the `.md` files
- If the save dialog failed, re-download the same batch from **Recent batches** rather than re-running conversion

## Roadmap

- [ ] Auto-translation before conversion
- [x] Local storage for recent batch downloads (v0.4.0 — IndexedDB history)
- [x] Batch operation queue (v0.5.0)
- [ ] Cloud export (Google Drive, OneDrive, Notion, etc.)
- [ ] Custom conversion templates
- [ ] Configurable diagram format and metadata
- [ ] More documentation platforms

## Contributing

Contributions are welcome:

- [Issues](https://github.com/philipz/deepwiki-md-chrome-extension/issues) for bugs and ideas
- Pull requests — branch from `develop`, target **`develop`** (see [.cursor/rules/git-workflow.mdc](.cursor/rules/git-workflow.mdc))
- Bump `manifest.json` and [CHANGELOG.md](CHANGELOG.md) for user-facing releases

## Privacy

All conversion happens locally. Completed **batch** outputs may be stored in IndexedDB on your device so you can re-download them from the popup until you remove them or the oldest entries are evicted.

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.

## License

MIT License — see [LICENSE](LICENSE).

## Acknowledgments

- Built for [DeepWiki](https://deepwiki.com) and Devin wikis
- [JSZip](https://stuk.github.io/jszip/) for ZIP archives
- Inspired by preserving and reusing technical documentation offline

---

**Version:** [CHANGELOG.md](CHANGELOG.md) (current: **0.5.0**)  
**Maintainer:** [@philipz](https://github.com/philipz)  
**Repository:** https://github.com/philipz/deepwiki-md-chrome-extension
