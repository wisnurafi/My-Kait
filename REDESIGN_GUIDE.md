# RawBlock Redesign Guide — Token Mapping

## Core Rules
1. **border-radius: 0** — ALL elements. Already enforced globally in globals.css (`* { border-radius: 0; }`)
2. **No shadows** — remove ALL `shadow-*` classes
3. **Borders** are the ONLY visual organizer: 1px (thin), 3px (thick/default), 5px (heavy/elevated)
4. **Colors**: ONLY black (#000), white (#FFF), blue (#0000FF links only), green (#008000), orange (#FFA500), red (#FF0000)
5. **Fonts**: Archivo Black (display/headings), Work Sans (body), Space Mono (mono/inputs)
6. **Uppercase + tracking** for buttons, labels, chips, nav items
7. **Full color inversion** for hover/active (black↔white)
8. **No decorative elements** — no blobs, no tilts, no grain, no emoji icons

## Token Mapping (OLD → NEW)

### Backgrounds
| Old | New | Notes |
|-----|-----|-------|
| `bg-primary` | `bg-fg` | Black fill |
| `bg-primary-soft` | `bg-sunken` | Light grey fill |
| `bg-bg-surface` / `bg-surface` | `bg-surface` | White fill |
| `bg-bg-elevated` / `bg-elevated` | `bg-sunken` | Grey fill |
| `bg-bg` | `bg-bg` | Base background (keep) |
| `bg-pink`, `bg-lime`, `bg-cobalt`, `bg-yellow` | REMOVE | No decorative colors |
| `bg-pink-soft`, `bg-lime-soft`, etc. | REMOVE | No decorative colors |
| `bg-danger` | `bg-error` | Red fill |
| `bg-success-soft`, `bg-warning-soft`, `bg-danger-soft`, `bg-info-soft` | REMOVE | Use solid color with white bg |

### Text Colors
| Old | New | Notes |
|-----|-----|-------|
| `text-primary` | `text-fg` | Black text (NOT blue — blue is links only) |
| `text-primary-fg` | `text-bg` | White text on black |
| `text-fg-muted` | `text-fg-secondary` | Grey text |
| `text-fg-subtle` | `text-fg-tertiary` | Lighter grey |
| `text-danger` | `text-error` | Red text |
| `text-pink`, `text-lime`, `text-cobalt`, `text-yellow` | REMOVE | Use `text-fg` or status colors |
| `text-success`, `text-warning` | KEEP | These still exist |

### Borders
| Old | New | Notes |
|-----|-----|-------|
| `border-soft` / `border-border-soft` | `border-border-ink` with `border-[1px]` | Thin black border |
| `border-2.5` | `border-[3px]` | Thick border (default) |
| `border-2` | `border-[2px]` or `border-[3px]` | Adjust per context |
| `border-primary` | `border-fg` | Black border |
| `border-danger` | `border-error` | Red border |
| `border-disabled` | `border-disabled` | Keep (exists in tokens) |

### Shadows (ALL REMOVED)
| Old | New |
|-----|-----|
| `shadow-[var(--shadow-sm)]` | REMOVE |
| `shadow-[var(--shadow-md)]` | REMOVE |
| `shadow-[var(--shadow-lg)]` | REMOVE |
| `shadow-[var(--shadow-xl)]` | REMOVE |
| `shadow-sticker-*` | REMOVE |

### Radius (ALL REMOVED)
| Old | New |
|-----|-----|
| `rounded-[var(--radius-sm)]` | REMOVE |
| `rounded-[var(--radius-md)]` | REMOVE |
| `rounded-[var(--radius-lg)]` | REMOVE |
| `rounded-full` | REMOVE |
| `rounded-lg`, `rounded-md`, `rounded-sm` | REMOVE |
| `rounded` | REMOVE |

### Decorative (ALL REMOVED)
| Old | New |
|-----|-----|
| `tilt-1`, `tilt-2`, `tilt-3` | REMOVE |
| `blob` | REMOVE |
| `sticker`, `sticker-hover`, `sticker-press` | REMOVE (use plain border divs) |

### Hover/Active Patterns
| Old Pattern | New Pattern |
|-------------|-------------|
| `hover:bg-bg-elevated` | `hover:bg-sunken` |
| `hover:shadow-[var(--shadow-lg)]` | REMOVE (use `hover:bg-sunken` or inversion) |
| `hover:-translate-x-0.5 hover:-translate-y-0.5` | REMOVE |
| `active:translate-x-1 active:translate-y-1` | REMOVE |
| `hover:text-primary` | `hover:underline` or `hover:text-link` (for links) |

### Common Class Replacements

**Card (sticker → rawblock):**
```
OLD: border-2.5 border-border-ink rounded-[var(--radius-lg)] bg-bg-surface shadow-[var(--shadow-md)]
NEW: bg-surface border-[3px] border-border-ink
```

**Input:**
```
OLD: bg-bg-surface border-2.5 border-border-ink rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)]
NEW: bg-sunken border-[3px] border-border-ink font-mono text-[15px]
```

**Button hover/active:**
```
OLD: hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]
NEW: (just color inversion via hover:bg-* classes)
```

## Status Color Mapping
- Success/Active: `text-success` `border-success` (green #008000)
- Warning: `text-warning` `border-warning` (orange #FFA500)
- Error/Danger: `text-error` `border-error` (red #FF0000)
- Info: `text-link` `border-link` (blue #0000FF, same as links)
- Default: `text-fg` `border-border-ink` (black)

## Badge/Chip Pattern (RawBlock)
```tsx
// Status chip: white bg, colored text, 2px colored border
<span className="bg-surface text-success border-success border-2 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em]">
  Active
</span>

// Filter chip: toggleable
<button className="bg-surface text-fg border-2 border-border-ink px-3 py-1 text-[10px] font-bold uppercase tracking-[0.05em]">
  Filter
</button>
// Active state: bg-fg text-bg
```

## Heading Pattern
```tsx
// Use font-display (Archivo Black) for headings
<h1 className="font-display text-5xl md:text-7xl leading-none uppercase">
<h2 className="font-display text-3xl md:text-4xl uppercase">
<h3 className="font-display text-xl uppercase">
```

## Section Divider Pattern
Instead of gaps/shadows, use borders:
```tsx
<div className="border-[3px] border-border-ink">
  {items.map((item, i) => (
    <div className="border-b-[1px] border-border-ink last:border-b-0">
      {item}
    </div>
  ))}
</div>
```
