import { ConfirmDialog } from '@ui/components/ConfirmDialog/ConfirmDialog'
import { ScreenHeader } from '@ui/components/ScreenHeader/ScreenHeader'
import { SegmentedControl } from '@ui/components/SegmentedControl/SegmentedControl'
import { strings } from '@ui/strings/es'
import { PackSection } from './PackSection'
import { SIZE_OPTIONS, useCollectionScreen } from './useCollectionScreen'

export function CollectionScreen() {
  const screen = useCollectionScreen()

  return (
    <main className="flex h-full flex-col pt-safe pb-safe">
      <ScreenHeader title={strings.collection.title} onBack={screen.goBack} />
      <div className="px-4 pb-3">
        <div className="mx-auto max-w-lg">
          <SegmentedControl
            label={strings.collection.sizes}
            options={SIZE_OPTIONS}
            value={screen.sizeId}
            onChange={screen.setSizeId}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="mx-auto flex max-w-lg flex-col gap-6">
          {screen.packs.map((pack) => (
            <PackSection key={pack.id} pack={pack} onOpen={screen.openPuzzle} />
          ))}
        </div>
      </div>
      <ConfirmDialog
        isOpen={screen.pendingPuzzleId !== null}
        title={strings.home.abandonTitle}
        message={strings.home.abandonMessage}
        confirmLabel={strings.home.abandonConfirm}
        onConfirm={screen.confirmAbandon}
        onCancel={screen.cancelAbandon}
        isDestructive
      />
    </main>
  )
}
