import { cn } from '@ui/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink shadow-sm active:opacity-85',
  secondary: 'bg-surface-sunken text-ink active:opacity-80',
  ghost: 'bg-transparent text-accent active:bg-accent-soft',
  danger: 'bg-danger text-accent-ink active:opacity-85',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  isFullWidth?: boolean
}

export function Button({
  variant = 'primary',
  isFullWidth = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold transition-opacity duration-150 disabled:opacity-40',
        VARIANT_CLASSES[variant],
        isFullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
