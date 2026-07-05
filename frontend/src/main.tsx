import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { StellarProvider } from './context/StellarContext.tsx';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StellarProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StellarProvider>
  </StrictMode>,
)
