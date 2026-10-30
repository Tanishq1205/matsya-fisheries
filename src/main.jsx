import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import StaffPasswordRecovery from './components/admin/StaffPasswordRecovery.jsx'
import { isStaffRecoveryLink } from './lib/supabaseClient.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isStaffRecoveryLink ? <StaffPasswordRecovery /> : <App />}
  </StrictMode>,
)
