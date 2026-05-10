const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

export interface TransactionRequest {
  phone_number: string
  amount_rwf: number
  recipient_wallet: string
  sim_swap_window_hours?: number
}

export interface ApiSignal {
  api_name: string
  risk_contribution: number
  response_ms: number | null
  timed_out: boolean
  summary: string
}

export interface TransactionResponse {
  transaction_id: string
  phone_number: string
  amount_rwf: number
  risk_score: number
  decision: string
  reasoning_text: string
  alert_kinyarwanda?: string
  total_response_ms: number
  signals: ApiSignal[]
  agentic_analysis?: string
}

export interface TransactionListItem {
  id: string
  created_at: string
  phone_number: string
  amount_rwf: number
  risk_score: number
  decision: string
  total_response_ms: number
  signals: ApiSignal[]
}

export interface DashboardStats {
  total_transactions: number
  total_blocked: number
  total_challenged: number
  total_approved: number
  block_rate_pct: number
  avg_response_ms: number
  signals_total: number
  signals_healthy: number
  signals_ok_pct: number
}

export async function analyzeTransaction(data: TransactionRequest): Promise<TransactionResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to analyze transaction: ${res.status} ${text}`)
  }
  return res.json()
}

export async function getTransactions(skip = 0, limit = 50): Promise<TransactionListItem[]> {
  const res = await fetch(`${API_BASE}/transactions?skip=${skip}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch transactions')
  return res.json()
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`)
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}
