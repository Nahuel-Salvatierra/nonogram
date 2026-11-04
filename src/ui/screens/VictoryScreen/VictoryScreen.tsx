import { SIZE_OF } from '@app/catalog'
import { Button } from '@ui/components/Button/Button'
import { PixelArt } from '@ui/components/PixelArt/PixelArt'
import { StatTile } from '@ui/components/StatTile/StatTile'
import { formatTime } from '@ui/lib/formatTime'
import { ROUTES } from '@ui/routes'
import { strings } from '@ui/strings/es'
import { Navigate } from 'react-router'
import { useVictory } from './useVictory'

export function VictoryScreen() {
  const { result, goHome, goCollection, playNext } = useVictory()
  if (!result) return <Navigate to={ROUTES.home} replace />
  const { summary, isNewRecord, name, solution, nextPuzzleId } = result
  const isCollection = summary.mode === 'collection'
  const canPlayNext = !isCollection || nextPuzzleId !== null

  return (
    <main className="flex h-full flex-col items-center justify-center gap-6 overflow-y-auto px-6 pt-safe pb-safe">
      <div className="flex flex-col items-center gap-3">
        <PixelArt
          size={SIZE_OF[summary.sizeId]}
          pixels={solution}
          className="w-40 rounded-md bg-cell p-2 shadow-md motion-safe:animate-reveal"
        />
        <h1 className="text-3xl font-extrabold">{strings.victory.title}</h1>
        {name && <p className="text-xl font-semibold text-accent">{name}</p>}
        {isNewRecord && (
          <span className="rounded-full bg-accent-soft px-4 py-1 text-sm font-bold text-accent">
            {strings.victory.newRecord}
          </span>
        )}
      </div>
      <dl className="grid w-full max-w-sm grid-cols-2 gap-3">
        <StatTile
          label={strings.victory.time}
          value={formatTime(summary.elapsedMs)}
          isHighlighted={isNewRecord}
        />
        <StatTile
          label={strings.victory.difficulty}
          value={strings.difficulty.names[summary.difficulty]}
        />
        <StatTile label={strings.victory.mistakes} value={String(summary.mistakes)} />
        <StatTile label={strings.victory.hints} value={String(summary.hintsUsed)} />
      </dl>
      <div className="flex w-full max-w-sm flex-col gap-3">
        {canPlayNext && (
          <Button isFullWidth className="min-h-14 text-lg" onClick={playNext}>
            {isCollection ? strings.victory.next : strings.victory.another}
          </Button>
        )}
        <Button variant="secondary" isFullWidth onClick={isCollection ? goCollection : goHome}>
          {isCollection ? strings.victory.collection : strings.victory.home}
        </Button>
      </div>
    </main>
  )
}
