import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Navbar from '../components/layout/Navbar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { getDashboardStats, getTransactions, DashboardStats, TransactionListItem } from '../lib/api'
import { MAX_WIDTH, SECTION_PADDING } from '../design-system/tokens'

const decisionBadgeMap: Record<string, 'safe' | 'warn' | 'block'> = {
  approve: 'safe',
  challenge: 'warn',
  block: 'block',
}

function getSignalColumn(signals: { api_name: string; summary: string }[] | undefined, name: string): string {
  if (!signals) return '\u2014'
  const sig = signals.find(s => s.api_name === name)
  if (!sig) return '\u2014'
  if (sig.summary.includes('No') || sig.summary.includes('nominal') || sig.summary.includes('verified')) return '\u2713'
  if (sig.summary.includes('Error') || sig.summary.includes('timeout') || sig.summary.includes('unavailable')) return '\u2014'
  if (sig.summary.includes('failed') || sig.summary.includes('Anomalous') || sig.summary.includes('moved') || sig.summary.includes('replaced')) return '\u2715'
  return '\u2014'
}

function getSignalStatus(name: string, signals: { api_name: string; summary: string }[] | undefined): 'safe' | 'warn' | 'block' {
  if (!signals) return 'safe'
  const sig = signals.find(s => s.api_name === name)
  if (!sig) return 'safe'
  if (sig.summary.includes('failed') || sig.summary.includes('Anomalous') || sig.summary.includes('moved') || sig.summary.includes('replaced')) return 'block'
  if (sig.summary.includes('Error') || sig.summary.includes('timeout')) return 'warn'
  return 'safe'
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [transactions, setTransactions] = useState<TransactionListItem[]>([])
  const [error, setError] = useState<string | null>(null)

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
      setError(null)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load data'
      if (message.includes('Failed to fetch')) {
        setError('Cannot reach the backend. Make sure the server is running on port 8000.')
      } else {
        setError(message)
      }
    }
  }

  const approvedData = transactions.filter(tx => tx.decision === 'approve').map(tx => ({
    time: new Date(tx.created_at).toLocaleTimeString(),
    approved: tx.risk_score,
  }))

  const challengedData = transactions.filter(tx => tx.decision === 'challenge').map(tx => ({
    time: new Date(tx.created_at).toLocaleTimeString(),
    challenged: tx.risk_score,
  }))

  const blockedData = transactions.filter(tx => tx.decision === 'block').map(tx => ({
    time: new Date(tx.created_at).toLocaleTimeString(),
    blocked: tx.risk_score,
  }))

  const allTimes = [...new Set(transactions.map(tx => new Date(tx.created_at).toLocaleTimeString()))].sort()

  const chartData = allTimes.map(time => {
    const approved = approvedData.find(d => d.time === time)
    const challenged = challengedData.find(d => d.time === time)
    const blocked = blockedData.find(d => d.time === time)
    return {
      time,
      approved: approved?.approved || 0,
      challenged: challenged?.challenged || 0,
      blocked: blocked?.blocked || 0,
    }
  })

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

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-status-block bg-status-block-bg">
            <div className="flex items-start gap-3">
              <span className="text-status-block text-lg flex-shrink-0">&#9888;</span>
              <div className="min-w-0">
                <p className="text-body-sm font-medium text-neutral-900">Connection Error</p>
                <p className="text-body-sm text-neutral-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Analyzed', value: stats.total_transactions },
              { label: 'Fraud Blocked', value: `${stats.total_blocked} (${stats.block_rate_pct}%)` },
              { label: 'Avg Response', value: `${stats.avg_response_ms}ms` },
              { label: 'API Health', value: `${stats.signals_ok_pct}%` },
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
            <AreaChart data={chartData.length > 0 ? chartData : [{ time: '', approved: 0, challenged: 0, blocked: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E7E4" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#A8A59D' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A8A59D' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: '#FAFAF9',
                  border: '1px solid #E8E7E4',
                  borderRadius: '12px',
                  boxShadow: 'none',
                  fontSize: '13px',
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: '#757270' }}
              />
              <Area
                type="monotone"
                dataKey="approved"
                stroke="#1A7A4A"
                fill="#E8F5EE"
                strokeWidth={2}
                dot={false}
                name="Approved"
              />
              <Area
                type="monotone"
                dataKey="challenged"
                stroke="#B45309"
                fill="#FEF3C7"
                strokeWidth={2}
                dot={false}
                name="Challenged"
              />
              <Area
                type="monotone"
                dataKey="blocked"
                stroke="#9B1C1C"
                fill="#FEE2E2"
                strokeWidth={2}
                dot={false}
                name="Blocked"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Transaction Table */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-neutral-50 border-y border-neutral-200">
                  {['Time', 'Phone', 'Amount', 'SIM Swap', 'Device Swap', 'Num. Verify', 'Device Status', 'Score', 'Decision', 'Response'].map((h) => (
                    <th key={h} className="text-label-sm text-neutral-500 uppercase tracking-wider font-medium p-4 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center text-body-sm text-neutral-400 py-12">
                      No transactions analyzed yet. <Link to="/demo" className="text-neutral-600 underline">Run your first analysis.</Link>
                    </td>
                  </tr>
                )}
                {transactions.map((tx, i) => (
                  <tr key={tx.id} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                    <td className="font-mono text-body-sm p-4 whitespace-nowrap">{new Date(tx.created_at).toLocaleTimeString()}</td>
                    <td className="font-mono text-body-sm p-4 whitespace-nowrap">{tx.phone_number}</td>
                    <td className="text-body-sm p-4 whitespace-nowrap">{tx.amount_rwf.toLocaleString()} RWF</td>
                    <td className="p-4">
                      <Badge status={getSignalStatus('sim_swap', tx.signals)}>{getSignalColumn(tx.signals, 'sim_swap')}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge status={getSignalStatus('device_swap', tx.signals)}>{getSignalColumn(tx.signals, 'device_swap')}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge status={getSignalStatus('number_verification', tx.signals)}>{getSignalColumn(tx.signals, 'number_verification')}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge status={getSignalStatus('device_status', tx.signals)}>{getSignalColumn(tx.signals, 'device_status')}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              tx.risk_score >= 70 ? 'bg-status-block' : tx.risk_score >= 40 ? 'bg-status-warn' : 'bg-status-safe'
                            }`}
                            style={{ width: `${tx.risk_score}%` }}
                          />
                        </div>
                        <span className="font-mono text-body-sm text-neutral-600 w-6 text-right">{tx.risk_score}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge status={decisionBadgeMap[tx.decision]}>
                        {tx.decision.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="font-mono text-body-sm p-4 whitespace-nowrap">{tx.total_response_ms}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
