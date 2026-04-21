import React, { useState, useEffect } from 'react'
import { History, Search, Filter, Download } from 'lucide-react'

const ScanHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL') // ALL, SAFE, SUSPICIOUS, DANGEROUS

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/history?limit=100')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'SAFE': return 'text-safe bg-safe/10 border-safe/20'
      case 'SUSPICIOUS': return 'text-suspicious bg-suspicious/10 border-suspicious/20'
      case 'DANGEROUS': return 'text-dangerous bg-dangerous/10 border-dangerous/20'
      default: return 'text-gray-400 bg-gray-800'
    }
  }

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.target.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'ALL' || item.risk === filterType
    return matchesSearch && matchesFilter
  })

  // Circular progress UI for score
  const ScoreCircle = ({ score, risk }) => {
    const radius = 16
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (score / 100) * circumference
    
    let strokeColor = '#9ca3af'
    if (risk === 'SAFE') strokeColor = '#10b981'
    if (risk === 'SUSPICIOUS') strokeColor = '#f59e0b'
    if (risk === 'DANGEROUS') strokeColor = '#ef4444'

    return (
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg className="w-10 h-10 transform -rotate-90">
          <circle 
            className="text-gray-700" 
            strokeWidth="3" 
            stroke="currentColor" 
            fill="transparent" 
            r={radius} 
            cx="20" 
            cy="20" 
          />
          <circle 
            stroke={strokeColor}
            strokeWidth="3" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset}
            strokeLinecap="round" 
            fill="transparent" 
            r={radius} 
            cx="20" 
            cy="20" 
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        <span className="absolute text-xs font-bold text-white">{score}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <History className="text-primary w-8 h-8" />
            Scan History
          </h1>
          <p className="text-gray-400">Review past threat detections and analysis reports.</p>
        </div>
        
        <button 
          onClick={fetchHistory}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors tooltip tooltip-bottom"
          title="Refresh Data"
        >
          <History className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="glass-card flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-900/50">
          <div className="flex bg-surface rounded-lg p-1 border border-gray-800 w-full md:w-auto">
            {['ALL', 'SAFE', 'SUSPICIOUS', 'DANGEROUS'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filterType === filter 
                    ? 'bg-primary text-white shadow-glow-primary' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search targets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface/80 sticky top-0 z-10 backdrop-blur-md border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Risk Level</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs font-medium border border-gray-700">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-200 max-w-sm truncate" title={item.target}>
                          {item.target}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex w-fit items-center gap-1.5 ${getRiskColor(item.risk)}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.risk === 'SAFE' ? 'bg-safe' : item.risk === 'SUSPICIOUS' ? 'bg-suspicious' : 'bg-dangerous'}`}></div>
                          {item.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ScoreCircle score={item.score} risk={item.risk} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(item.datetime).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No scan history found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScanHistory
