import { TOOLS, type Tool } from '@app/catalog'
import { Icon, type IconName } from '@ui/components/Icon/Icon'
import { cn } from '@ui/lib/cn'
import { strings } from '@ui/strings/es'

const TOOL_ICONS: Record<Tool, IconName> = { fill: 'square', cross: 'close' }

type ToolToggleProps = {
  value: Tool
  onChange: (tool: Tool) => void
}

export function ToolToggle({ value, onChange }: ToolToggleProps) {
  return (
    <div
      role="group"
      aria-label={strings.game.tools}
      className="mx-auto flex w-full max-w-sm gap-1 rounded-2xl bg-surface-sunken p-1"
    >
      {TOOLS.map((tool) => (
        <button
          key={tool}
          type="button"
          aria-pressed={tool === value}
          onClick={() => onChange(tool)}
          className={cn(
            'flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl text-base font-semibold text-ink-muted transition-colors duration-150',
            tool === value && 'bg-accent text-accent-ink shadow-sm',
          )}
        >
          <Icon name={TOOL_ICONS[tool]} className={cn(tool === 'fill' && 'fill-current')} />
          {strings.game.toolNames[tool]}
        </button>
      ))}
    </div>
  )
}
