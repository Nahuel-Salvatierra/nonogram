import { AppRuntimeProvider } from '@app/AppRuntimeContext'
import { createAppRuntime } from '@app/runtime/createAppRuntime'
import { createServices } from '@services/createServices'
import { App } from '@ui/App'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const rootElement = document.getElementById('root')
const runtime = createAppRuntime(createServices())

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
