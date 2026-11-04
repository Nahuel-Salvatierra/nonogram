import { ScreenHeader } from '@ui/components/ScreenHeader/ScreenHeader'
import { SegmentedControl } from '@ui/components/SegmentedControl/SegmentedControl'
import { StatTile } from '@ui/components/StatTile/StatTile'
import { formatOptionalTime, formatTime } from '@ui/lib/formatTime'
import { strings } from '@ui/strings/es'
import { useStatsScreen } from './useStatsScreen'

export function StatsScreen() {
  const screen = useStatsScreen()
  const { view } = screen

  return (
    <main className="flex h-full flex-col pt-safe pb-safe">
      <ScreenHeader title={strings.stats.title} onBack={screen.goBack} />
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="mx-auto flex max-w-lg flex-col gap-4">
          <SegmentedControl
            label={strings.stats.size}
            options={screen.sizeOptions}
            value={screen.size}
            onChange={screen.setSize}
          />
          <SegmentedControl
            label={strings.stats.difficulty}
            options={screen.difficultyOptions}
            value={screen.difficulty}
            onChange={screen.setDifficulty}
          />
          <dl className="grid grid-cols-2 gap-3">
            <StatTile label={strings.stats.started} value={String(view.started)} />
            <StatTile label={strings.stats.completed} value={String(view.completed)} />
            <StatTile label={strings.stats.abandoned} value={String(view.abandoned)} />
            <StatTile label={strings.stats.perfect} value={String(view.perfectCompleted)} />
            <StatTile
              label={strings.stats.bestTime}
              value={formatOptionalTime(view.bestTimeMs)}
              isHighlighted
            />
            <StatTile
              label={strings.stats.averageTime}
              value={formatOptionalTime(view.averageTimeMs)}
            />
            <StatTile label={strings.stats.totalTime} value={formatTime(view.totalTimeMs)} />
          </dl>
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-ink-muted">{strings.stats.collection}</h2>
            <ul className="flex flex-col gap-1 rounded-2xl bg-surface-raised p-4 shadow-sm">
              {screen.collection.map(({ sizeId, completed, total }) => (
                <li key={sizeId} className="font-medium tabular-nums">
                  {strings.stats.collectionProgress(strings.sizes.names[sizeId], completed, total)}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
