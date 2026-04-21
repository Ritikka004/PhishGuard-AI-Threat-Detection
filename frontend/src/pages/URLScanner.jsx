import React, { useState } from 'react'
import { Link2, ScanSearch, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react'

const URLScanner = () => {
  const [url, setUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleScan = async (e) => {
    e.preventDefault()
    if(!url) return
    
    setIsScanning(true)
    setResult(null)
    setError(null)
    
    try {
      const res = await fetch('http://localhost:5000/api/scan-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || 'Failed to scan URL')
      
      // Artificial delay for animation
      setTimeout(() => {
        setResult(data)
        setIsScanning(false)
      }, 1500)
    } catch (err) {
      setError(err.message)
      setIsScanning(false)
    }
  }

  const getRiskUI = (label) => {
    switch(label) {
      case 'SAFE': return { color: 'text-safe', bg: 'bg-safe/20', border: 'border-safe', glow: 'shadow-glow-safe', icon: <ShieldCheck className="w-12 h-12 text-safe" /> }
      case 'SUSPICIOUS': return { color: 'text-suspicious', bg: 'bg-suspicious/20', border: 'border-suspicious', glow: 'shadow-glow-suspicious', icon: <AlertTriangle className="w-12 h-12 text-suspicious" /> }
      case 'DANGEROUS': return { color: 'text-dangerous', bg: 'bg-dangerous/20', border: 'border-dangerous', glow: 'shadow-glow-dangerous', icon: <ShieldAlert className="w-12 h-12 text-dangerous" /> }
      default: return { color: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-600', glow: '', icon: null }
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Link2 className="text-primary w-8 h-8" />
          URL Scanner
        </h1>
        <p className="text-gray-400">Analyze URLs for phishing patterns and malicious indicators.</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleScan} className="flex flex-col gap-4">
          <label className="text-sm font-medium text-gray-300">Target URL</label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Link2 className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/login"
                className="w-full bg-surface border border-gray-700 rounded-lg pl-12 pr-4 py-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isScanning || !url}
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-lg shadow-glow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <ScanSearch className="w-5 h-5" />
                  Analyze Target
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200">
          Error: {error}
        </div>
      )}

      {isScanning && (
        <div className="glass-card p-12 flex flex-col items-center justify-center gap-6">
          <div className="w-24 h-24 relative">
            <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ScanSearch className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2 glow-text-primary">Running Analysis Engine</h3>
            <p className="text-gray-400">Extracting features and querying models...</p>
          </div>
        </div>
      )}

      {result && !isScanning && (
        <div className={`glass-card p-1 border-2 ${getRiskUI(result.label).border} ${getRiskUI(result.label).glow}`}>
          <div className="bg-surface rounded-lg p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-800">
              <div className={`w-24 h-24 rounded-full ${getRiskUI(result.label).bg} flex items-center justify-center mb-4`}>
                {getRiskUI(result.label).icon}
              </div>
              <h2 className={`text-3xl font-black tracking-wider ${getRiskUI(result.label).color}`}>{result.label}</h2>
              <p className="text-gray-400 mt-2 font-medium">Risk Score: {result.score}/100</p>
            </div>
            
            <div className="md:col-span-2 flex flex-col justify-center gap-6">
              <div>
                <h3 className="text-lg text-gray-400 mb-1">Target Analyzed</h3>
                <p className="text-white bg-gray-800/50 p-3 rounded border border-gray-700 break-all">{result.target}</p>
              </div>
              
              <div>
                <h3 className="text-lg text-gray-400 mb-2">Why flagged?</h3>
                <ul className="space-y-2">
                  {result.reasons && result.reasons.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${getRiskUI(result.label).bg} ring-2 ring-offset-2 ring-offset-surface ${getRiskUI(result.label).color.replace('text-', 'ring-')}`}></div>
                      <span className="text-gray-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default URLScanner
