import { Button } from '@ui/components/Button/Button'
import { ConfirmDialog } from '@ui/components/ConfirmDialog/ConfirmDialog'
import { Icon } from '@ui/components/Icon/Icon'
import { IconButton } from '@ui/components/IconButton/IconButton'
import { PixelArt } from '@ui/components/PixelArt/PixelArt'
import { strings } from '@ui/strings/es'
import { ContinueCard } from './ContinueCard'
import { QuickPlaySheet } from './QuickPlaySheet'
import { useHome } from './useHome'

const LOGO_SIZE = { rows: 5, cols: 5 }
const LOGO = [...'.#.#.#####.###..###...#..'].map((char) => char === '#')

export function HomeScreen() {
  const home = useHome()
  const hasActiveGame = home.activeGame !== null

  return (
    <main className="flex h-full flex-col px-5 pt-safe pb-safe">
      <header className="flex justify-end gap-1 py-2">
        <IconButton icon="help" label={strings.home.howToPlay} onClick={home.openHowToPlay} />
        <IconButton icon="chart" label={strings.home.stats} onClick={home.openStats} />
        <IconButton icon="settings" label={strings.home.settings} onClick={home.openSettings} />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <PixelArt
          size={LOGO_SIZE}
          pixels={LOGO}
          className="w-28 gap-1"
          pixelClassName="rounded-sm bg-accent"
        />
        <h1 className="text-4xl font-extrabold tracking-tight">{strings.appName}</h1>
      </div>
      <div className="mx-auto flex w-full max-w-sm flex-col gap-3 pb-8">
        {home.activeGame && (
          <ContinueCard
            sizeId={home.activeGame.sizeId}
            difficulty={home.activeGame.difficulty}
            onContinue={home.continueGame}
          />
        )}
        <Button
          variant={hasActiveGame ? 'secondary' : 'primary'}
          isFullWidth
          className="min-h-14 justify-between text-lg"
          onClick={home.openCollection}
        >
          <span className="flex items-center gap-3">
            <Icon name="grid" />
            {strings.home.collection}
          </span>
          <span className="text-sm font-medium opacity-80">
            {strings.home.collectionDetail(
              home.collectionProgress.completed,
              home.collectionProgress.total,
            )}
          </span>
        </Button>
        <Button
          variant="secondary"
          isFullWidth
          className="min-h-14 justify-start text-lg"
          onClick={home.openSheet}
        >
          <Icon name="bolt" />
          {strings.home.quickPlay}
        </Button>
      </div>
      <QuickPlaySheet
        isOpen={home.isSheetOpen}
        stats={home.stats}
        initialSizeId={home.lastSizeId}
        onChoose={home.chooseQuick}
        onClose={home.closeSheet}
      />
      <ConfirmDialog
        isOpen={home.pendingChoice !== null}
        title={strings.home.abandonTitle}
        message={strings.home.abandonMessage}
        confirmLabel={strings.home.abandonConfirm}
        onConfirm={home.confirmAbandon}
        onCancel={home.cancelAbandon}
        isDestructive
      />
    </main>
  )
}
