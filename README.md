<div align="center">
  <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px;">
    <div style="width: 12px; height: 12px; background: #0F0E0D; border-radius: 50%;"></div>
    <span style="font-size: 24px; font-weight: 600; color: #0F0E0D;">SafeSwitch</span>
  </div>
  <p style="font-size: 18px; color: #757270; max-width: 560px; margin: 0 auto;">
    Real-time fraud prevention for mobile money.<br>
    Built on Nokia's Network as Code CAMARA APIs.
  </p>
  <br>
  <p>
    <a href="https://safeswitch.onrender.com"><strong>Live Demo</strong></a> ·
    <a href="https://github.com/kawacukennedy/safeswitch.git"><strong>Source Code</strong></a> ·
    <a href="https://www.hackerearth.com/challenges/hackathon/africa-ignite-hackathon/"><strong>GSMA Africa Ignite 2026</strong></a>
  </p>
</div>

<br>

---

## What it does

SafeSwitch intercepts mobile money transactions in the 1-2 second window before approval. It fires **four CAMARA API calls simultaneously** through Nokia's Network as Code, then feeds those signals into an **on-device reasoning engine** that computes a fraud score and generates plain-language analysis — all without any external AI API.

| API | What it checks |
|-----|---------------|
| **SIM Swap** | Was this SIM card replaced in the last 24 hours? |
| **Device Swap** | Has this number moved to a new physical device? |
| **Number Verification** | Does this number match the session device? |
| **Device Status** | Is this device showing anomalous connectivity? |

All four calls execute in parallel via `asyncio.gather()` — total latency equals the **slowest** individual call, not the sum.

## Why this matters

> In March 2026, fraudsters stole **$3.4 million** from Equity Bank Rwanda using SIM swap attacks.

Most fraud detection is reactive — by the time a flag is raised, the money is gone. SafeSwitch puts the check **inside the transaction window**, using telecom-layer intelligence that most fraud systems never see. It acts before the transaction completes, not after.

## Architecture

```
User → Transaction Request
        │
        ▼
  ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
  │ 4× CAMARA APIs   │────▶│ Aggregation  │────▶│   Scorer     │
  │ (parallel)       │     │ Layer        │     │   0-100      │
  └─────────────────┘     └──────────────┘     └──────┬───────┘
                                                      │
                                                      ▼
  ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
  │  Reasoning       │◀────│   Decision   │◀────│  Thresholds  │
  │  Engine (<1ms)   │     │  Engine      │     │  70/40       │
  └─────────────────┘     └──────────────┘     └──────────────┘
        │
        ▼
  Approve / Challenge / Block
```

### Key Components

| Module | File | Purpose |
|--------|------|---------|
| **Orchestrator** | `orchestrator.py` | Fires 4 CAMARA calls in parallel, handles timeouts/errors gracefully |
| **Aggregator** | `aggregator.py` | Normalises API responses into a consistent signal dict |
| **Scorer** | `scorer.py` | Continuous recency scoring, combo synergy bonus, velocity checks, amount weighting |
| **Reasoning Engine** | `reasoning_engine.py` | Pure-Python pattern matcher — no LLM, no external API, runs in <1ms |
| **Decision Engine** | `decision.py` | Applies configurable risk thresholds (block ≥70, challenge ≥40) |

### The Reasoning Engine (no LLM required)

SafeSwitch's reasoning engine uses a **multi-layer template composition system**:

1. **Signal classification** — each API response is classified into named states (e.g. `critical_fresh`, `combo_attack`, `anomalous`)
2. **Pattern matching** — signal combinations match known fraud patterns (`active_account_takeover`, `probable_sim_swap_fraud`, `device_hijack`, etc.)
3. **Sentence composition** — classified signals select from curated sentence fragment libraries, assembled into a coherent paragraph
4. **Kinyarwanda alerts** — block decisions include Kinyarwanda-language fraud alerts for Rwandan users

This approach is **deterministic, auditable, and fully explainable** — properties that regulators and MNOs require in production fraud systems.

## Scoring Model

| Signal | Weight |
|--------|--------|
| SIM swap (0-60 min ago) | 50 pts (continuous decay) |
| SIM swap + device swap combo bonus | +10 pts |
| Device swap (alone) | 15 pts |
| Number verification failed | 20 pts |
| Roaming / anomalous | 10 pts |
| High transaction velocity (3-4 txns) | 15 pts |
| High transaction velocity (5+ txns) | 25 pts |
| Amount >100k RWF multiplier | ×1.15 (capped at 100) |
| >2 APIs unavailable | +15 pts |

**Confidence**: 4/4 APIs → 1.0, 3/4 → 0.85, 2/4 → 0.6, 1/4 → 0.35, 0/4 → 0.0

## Quick Start (Development)

```bash
# One-command launcher (backend + frontend)
./start.sh

# Or manually:
cd backend && pip install -r requirements.txt
cp .env.example .env   # Add your NAC_API_KEY
uvicorn main:app --reload --port 8000

cd frontend && npm install && npm run dev
```

Requires a **Nokia Network as Code API key** from the [Nokia NaC Developer Portal](https://developer.networkascode.nokia.io/).

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Frontend (SPA) |
| `GET` | `/docs` | OpenAPI documentation |
| `POST` | `/api/v1/analyze` | Run full fraud analysis pipeline |
| `GET` | `/api/v1/transactions` | Paginated transaction history |
| `GET` | `/api/v1/dashboard/stats` | Aggregate dashboard statistics |
| `GET` | `/api/v1/health` | Health check |

### Analyze Endpoint

```json
POST /api/v1/analyze
{
  "phone_number": "+99999991000",
  "amount_rwf": 50000,
  "recipient_wallet": "wallet_rw_001",
  "sim_swap_window_hours": 24
}
```

```json
{
  "risk_score": 75,
  "decision": "block",
  "reasoning_text": "SIM swap detected 10 minutes ago...",
  "alert_kinyarwanda": "Umutekano w'konti yawe ufite ikibazo...",
  "total_response_ms": 5234,
  "signals": [
    { "api_name": "sim_swap", "risk_contribution": 50, "summary": "SIM replaced 10 minutes ago" }
  ]
}
```

## Sandbox Notes

The Nokia sandbox returns identical data for all test phone numbers (recent SIM swap + device swap). Every transaction scores **75** and is blocked. This is the sandbox's fixed behaviour — not a bug. The demo value is in observing the full pipeline execution: parallel API calls, signal aggregation, continuous recency scoring, combo synergy bonus, amount-weighted risk, and the reasoning engine's output.

## Dependencies

| Requirement | Source | Required |
|-------------|--------|----------|
| `NAC_API_KEY` | [Nokia NaC Portal](https://developer.networkascode.nokia.io/) | Yes |
| Python 3.11+ | — | Yes |
| Node 20+ | — | For frontend build only |

**No external AI API keys required. No model downloads. No LLM dependencies.**

---

<div align="center">
  <p>
    Built by <strong>KAWACU RUGIRANEZA Arnaud Kennedy</strong><br>
    Rwanda Coding Academy · GSMA Africa Ignite 2026
  </p>
</div>
