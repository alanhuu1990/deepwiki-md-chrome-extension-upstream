# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Version numbers match `manifest.json`.

## [0.4.0] - 2026-05-29

### Added

- Diagram export as PNG assets in single-page and batch ZIP outputs (SVG fallback when rasterization fails).
- **Batch download history** — persist completed ZIP and single-file batch outputs in IndexedDB; re-download from popup **Recent batches** without re-converting (max 5 entries, 80 MB cap per entry).
- `batchHistory.js` and git-workflow Cursor rule (`.cursor/rules/git-workflow.mdc`).

### Changed

- Batch ZIP and single-file merge flows use service-worker-safe download helpers (base64 data URLs).
- [PRIVACY_POLICY.md](PRIVACY_POLICY.md) updated for optional local batch history storage.

### Fixed

- Batch ZIP download and history re-download (`URL.createObjectURL` is unavailable in MV3 service workers).

## [0.3.1] - 2026-05-29

### Fixed

- Batch ZIP download and history re-download in the service worker: use base64 data URLs instead of `URL.createObjectURL` (not available in MV3 service workers).

## [0.3.0] - 2026-05-29

### Added

- **Batch download history** — Completed ZIP batch and single merged Markdown batch outputs are saved locally (IndexedDB) before the save dialog opens, so you can re-download from the popup if you dismiss the dialog.
- Popup **Recent batches** section: list recent runs, re-download, remove one entry, or clear all.
- `batchHistory.js` module loaded by the service worker; no new manifest permissions required.

### Fixed

- **Batch image download** — Diagram PNG/SVG assets are included in batch ZIPs with per-page `images/{pageTitle}-diagram-N.*` paths so Markdown image links match files in the archive and pages no longer clobber shared `images/diagram-*` names.

### Changed

- Batch ZIP and single-file merge flows refactored into `buildZipBlob` / `buildMergedMarkdown` plus shared download helpers.
- [PRIVACY_POLICY.md](PRIVACY_POLICY.md) updated to describe optional local batch history storage (max 5 entries, 80 MB per-entry cap).

## [0.2.1] - 2026-05-29

### Added

- Diagram export as PNG assets in ZIP and batch outputs; SVG fallback when rasterization fails.
- Local repro scripts under `test/` for diagram asset collection.

### Fixed

- Batch conversion reliability (SPA readiness, tab message queue, Devin button index handling).
- Mermaid flowchart, class diagram, and edge-style conversion improvements.

[0.4.0]: https://github.com/philipz/deepwiki-md-chrome-extension/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/philipz/deepwiki-md-chrome-extension/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/philipz/deepwiki-md-chrome-extension/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/philipz/deepwiki-md-chrome-extension/releases/tag/v0.2.1
