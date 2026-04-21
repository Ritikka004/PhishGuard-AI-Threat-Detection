import React, { useState } from 'react'
import { Mail, ScanSearch, ShieldAlert, ShieldCheck, AlertTriangle, Activity } from 'lucide-react'

const EmailAnalyzer = () => {
  const [formData, setFormData] = useState({ sender: '', subject: '', body: '' })
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleScan = async (e) => {
    e.preventDefault()
    if(!formData.sender && !formData.body) return
    
    setIsScanning(true)
    setResult(null)
    setError(null)
    
    try {
      const res = await fetch('http://localhost:5000/api/scan-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      console.log("Email API response:", data)
      if(!res.ok) throw new Error(data.error || 'Failed to analyze email')
      
      // Artificial delay for animation
      setTimeout(() => {
        setResult(data)
        setIsScanning(false)
      }, 2000)
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
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Mail className="text-primary w-8 h-8" />
          Email Analyzer
        </h1>
        <p className="text-gray-400">Detect social engineering and phishing attempts in email content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 h-fit">
          <form onSubmit={handleScan} className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Sender Email</label>
              <input 
                type="email" 
                value={formData.sender}
                onChange={(e) => setFormData({...formData, sender: e.target.value})}
                placeholder="security@paypal-update.com"
                className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Subject Line</label>
              <input 
                type="text" 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="URGENT: Your account has been suspended"
                className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Email Body</label>
              <textarea 
                rows="6"
                value={formData.body}
                onChange={(e) => setFormData({...formData, body: e.target.value})}
                placeholder="Paste the suspicious email content here..."
                className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors custom-scrollbar resize-none"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              disabled={isScanning || (!formData.sender && !formData.body)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg shadow-glow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 w-full"
            >
              {isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <ScanSearch className="w-5 h-5" />
                  Analyze Email Threat Level
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200">
              Error: {error}
            </div>
          )}

          {isScanning && (
            <div className="glass-card p-8 flex-1 flex flex-col items-center justify-center gap-6 min-h-[400px]">
              <div className="w-20 h-20 relative">
                <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" style={{animationDuration: '1s'}}></div>
                <div className="absolute inset-0 border-4 border-primary border-b-transparent rounded-full animate-spin" style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2 glow-text-primary">Inspecting Payload</h3>
                <p className="text-gray-400 text-sm">NLP analysis and domain verification in progress...</p>
              </div>
            </div>
          )}

          {!isScanning && !result && (
            <div className="glass-card p-8 flex-1 flex flex-col items-center justify-center border-dashed border-2 border-gray-700 bg-surface/30 min-h-[400px]">
              <ShieldCheck className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-center">Submit email details to the left to view the threat analysis report.</p>
            </div>
          )}

          {result && !isScanning && (
            <div className={`glass-card p-1 border-2 h-full flex flex-col ${getRiskUI(result.label).border} ${getRiskUI(result.label).glow}`}>
              <div className="bg-surface rounded-lg p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-6 border-b border-gray-800 pb-6 mb-6">
                  <div className={`w-20 h-20 rounded-full shrink-0 ${getRiskUI(result.label).bg} flex items-center justify-center`}>
                    {getRiskUI(result.label).icon}
                  </div>
                  <div>
                    <h2 className={`text-3xl font-black tracking-wider ${getRiskUI(result.label).color}`}>{result.label}</h2>
                    <p className="text-gray-400 mt-1 font-medium">Confidence Score: {result.score}/100</p>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="flex items-center gap-2 text-lg text-white font-semibold mb-4">
                    <Activity className="w-5 h-5 text-primary" />
                    Threat Indicators
                  </h3>
                  {result.reasons && result.reasons.length > 0 ? (
                    <ul className="space-y-4">
                      {result.reasons.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-gray-800/40 p-4 rounded-lg border border-gray-700/50">
                          <div className={`mt-1 rounded-full shrink-0 ${getRiskUI(result.label).color}`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <span className="text-gray-200 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-safe/10 border border-safe/20 text-safe p-4 rounded-lg flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5" />
                      No malicious indicators detected.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmailAnalyzer
