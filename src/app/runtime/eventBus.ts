export type EventBus<E> = {
  readonly emit: (events: readonly E[]) => void
  readonly subscribe: (listener: (event: E) => void) => () => void
}

export const createEventBus = <E>(): EventBus<E> => {
  const listeners = new Set<(event: E) => void>()
  return {
    emit: (events) => {
      for (const event of events) listeners.forEach((listener) => listener(event))
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
