import { useEffect, useRef } from 'react'
import { useRuntime } from '../AppRuntimeContext'

export const useBackButton = (handler: () => void, isEnabled = true): void => {
  const { backStack } = useRuntime()
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!isEnabled) return undefined
    return backStack.push(() => handlerRef.current())
  }, [backStack, isEnabled])
}
