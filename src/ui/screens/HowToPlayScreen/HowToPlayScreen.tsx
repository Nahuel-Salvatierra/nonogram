import { firstTutorialPuzzleId } from '@app/collection/selectors'
import { useBackButton } from '@app/hooks/useBackButton'
import { useGameActions } from '@app/hooks/useGameActions'
import { Button } from '@ui/components/Button/Button'
import { ScreenHeader } from '@ui/components/ScreenHeader/ScreenHeader'
import { useGoBack } from '@ui/hooks/useGoBack'
import { ROUTES } from '@ui/routes'
import { strings } from '@ui/strings/es'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { MiniLine } from './MiniLine'

type RuleSectionProps = { title: string; text: string; children?: ReactNode }

function RuleSection({ title, text, children }: RuleSectionProps) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-surface-raised p-4 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-ink-muted">{text}</p>
      {children}
    </section>
  )
}

export function HowToPlayScreen() {
  const goBack = useGoBack()
  const navigate = useNavigate()
  const { openCollectionPuzzle } = useGameActions()
  const tutorialId = firstTutorialPuzzleId()
  useBackButton(goBack)

  const startTutorial = (): void => {
    if (!tutorialId) return
    void openCollectionPuzzle(tutorialId)
    void navigate(ROUTES.game)
  }

  return (
    <main className="flex h-full flex-col pt-safe pb-safe">
      <ScreenHeader title={strings.howToPlay.title} onBack={goBack} />
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="mx-auto flex max-w-lg flex-col gap-4">
          <RuleSection title={strings.howToPlay.goal} text={strings.howToPlay.goalText} />
          <RuleSection title={strings.howToPlay.clues} text={strings.howToPlay.cluesText}>
            <p className="text-sm font-medium">{strings.howToPlay.cluesExample}</p>
            <MiniLine clue="2 1" pattern="##.#." />
            <MiniLine clue="2 1" pattern=".##.#" />
            <MiniLine clue="2 1" pattern="##..#" />
          </RuleSection>
          <RuleSection title={strings.howToPlay.tools} text={strings.howToPlay.toolsText}>
            <MiniLine clue="3" pattern="x###x" />
          </RuleSection>
          <RuleSection title={strings.howToPlay.help} text={strings.howToPlay.helpText} />
          {tutorialId && (
            <Button isFullWidth className="min-h-14 text-lg" onClick={startTutorial}>
              {strings.howToPlay.start}
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
