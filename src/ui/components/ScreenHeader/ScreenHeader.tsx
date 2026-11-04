import { IconButton } from '@ui/components/IconButton/IconButton'
import { strings } from '@ui/strings/es'

type ScreenHeaderProps = {
  title: string
  onBack: () => void
}

export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  return (
    <header className="flex items-center gap-2 px-2 py-2">
      <IconButton icon="back" label={strings.common.back} onClick={onBack} />
      <h1 className="text-xl font-bold">{title}</h1>
    </header>
  )
}
