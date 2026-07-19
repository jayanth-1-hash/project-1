import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminDashboard } from './components/AdminDashboard.tsx'
import { UserProvider } from './contexts/UserContext.tsx'

const path = window.location.pathname;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/admin' ? <AdminDashboard /> : (
      <UserProvider>
        <App />
      </UserProvider>
    )}
  </StrictMode>,
)
