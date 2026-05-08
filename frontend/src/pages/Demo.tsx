import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { useTypewriter } from '../hooks/useTypewriter'
import { analyzeTransaction, TransactionResponse } from '../lib/api'

type Scenario = 'a' | 'b' | 'c'

interface ScenarioConfig {
  phone_number: string
  amount_rwf: number
  recipient_wallet: string
}

const scenarios: Record<Scenario, ScenarioConfig> = {
  a: { phone_number: '+99999991001', amount_rwf: 45000, recipient_wallet: 'wallet_rw_001' },
  b: { phone_number: '+99999991000', amount_rwf: 180000, recipient_wallet: 'wallet_rw_002' },
  c: { phone_number: '+99999991500', amount_rwf: 320000, recipient_wallet: 'wallet_rw_003' },
}

const apiNames = ['sim_swap', 'device_swap', 'number_verification', 'device_status']

const apiLabels: Record<string, string> = {
  sim_swap: 'SIM Swap API',
  device_swap: 'Device Swap API',
  number_verification: 'Number Verification',
  device_status: 'Device Status',
}

const decisionBgMap: Record<string, string> = {
  block: 'bg-status-block-bg',
  challenge: 'bg-status-warn-bg',
  approve: 'bg-status-safe-bg',
}

const decisionBorderMap: Record<string, string> = {
  block: 'border-status-block',
  challenge: 'border-status-warn',
  approve: 'border-status-safe',
}

const decisionIconMap: Record<string, string> = {
  block: '\u2715',
  challenge: '\u26A0',
  approve: '\u2713',
}

const decisionLabelMap: Record<string, string> = {
  block: 'TRANSACTION BLOCKED',
  challenge: 'USSD CHALLENGE SENT',
  approve: 'TRANSACTION APPROVED',
}

const riskBorderMap: Record<string, string> = {
  high: 'border-status-block',
  medium: 'border-status-warn',
  low: 'border-status-safe',
}

const riskBadgeMap: Record<string, { status: 'block' | 'warn' | 'safe'; label: string }> = {
  high: { status: 'block', label: 'HIGH RISK' },
  medium: { status: 'warn', label: 'MEDIUM' },
  low: { status: 'safe', label: 'LOW RISK' },
}

const barColorMap: Record<string, string> = {
  high: 'bg-status-block',
  medium: 'bg-status-warn',
  low: 'bg-status-safe',
}

function getRiskLevel(contribution: number): string {
  if (contribution > 20) return 'high'
  if (contribution > 0) return 'medium'
  return 'low'
}

function getSignalLevel(score: number): string {
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return phone
  return phone.slice(0, 4) + ' *** *** ' + phone.slice(-3)
}

export default function Demo() {
  const [activeScenario, setActiveScenario] = useState<Scenario>('a')
  const [phone, setPhone] = useState(scenarios.a.phone_number)
  const [amount, setAmount] = useState(scenarios.a.amount_rwf)
  const [recipient, setRecipient] = useState(scenarios.a.recipient_wallet)
  const [windowHours, setWindowHours] = useState('24')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TransactionResponse | null>(null)
  const [progressPhase, setProgressPhase] = useState(0)
  const [error, setError] = useState<string | null>(null)

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
    setProgressPhase(0)
    setError(null)

    try {
      const data = await analyzeTransaction({
        phone_number: phone,
        amount_rwf: amount,
        recipient_wallet: recipient,
        sim_swap_window_hours: parseInt(windowHours),
      })

      setResult(data)
      setProgressPhase(apiNames.length)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Request failed'
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        setError('Cannot reach the backend. Make sure the server is running on port 8000.')
      } else if (message.includes('422')) {
        setError('Invalid request. Check the phone number and amount.')
      } else if (message.includes('500')) {
        setError('The backend encountered an error. Check the server logs.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const displayedReasoning = useTypewriter(result?.reasoning_text ?? '', 14)
  const isTyping = displayedReasoning.length < (result?.reasoning_text?.length ?? 0)

  const decision = result?.decision ?? 'approve'
  const decisionLevel = getSignalLevel(result?.risk_score ?? 0)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-60px)]">
          {/* Left Panel - Form */}
          <div className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0 bg-neutral-50 lg:border-r lg:border-neutral-200 p-4 sm:p-6 lg:p-8 lg:overflow-y-auto flex flex-col">
            <div className="flex-shrink-0">
              <p className="text-label-lg text-neutral-500 mb-2">TEST TRANSACTION</p>
              <p className="text-body-sm text-neutral-500 mb-6">Check a phone number against Nokia Network as Code</p>

              {/* Preset Numbers */}
              <div className="flex gap-2 mb-8 flex-wrap">
                {(['a', 'b', 'c'] as const).map((scenario) => (
                  <button
                    key={scenario}
                    onClick={() => handleScenarioChange(scenario)}
                    className={`px-4 py-2 rounded-full text-body-sm font-medium transition-colors ${
                      activeScenario === scenario
                        ? 'bg-white border border-neutral-200 text-neutral-900'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    {scenarios[scenario].phone_number}
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
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl font-mono text-mono bg-white focus:outline-none focus:border-neutral-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-neutral-500 block mb-2">AMOUNT (RWF)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl font-mono text-mono bg-white focus:outline-none focus:border-neutral-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-neutral-500 block mb-2">RECIPIENT WALLET</label>
                  <input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-neutral-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-neutral-500 block mb-2">SIM SWAP WINDOW</label>
                  <select
                    value={windowHours}
                    onChange={(e) => setWindowHours(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-neutral-400 transition-colors"
                  >
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                    <option value="72">72 hours</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button or Progress Bar */}
            {loading ? (
              <div className="mt-8">
                <p className="text-body-sm text-neutral-500 mb-3 font-mono">
                  {progressPhase === 0 ? 'Connecting to Nokia Network as Code...' : 'Querying Nokia Network as Code...'}
                </p>
                <div className="flex gap-1 h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
                  {apiNames.map((api, i) => {
                    const isDone = progressPhase > 0 && i < progressPhase
                    const label = api.replace(/_/g, ' ')
                    return (
                      <div
                        key={api}
                        className={`h-full transition-all duration-500 rounded-full ${
                          isDone ? 'bg-neutral-900' : progressPhase === 0 ? 'bg-neutral-300' : 'bg-neutral-200'
                        }`}
                        style={{ width: `${100 / apiNames.length}%` }}
                        title={label}
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2">
                  {apiNames.map((api, i) => {
                    const isDone = progressPhase > 0 && i < progressPhase
                    return (
                      <span
                        key={api}
                        className={`text-[10px] font-mono transition-colors ${
                          isDone ? 'text-neutral-600' : 'text-neutral-300'
                        }`}
                        style={{ width: `${100 / apiNames.length}%`, textAlign: 'center' }}
                      >
                        {i + 1}
                      </span>
                    )
                  })}
                </div>
              </div>
            ) : (
              <button
                onClick={handleAnalyze}
                className="w-full bg-neutral-900 text-white rounded-xl py-4 text-heading-sm font-medium mt-8 hover:bg-neutral-700 transition-colors"
              >
                Analyze Transaction
              </button>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-xl border border-status-block bg-status-block-bg">
                <div className="flex items-start gap-3">
                  <span className="text-status-block text-lg flex-shrink-0">&#9888;</span>
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium text-neutral-900">API Error</p>
                    <p className="text-body-sm text-neutral-600 mt-1 break-words">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-body-sm text-neutral-400 mt-auto pt-6">
              Nokia sandbox reports recent SIM and device swaps for all test numbers.
              Risk differentiation comes from transaction amount and velocity scoring.
            </p>
          </div>

          {/* Right Panel - Results */}
          <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 lg:overflow-y-auto">
            {error && !loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <p className="text-body-lg text-neutral-500 mb-2">Analysis failed</p>
                  <p className="text-body-sm text-neutral-400">{error}</p>
                  <button onClick={() => setError(null)} className="mt-6 text-body-sm text-neutral-600 hover:text-neutral-900 font-medium underline">Try again</button>
                </div>
              </div>
            )}

            {!error && !result && !loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <p className="text-body-lg text-neutral-400 mb-2">Enter a phone number and run analysis</p>
                  <p className="text-body-sm text-neutral-300">SafeSwitch queries all four Nokia CAMARA APIs in parallel and produces a risk assessment using only the live sandbox.</p>
                </div>
              </div>
            )}

            {loading && !result && (
              <div className="flex items-center justify-center h-full">
                <p className="text-body-lg text-neutral-400 font-mono">Waiting for response...</p>
              </div>
            )}

            {result && (
              <div className="space-y-5 max-w-2xl">
                {/* Section A: API Signal Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-heading-sm text-neutral-900 mb-3">API Signals</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.signals.map((signal, i: number) => {
                      const level = getRiskLevel(signal.risk_contribution)
                      return (
                        <motion.div
                          key={signal.api_name}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.15, duration: 0.4 }}
                        >
                          <Card borderColor={riskBorderMap[level]} className="p-5">
                            <div className="flex justify-between items-start">
                              <p className="text-label-lg text-neutral-900 uppercase tracking-wider">{apiLabels[signal.api_name] || signal.api_name}</p>
                              <span className="text-label-sm text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5 whitespace-nowrap">Nokia NaC</span>
                            </div>
                            <p className="text-body-sm text-neutral-500 mt-3 border-t border-neutral-100 pt-3">{signal.summary}</p>
                            <div className="flex justify-between items-center mt-3">
                              <Badge status={riskBadgeMap[level].status}>{riskBadgeMap[level].label}</Badge>
                              <span className="font-mono text-label-sm text-neutral-400">{signal.response_ms}ms</span>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>

                {/* Section B: Signal Aggregation */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  <h3 className="text-heading-sm text-neutral-900 mb-3">SIGNAL AGGREGATION</h3>
                  <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-3">
                    {result.signals.map((signal) => {
                      const level = getRiskLevel(signal.risk_contribution)
                      const barWidth = Math.min(Math.max(Math.abs(signal.risk_contribution) * 1.5, 8), 50)
                      return (
                        <div key={signal.api_name} className="flex items-center gap-3 sm:gap-4">
                          <span className="text-body-sm text-neutral-600 w-28 sm:w-32 flex-shrink-0 truncate">{apiLabels[signal.api_name] || signal.api_name}</span>
                          <div className="flex-1 h-2 bg-neutral-100 rounded-full">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${barColorMap[level]}`}
                              style={{ width: `${barWidth}px` }}
                            />
                          </div>
                          <span className={`font-mono text-body-sm w-14 sm:w-16 text-right flex-shrink-0 ${
                            signal.risk_contribution > 0 ? 'text-status-block' : signal.risk_contribution < 0 ? 'text-status-safe' : 'text-neutral-400'
                          }`}>
                            {signal.risk_contribution >= 0 ? '+' : ''}{signal.risk_contribution}
                          </span>
                        </div>
                      )
                    })}
                    <div className="pt-3 border-t border-neutral-200">
                      <span className={`text-heading-sm font-semibold ${
                        decisionLevel === 'high' ? 'text-status-block' : decisionLevel === 'medium' ? 'text-status-warn' : 'text-status-safe'
                      }`}>
                        Combined risk signal: {decisionLevel === 'high' ? 'CRITICAL' : decisionLevel === 'medium' ? 'MODERATE' : 'LOW'}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Section C: Reasoning Engine Output */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-heading-sm text-neutral-900">REASONING ENGINE</h3>
                    <span className="text-label-sm text-neutral-500 bg-neutral-100 rounded-full px-2 py-0.5 whitespace-nowrap">built-in &middot; no external APIs</span>
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 sm:p-5">
                    <p className="text-body-sm sm:text-body-md text-neutral-700 leading-relaxed font-mono">
                      {displayedReasoning}
                      {isTyping && <span className="animate-pulse text-neutral-400">|</span>}
                    </p>
                  </div>
                </motion.div>

                {/* Section D: Decision Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.4 }}
                  className={`border rounded-xl p-4 sm:p-5 ${decisionBgMap[decision]} ${decisionBorderMap[decision]}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{decisionIconMap[decision]}</span>
                    <p className="text-heading-sm sm:text-heading-md text-neutral-900">
                      {decisionLabelMap[decision]}
                    </p>
                  </div>
                  <p className="text-body-sm sm:text-body-md text-neutral-600">
                    Risk score {result.risk_score}/100 &middot; {decision === 'block' ? 'Blocked' : decision === 'challenge' ? 'Step-up verification required' : 'Cleared'} in {(result.total_response_ms / 1000).toFixed(1)}s
                  </p>
                  {decision === 'block' && result.alert_kinyarwanda && (
                    <p className="text-body-sm text-neutral-600 mt-3">
                      &ldquo;{result.alert_kinyarwanda}&rdquo;
                    </p>
                  )}
                  {decision === 'challenge' && (
                    <p className="text-body-sm text-neutral-600 mt-3">
                      USSD pushed to {maskPhone(result.phone_number)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 sm:gap-6 mt-4">
                    <Link to="/dashboard" className="text-body-sm text-neutral-600 hover:text-neutral-900 font-medium">View in Dashboard &rarr;</Link>
                    <button onClick={() => { setResult(null); setProgressPhase(0); }} className="text-body-sm text-neutral-600 hover:text-neutral-900 font-medium">Run another scenario &rarr;</button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
