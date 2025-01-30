import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoanCalculator from './LoanCalculator.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoanCalculator />
  </StrictMode>,
)
