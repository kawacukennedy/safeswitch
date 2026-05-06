import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { useTypewriter } from '../hooks/useTypewriter'
import { analyzeTransaction, TransactionResponse } from '../lib/api'

type Scenario = 'clean' | 'device_swap' | 'sim_swap'

interface ScenarioConfig {
  phone_number: string
  amount_rwf: number
  recipient_wallet: string
}

const scenarios: Record<Scenario, ScenarioConfig> = {
  clean: { phone_number: '+99999991000', amount_rwf: 50000, recipient_wallet: 'wallet_rw_001' },
  device_swap: { phone_number: '+99999991234', amount_rwf: 180000, recipient_wallet: 'wallet_rw_002' },
  'sim_swap': { phone_number: '+99999991500', amount_rwf: 320000, recipient_wallet: 'wallet_rw_003' },
}

const apiNames = ['sim_swap', 'device_swap', 'number_verification', 'device_status']

export default function Demo() {
  const [activeScenario, setActiveScenario] = useState<Scenario>('clean')
  const [phone, setPhone] = useState(scenarios.clean.phone_number)
  const [amount, setAmount] = useState(scenarios.clean.amount_rwf)
  const [recipient, setRecipient] = useState(scenarios.clean.recipient_wallet)
  const [window, setWindow] = useState('24')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TransactionResponse | null>(null)
  const [completedApis, setCompletedApis] = useState<string[]>([])

  const handleScenarioChange = (scenario: Scenario) => {
    setActiveScenario(scenario)
    const config = scenarios[scenario]
    setPhone(config.phone_number)
    setAmount(config.amount_rwf)
    setRecipient(config.recipient_wallet)
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setResult(null)
    setCompletedApis([])

    try {
      const data = await analyzeTransaction({
        phone_number: phone,
        amount_rwf: amount,
        recipient_wallet: recipient,
        sim_swap_window_hours: parseInt(window),
      })

      setResult(data)

      for (const api of apiNames) {
        await new Promise(r => setTimeout(r, 400))
        setCompletedApis(prev => [...prev, api])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const displayedReasoning = useTypewriter(result?.reasoning_text ?? '', 14)

  const getStatusColor = (decision: string) => {
    if (decision === 'block') return 'status-block'
    if (decision === 'challenge') return 'status-warn'
    return 'status-safe'
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Panel */}
        <div className="w-[40%] bg-neutral-50 border-r border-neutral-200 p-10 overflow-y-auto">
          <p className="text-label-lg text-neutral-500 mb-2">SIMULATE TRANSACTION</p>
          <p className="text-body-sm text-neutral-500 mb-8">Run a real check against Nokia Network as Code</p>

          {/* Scenario Selector */}
          <div className="flex gap-2 mb-8">
            {(['clean', 'device_swap', 'sim_swap'] as const).map((scenario) => (
              <button
                key={scenario}
                onClick={() => handleScenarioChange(scenario)}
                className={`px-4 py-2 rounded-full text-body-sm font-medium transition-colors ${
                  activeScenario === scenario
                    ? 'bg-white border border-neutral-200 text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {scenario === 'clean' ? 'Clean transaction' : scenario === 'device_swap' ? 'Recent device swap' : 'SIM swap + anomaly'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="text-label-sm text-neutral-500 block mb-2">PHONE NUMBER</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl font-mono text-mono focus:outline-none focus:border-neutral-400"
              />
            </div>
            <div>
              <label className="text-label-sm text-neutral-500 block mb-2">AMOUNT (RWF)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl font-mono text-mono focus:outline-none focus:border-neutral-400"
              />
            </div>
            <div>
              <label className="text-label-sm text-neutral-500 block mb-2">RECIPIENT WALLET</label>
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400"
              />
            </div>
            <div>
              <label className="text-label-sm text-neutral-500 block mb-2">SIM SWAP WINDOW</label>
              <select
                value={window}
                onChange={(e) => setWindow(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400"
              >
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-neutral-900 text-white rounded-xl py-4 text-heading-sm font-medium mt-8 hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Transaction'}
          </button>

          {loading && (
            <div className="mt-6">
              <p className="text-body-sm text-neutral-500 mb-3 font-mono">Querying Nokia Network as Code...</p>
              <div className="space-y-2">
                {apiNames.map((api) => (
                  <div key={api} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${completedApis.includes(api) ? 'bg-neutral-900' : 'bg-neutral-300'}`} />
                    <span className="text-body-sm text-neutral-600">{api.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-body-sm text-neutral-400 mt-6">
            Live calls to Nokia Network as Code sandbox.
          </p>
        </div>

        {/* Right Panel */}
        <div className="w-[60%] bg-white p-10 overflow-y-auto">
          {!result && (
            <div className="flex items-center justify-center h-full">
              <p className="text-body-lg text-neutral-400">Select a scenario and run analysis to see live results</p>
            </div>
          )}

          {result && (
            <div className="space-y-8">
              {/* API Signal Cards */}
              <div>
                <h3 className="text-heading-sm text-neutral-900 mb-4">API Signals</h3>
                <div className="grid grid-cols-2 gap-4">
                  {result.signals.map((signal, i: number) => (
                    <motion.div
                      key={signal.api_name}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      <Card borderColor={`border-${getStatusColor(result.decision)}`} className="p-6">
                        <div className="flex justify-between items-start">
                          <p className="text-heading-sm text-neutral-900">{signal.api_name.replace('_', ' ').toUpperCase()}</p>
                          <span className="text-label-sm text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5">Nokia NaC</span>
                        </div>
                        <p className="text-body-sm text-neutral-500 mt-3">{signal.summary}</p>
                        <div className="flex justify-between items-center mt-4">
                          <Badge status={signal.risk_contribution > 20 ? 'block' : signal.risk_contribution > 10 ? 'warn' : 'safe'}>
                            {signal.risk_contribution > 20 ? 'HIGH RISK' : signal.risk_contribution > 0 ? 'MEDIUM' : 'LOW RISK'}
                          </Badge>
                          <span className="font-mono text-label-sm text-neutral-400">{signal.response_ms}ms</span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Reasoning Engine Output */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-heading-sm text-neutral-900">REASONING ENGINE</h3>
                  <span className="text-label-sm text-neutral-500 bg-neutral-100 rounded-full px-2 py-0.5">on-device · no external APIs</span>
                </div>
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
                  <p className="text-body-md text-neutral-700 leading-relaxed font-mono">
                    {displayedReasoning}
                    <span className="animate-pulse">|</span>
                  </p>
                </div>
              </div>

              {/* Decision Banner */}
              <div className={`border rounded-xl p-6 bg-${getStatusColor(result.decision)}-bg border-${getStatusColor(result.decision)}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{result.decision === 'block' ? '✕' : result.decision === 'challenge' ? '⚠' : '✓'}</span>
                  <p className="text-heading-md text-neutral-900">
                    TRANSACTION {result.decision.toUpperCase()}
                  </p>
                </div>
                <p className="text-body-md text-neutral-600">
                  Risk score {result.risk_score}/100 · {result.decision === 'block' ? 'Blocked' : result.decision === 'challenge' ? 'Challenged' : 'Cleared'} in {(result.total_response_ms / 1000).toFixed(1)}s
                </p>
                {result.decision === 'block' && result.alert_kinyarwanda && (
                  <p className="text-body-sm text-neutral-600 mt-3">
                    Alert sent: "{result.alert_kinyarwanda}"
                  </p>
                )}
                {result.decision === 'challenge' && (
                  <p className="text-body-sm text-neutral-600 mt-3">
                    USSD pushed to {phone}
                  </p>
                )}
                <div className="flex gap-4 mt-4">
                  <Link to="/dashboard" className="text-body-sm text-neutral-600 hover:text-neutral-900">View in Dashboard →</Link>
                  <button onClick={() => { setResult(null); }} className="text-body-sm text-neutral-600 hover:text-neutral-900">Run another scenario →</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
