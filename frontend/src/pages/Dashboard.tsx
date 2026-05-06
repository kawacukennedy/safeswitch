import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Navbar from '../components/layout/Navbar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { getDashboardStats, getTransactions } from '../lib/api'
import { MAX_WIDTH, SECTION_PADDING } from '../design-system/tokens'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [statsData, txData] = await Promise.all([
        getDashboardStats(),
        getTransactions(0, 50)
      ])
      setStats(statsData)
      setTransactions(txData)
    } catch (e) {
      console.error('Failed to load data', e)
    }
  }

  const chartData = transactions.map(tx => ({
    time: new Date(tx.created_at).toLocaleTimeString(),
    score: tx.risk_score,
    decision: tx.decision,
  }))

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className={`${SECTION_PADDING} ${MAX_WIDTH}`}>
        <div className="flex justify-between items-center mb-10">
          <h1 className="font-instrument text-display-lg text-neutral-900">Dashboard</h1>
          <Link to="/demo">
            <button className="bg-neutral-900 text-white text-body-sm font-medium rounded-full px-6 py-3 hover:bg-neutral-700 transition-colors">
              Run New Analysis
            </button>
          </Link>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Analyzed', value: stats.total_transactions },
              { label: 'Fraud Blocked', value: `${stats.total_blocked} (${stats.block_rate_pct}%)` },
              { label: 'Avg Response', value: `${stats.avg_response_ms}ms` },
              { label: 'API Uptime', value: '99.8%' },
            ].map((stat, i) => (
              <Card key={i} className="p-6">
                <p className="font-instrument text-display-lg text-neutral-900">{stat.value}</p>
                <p className="text-label-lg text-neutral-500 uppercase tracking-wider mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Risk Chart */}
        <Card className="mb-12 p-8">
          <h2 className="text-heading-sm text-neutral-900 mb-6">Risk Score Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#A8A59D' }} />
              <YAxis tick={{ fontSize: 11, fill: '#A8A59D' }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E7E4" />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#0F0E0D" fill="#F5F4F2" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Transaction Table */}
        <Card className="overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-y border-neutral-200">
                {['Time', 'Phone', 'Amount', 'SIM Swap', 'Device Swap', 'Num. Verify', 'Device Status', 'Score', 'Decision', 'Response'].map((h) => (
                  <th key={h} className="text-label-sm text-neutral-500 uppercase tracking-wider font-medium p-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={tx.id} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                  <td className="font-mono text-sm p-4">{new Date(tx.created_at).toLocaleTimeString()}</td>
                  <td className="font-mono text-sm p-4">{tx.phone_number}</td>
                  <td className="text-body-sm p-4">{tx.amount_rwf.toLocaleString()} RWF</td>
                  <td className="p-4"><Badge status="safe">—</Badge></td>
                  <td className="p-4"><Badge status="safe">—</Badge></td>
                  <td className="p-4"><Badge status="safe">✓</Badge></td>
                  <td className="p-4"><Badge status="safe">✓</Badge></td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${tx.risk_score >= 70 ? 'bg-status-block' : tx.risk_score >= 40 ? 'bg-status-warn' : 'bg-status-safe'}`}
                          style={{ width: `${tx.risk_score}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm">{tx.risk_score}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge status={tx.decision === 'block' ? 'block' : tx.decision === 'challenge' ? 'warn' : 'safe'}>
                      {tx.decision.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="font-mono text-sm p-4">{tx.total_response_ms}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
