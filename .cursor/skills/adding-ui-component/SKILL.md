---
name: adding-ui-component
description: Creates a React UI component for the Nonogram app following the folder, hook, strings, Tailwind token and accessibility conventions. Use when adding or splitting a component, screen or UI element under src/ui.
---

# Adding a UI Component

```
- [ ] 1. Decide location
- [ ] 2. Create Component.tsx (presentational)
- [ ] 3. Extract logic to useComponent.ts if non-trivial
- [ ] 4. Add strings to src/ui/strings/es.ts
- [ ] 5. Style with semantic tokens and cn()
- [ ] 6. Accessibility and touch targets
- [ ] 7. Test with React Testing Library
- [ ] 8. pnpm check
```

## 1. Location

- Reusable primitive: `src/ui/components/<Name>.tsx` (Button, Modal, BottomSheet).
- Feature component with children/hook: `src/ui/components/<Name>/<Name>.tsx`.
- Screen: `src/ui/screens/<Name>Screen/<Name>Screen.tsx`.
- Subcomponent used by one parent: same folder as the parent.

## 2. Component template

```tsx
import { cn } from '@ui/lib/cn'

type ToolbarButtonProps = {
  label: string
  isActive?: boolean
  onPress: () => void
}

export function ToolbarButton({ label, isActive = false, onPress }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onPress}
      className={cn(
        'min-h-12 min-w-12 rounded-xl text-ink',
        isActive && 'bg-accent-soft text-accent',
      )}
    >
      {label}
    </button>
  )
}
```

## 3. Hook

- Move derived values, store reads and handlers to `useXxx.ts` next to the component.
- Read the store with granular selectors from `@app/...`. Never import `@services/*` or `@capacitor/*`.
- Logic needing engine helpers goes through app selectors (ui may only `import type` from core).

## 4. Strings

- Add keys under the right section in `src/ui/strings/es.ts`. Functions for interpolation:
  `cellLabel: (row: number, col: number) => \`Fila ${row}, columna ${col}\``.

## 5. Styling

- Only tokens from `src/index.css` `@theme`. Add a token there if missing (light and dark values).
- Variants in a typed `Record<Variant, string>` map.

## 6. Accessibility

- `button` for actions, `aria-label` when the visible label is an icon, `aria-pressed` for toggles,
  `role="dialog"` + `aria-modal` for overlays. Controls at least 44px.

## 7. Test

- `<Name>.test.tsx` next to it. Query by role/label, simulate with `@testing-library/user-event`.
