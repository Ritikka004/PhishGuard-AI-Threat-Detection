import React, { useState, useEffect } from 'react'
import { ShieldAlert, ShieldCheck, Activity, Search } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, safe: 0, suspicious: 0, dangerous: 0 })
  const [recentScans, setRecentScans] = useState([])
  const [loading, setLoading] = useState(true)

  // Dummy chart data for "Threat Trends"
  const trendData = [
    { name: 'Mon', threats: 12 },
    { name: 'Tue', threats: 19 },
    { name: 'Wed', threats: 15 },
    { name: 'Thu', threats: 25 },
    { name: 'Fri', threats: 22 },
    { name: 'Sat', threats: 30 },
    { name: 'Sun', threats: 18 },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const statsRes = await fetch('http://localhost:5000/api/stats')
      if(statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
      
      const historyRes = await fetch('http://localhost:5000/api/history?limit=5')
      if(historyRes.ok) {
        const historyData = await historyRes.json()
        setRecentScans(historyData)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, colorClass, glowClass }) => (
    <div className={`glass-card p-6 flex flex-col gap-4 relative overflow-hidden group`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl ${glowClass} transition-opacity group-hover:opacity-40`}></div>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 font-medium text-sm">{title}</p>
          <h3 className="text-3xl font-bold mt-1 text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-surface border border-gray-700 ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  )

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'SAFE': return 'text-safe bg-safe/10 border-safe/20'
      case 'SUSPICIOUS': return 'text-suspicious bg-suspicious/10 border-suspicious/20'
      case 'DANGEROUS': return 'text-dangerous bg-dangerous/10 border-dangerous/20'
      default: return 'text-gray-400 bg-gray-800'
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-gray-400">Overview of your threat detection metrics</p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-surface border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Scans" 
              value={stats.total} 
              icon={<Search className="w-6 h-6" />} 
              colorClass="text-primary"
              glowClass="bg-primary"
            />
            <StatCard 
              title="Safe Items" 
              value={stats.safe} 
              icon={<ShieldCheck className="w-6 h-6" />} 
              colorClass="text-safe shadow-glow-safe"
              glowClass="bg-safe"
            />
            <StatCard 
              title="Suspicious" 
              value={stats.suspicious} 
              icon={<ShieldAlert className="w-6 h-6" />} 
              colorClass="text-suspicious shadow-glow-suspicious"
              glowClass="bg-suspicious"
            />
            <StatCard 
              title="Dangerous" 
              value={stats.dangerous} 
              icon={<Activity className="w-6 h-6" />} 
              colorClass="text-dangerous shadow-glow-dangerous"
              glowClass="bg-dangerous"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-2 glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Threat Trends (Last 7 Days)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                    <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#ef4444' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="threats" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      dot={{ fill: '#ef4444', strokeWidth: 2 }}
                      activeDot={{ r: 8, className: "shadow-glow-dangerous" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Scans Area */}
            <div className="glass-card p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Scans</h3>
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">Live</span>
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                {recentScans.length > 0 ? recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-800 bg-gray-800/30">
                    <div className="overflow-hidden flex-1 mr-4">
                      <p className="text-sm font-medium text-gray-200 truncate">{scan.target}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(scan.datetime).toLocaleString()}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold border ${getRiskColor(scan.risk)}`}>
                      {scan.risk}
                    </div>
                  </div>
                )) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                    No recent scans found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
