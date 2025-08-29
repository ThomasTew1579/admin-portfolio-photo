import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import Admin from './Admin'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Admin />
    </BrowserRouter>
  </StrictMode>,
)
