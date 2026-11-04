import { Button } from '@ui/components/Button/Button'
import { ConfirmDialog } from '@ui/components/ConfirmDialog/ConfirmDialog'
import { ScreenHeader } from '@ui/components/ScreenHeader/ScreenHeader'
import { SegmentedControl } from '@ui/components/SegmentedControl/SegmentedControl'
import { Toggle } from '@ui/components/Toggle/Toggle'
import { strings } from '@ui/strings/es'
import { useSettingsScreen, type BooleanSettingKey } from './useSettingsScreen'

const TOGGLES: readonly { key: BooleanSettingKey; label: string; description?: string }[] = [
  {
    key: 'autoValidate',
    label: strings.settings.autoValidate,
    description: strings.settings.autoValidateHint,
  },
  { key: 'dimCompletedClues', label: strings.settings.dimCompletedClues },
  {
    key: 'autoCross',
    label: strings.settings.autoCross,
    description: strings.settings.autoCrossHint,
  },
  { key: 'highlightLines', label: strings.settings.highlightLines },
  { key: 'showTimer', label: strings.settings.showTimer },
]

export function SettingsScreen() {
  const screen = useSettingsScreen()

  return (
    <main className="flex h-full flex-col pt-safe pb-safe">
      <ScreenHeader title={strings.settings.title} onBack={screen.goBack} />
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="mx-auto flex max-w-lg flex-col gap-6">
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-ink-muted">{strings.settings.theme}</h2>
            <SegmentedControl
              label={strings.settings.theme}
              options={screen.themeOptions}
              value={screen.settings.theme}
              onChange={screen.setTheme}
            />
          </section>
          <section className="divide-y divide-line rounded-2xl bg-surface-raised px-4 shadow-sm">
            {TOGGLES.map(({ key, label, description }) => (
              <Toggle
                key={key}
                label={label}
                description={description}
                isChecked={screen.settings[key]}
                onChange={(value) => screen.setFlag(key, value)}
              />
            ))}
          </section>
          <Button variant="secondary" className="text-danger" onClick={screen.openReset}>
            {strings.settings.resetStats}
          </Button>
          <p className="text-center text-sm text-ink-subtle">
            {strings.settings.version(screen.version)}
          </p>
        </div>
      </div>
      <ConfirmDialog
        isOpen={screen.isResetOpen}
        title={strings.settings.resetTitle}
        message={strings.settings.resetMessage}
        confirmLabel={strings.settings.resetConfirm}
        onConfirm={screen.confirmReset}
        onCancel={screen.closeReset}
        isDestructive
      />
    </main>
  )
}
