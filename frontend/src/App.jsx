import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import URLScanner from './pages/URLScanner'
import EmailAnalyzer from './pages/EmailAnalyzer'
import ScanHistory from './pages/ScanHistory'

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-background text-gray-100 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {/* Subtle background glow effects */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-safe/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <main className="p-8 min-h-full relative z-10">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scanner" element={<URLScanner />} />
              <Route path="/email" element={<EmailAnalyzer />} />
              <Route path="/history" element={<ScanHistory />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
