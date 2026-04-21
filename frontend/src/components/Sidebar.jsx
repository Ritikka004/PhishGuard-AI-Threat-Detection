import React from 'react'
import { NavLink } from 'react-router-dom'
import { Shield, LayoutDashboard, Link2, Mail, History } from 'lucide-react'

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'URL Scanner', path: '/scanner', icon: <Link2 size={20} /> },
    { name: 'Email Analyzer', path: '/email', icon: <Mail size={20} /> },
    { name: 'Scan History', path: '/history', icon: <History size={20} /> },
  ]

  return (
    <div className="w-64 bg-surface border-r border-gray-800 flex flex-col pt-6 pb-4">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-6 pb-8 border-b border-gray-800/50 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shadow-glow-primary">
          <Shield className="text-primary w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide glow-text-primary">PhishGuard</h1>
          <p className="text-xs text-gray-400 font-medium tracking-wider">AI THREAT DETECT</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-primary'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      {/* System Status */}
      <div className="px-6 mt-auto">
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-800">
          <div className="w-2 h-2 rounded-full bg-safe shadow-glow-safe animate-pulse"></div>
          <span className="text-sm text-gray-300 font-medium">System Online</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
