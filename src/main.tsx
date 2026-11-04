import { AppRuntimeProvider } from '@app/AppRuntimeContext'
import { createAppRuntime } from '@app/runtime/createAppRuntime'
import { createMockAdStore } from '@app/stores/mockAdStore'
import { createServices } from '@services/createServices'
import { App } from '@ui/App'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const rootElement = document.getElementById('root')
const mockAdStore = createMockAdStore()
const runtime = createAppRuntime(
  createServices({ presentMockAd: mockAdStore.getState().present }),
  mockAdStore,
)

if (rootElement) {
  void runtime.start().then(() => {
    createRoot(rootElement).render(
      <StrictMode>
        <AppRuntimeProvider runtime={runtime}>
          <App />
        </AppRuntimeProvider>
      </StrictMode>,
    )
  })
}
