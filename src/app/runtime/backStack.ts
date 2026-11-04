export type BackHandler = () => void

export type BackStack = {
  readonly push: (handler: BackHandler) => () => void
  readonly handle: () => boolean
}

export const createBackStack = (): BackStack => {
  const handlers: BackHandler[] = []
  return {
    push: (handler) => {
      handlers.push(handler)
      return () => {
        const index = handlers.lastIndexOf(handler)
        if (index >= 0) handlers.splice(index, 1)
      }
    },
    handle: () => {
      const top = handlers.at(-1)
      if (!top) return false
      top()
      return true
    },
  }
}
