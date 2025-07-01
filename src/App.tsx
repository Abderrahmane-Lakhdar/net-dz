import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { Dashboard } from './pages/Dashboard'
import { Transfers } from './pages/Transfers'
import { Clients } from './pages/Clients'
import { AdvancedInsights } from './pages/AdvancedInsights'
import { SimsUssd } from './pages/SimsUssd'
import { SystemHealth } from './pages/SystemHealth'
import { Pricing } from './pages/Pricing'
import { Database } from './pages/Database'
import { Security } from './pages/Security'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de CreditPro...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header - spans full width of remaining space */}
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-950">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/insights" element={<AdvancedInsights />} />
              <Route path="/sims" element={<SimsUssd />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/database" element={<Database />} />
              <Route path="/system-health" element={<SystemHealth />} />
              <Route path="/security" element={<Security />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App