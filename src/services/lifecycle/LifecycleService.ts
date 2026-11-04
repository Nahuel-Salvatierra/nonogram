export type Unsubscribe = () => void

export interface LifecycleService {
  onActiveChange(listener: (isActive: boolean) => void): Unsubscribe
  onBackButton(listener: () => void): Unsubscribe
  exitApp(): void
}
