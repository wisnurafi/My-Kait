# My Kait — UI Redesign (Sticker Board → RawBlock)

## Phase 1: Foundation ✅
- [x] globals.css — RawBlock design tokens
- [x] layout.tsx — swap fonts (Archivo Black, Work Sans, Space Mono)
- [x] next.config.ts — CSP already has Google Fonts

## Phase 2: UI Primitives ✅
- [x] button.tsx — RawBlock buttons (primary/secondary/ghost/destructive, sizes)
- [x] card.tsx — RawBlock cards (default/elevated, border weight = hierarchy)
- [x] input.tsx — RawBlock inputs (sunken fill, mono, 3px→5px focus)
- [x] textarea.tsx — RawBlock textareas
- [x] select.tsx — RawBlock selects
- [x] badge.tsx → RawBlock badge + FilterChip
- [x] label.tsx — Archivo Black uppercase labels
- [x] toggle.tsx — RawBlock toggle (square, inversion)
- [x] tooltip.tsx — RawBlock tooltip (black fill, Space Mono)
- [x] skeleton.tsx — RawBlock skeleton (sunken, no radius)
- [x] spinner.tsx — RawBlock spinner (square, no radius)
- [x] image-upload.tsx — RawBlock tabs + dashed upload area

## Phase 3: App Shell ✅
- [x] navbar.tsx — RawBlock sidebar + mobile nav (border-heavy, uppercase, no-underline links)
- [x] theme-language-switcher.tsx — RawBlock switcher (square buttons, inversion)
- [x] hook-logo.tsx — brutalist mascot (currentColor, square caps, rect eye)
- [x] (app)/layout.tsx — padding adjustment

## Phase 4: Pages & Components
- [x] Landing: hero, features, scroll-hint (removed blobs, tilts, decorative colors)
- [x] Dashboard: dashboard-stats (removed tilt, colors, grid→bordered grid)
- [x] Webhooks page heading
- [x] Editor (subagent + fixes: variant outline→secondary, #ff6b35→#000000)
- [x] Logs (subagent + fixes: drawer backdrop, variant danger→destructive)
- [x] Webhooks components (subagent + fix: variant outline→secondary)
- [x] Templates + Settings + pages (subagent + fixes: variant danger→destructive, outline→secondary)
- [x] Discord preview (fixed rounded-full avatars with inline style)
- [x] Save-template-modal (fixed transparent backdrop)

## Phase 5: Dark Mode Contrast Fix
- [x] globals.css — added --surface-hover, --surface-input CSS vars (light+dark)
- [x] globals.css — native form control dark-mode overrides (select, option, checkbox, radio, placeholder)
- [x] input.tsx — replaced hardcoded #e8e8e8/#f5f5f5 with CSS vars
- [x] textarea.tsx — same
- [x] select.tsx — same
- [x] image-upload.tsx — same

## Phase 6: Detail Popup Fix
- [x] logs-view.tsx — drawer backdrop now uses color-mix(fg 70%) instead of bg-black/50
- [x] logs-view.tsx — drawer panel: border-l-3px→5px, max-w-md→lg, p-5→p-6
- [x] save-template-modal.tsx — same backdrop fix

## Build Check
- [x] tsc --noEmit passes with 0 errors

