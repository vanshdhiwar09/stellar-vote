import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StellarProvider } from './context/StellarContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StellarProvider>
      <App />
    </StellarProvider>
  </StrictMode>,
)
