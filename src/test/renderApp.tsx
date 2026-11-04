import { AppRuntimeProvider } from '@app/AppRuntimeContext'
import { createAppRuntime, type AppRuntime } from '@app/runtime/createAppRuntime'
import type { MockAdStore } from '@app/stores/mockAdStore'
import type { AppServices } from '@services/AppServices'
import { render, type RenderResult } from '@testing-library/react'
import { AppRoutes } from '@ui/App'
import { MemoryRouter } from 'react-router'
import { afterEach } from 'vitest'

const activeRuntimes: AppRuntime[] = []

afterEach(() => {
  activeRuntimes.splice(0).forEach((runtime) => runtime.dispose())
})

export type RenderedApp = RenderResult & { readonly runtime: AppRuntime }

export const renderApp = async (
  services: AppServices,
  path = '/',
  mockAdStore?: MockAdStore,
): Promise<RenderedApp> => {
  const runtime = createAppRuntime(services, mockAdStore)
  activeRuntimes.push(runtime)
  await runtime.start()
  const result = render(
    <AppRuntimeProvider runtime={runtime}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AppRuntimeProvider>,
  )
  return { ...result, runtime }
}
