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

SafeSwitch intercepts mobile money transactions in the 1-2 second window before approval. It fires **four CAMARA API calls simultaneously** through Nokia's Network as Code, then feeds those signals into an **on-device reasoning engine** that computes a fraud score and generates plain-language analysis, all without any external AI API.

| API | What it checks |
|-----|---------------|
| **SIM Swap** | Was this SIM card replaced in the last 24 hours? |
| **Device Swap** | Has this number moved to a new physical device? |
| **Number Verification** | Does this number match the session device? |
| **Device Status** | Is this device showing anomalous connectivity? |

All four calls execute in parallel via `asyncio.gather()`, total latency equals the **slowest** individual call, not the sum.

## Why this matters

> In March 2026, fraudsters stole **$3.4 million** from Equity Bank Rwanda using SIM swap attacks.

Most fraud detection is reactive, by the time a flag is raised, the money is gone. SafeSwitch puts the check **inside the transaction window**, using telecom-layer intelligence that most fraud systems never see. It acts before the transaction completes, not after.

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
| **Reasoning Engine** | `reasoning_engine.py` | Pure-Python pattern matcher, no LLM, no external API, runs in <1ms |
| **Decision Engine** | `decision.py` | Applies configurable risk thresholds (block ≥70, challenge ≥40) |

### The Reasoning Engine

SafeSwitch's reasoning engine uses a **multi-layer template composition system**:

1. **Signal classification**: each API response is classified into named states (e.g. `critical_fresh`, `combo_attack`, `anomalous`)
2. **Pattern matching**: signal combinations match known fraud patterns (`active_account_takeover`, `probable_sim_swap_fraud`, `device_hijack`, etc.)
3. **Sentence composition**: classified signals select from curated sentence fragment libraries, assembled into a coherent paragraph
4. **Kinyarwanda alerts**: block decisions include Kinyarwanda-language fraud alerts for Rwandan users

This approach is **deterministic, auditable, and fully explainable**, properties that regulators and MNOs require in production fraud systems.

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

## Nokia Network as Code Integration

SafeSwitch integrates **four NaC CAMARA APIs** via the `network-as-code` Python SDK v8.0.0:

### API Usage

| CAMARA API | NaC SDK Method | What SafeSwitch does with it |
|------------|---------------|------------------------------|
| **SIM Swap** | `device.verify_sim_swap(max_age=hours)` + `device.get_sim_swap_date()` | Checks if the SIM was recently replaced. If detected, computes minutes since swap for continuous recency scoring (50 pts at 0 min → 20 pts at 360+ min). The strongest single fraud signal. |
| **Device Swap** | `device.verify_device_swap(max_age=hours)` + `device.get_device_swap_date()` | Checks if the SIM moved to a new physical device. Scores 15 pts alone, or +10 combo bonus when detected alongside SIM swap — the signature pattern of mobile money account takeover. |
| **Number Verification** | `device.verify_number(code, state)` | Attempts to verify the phone number matches the session device. Sandbox returns OAuth 404 (handled gracefully as "Verification unavailable"). In production with proper carrier OAuth, this confirms caller identity. |
| **Device Status** | `device.get_roaming()` | Checks if the device is in an unexpected roaming location. Anomalous roaming adds 10 pts and is flagged in the reasoning engine output. |

### How the SDK is used

1. A single `NetworkAsCodeClient` is initialized with the `NAC_API_KEY` and cached globally (lazy singleton pattern in `orchestrator.py`).
2. One `devices.get(phone_number=...)` call fetches the device object, reused across all four API calls — eliminating redundant lookups.
3. All four CAMARA calls fire simultaneously via `asyncio.gather()`. Each call is wrapped in `asyncio.wait_for()` with a 10-second timeout.
4. On timeout or error, each call returns a graceful null result — the pipeline never raises. Signal aggregation handles missing data via a confidence scoring system (4/4 APIs = 1.0 confidence, 0/4 = 0.0).

### Sandbox Behaviour

The Nokia sandbox differentiates by test number rather than returning identical data, allowing the demo to show all three decision outcomes.

The Nokia sandbox differentiates by phone number:

| Number | Behaviour |
|--------|-----------|
| `+99999991000` | Clean, normally no swaps detected |
| `+99999991234` | Device swap detected |
| `+99999991500` | SIM swap + roaming + anomalous connectivity |

**Number Verification** returns "Verification unavailable" due to sandbox OAuth limitations, this is expected and handled gracefully.

The demo value is in observing the full pipeline execution: parallel API calls, signal aggregation, continuous recency scoring, combo synergy bonus, amount-weighted risk, and the reasoning engine's output.

## Dependencies

| Requirement | Source | Required |
|-------------|--------|----------|
| `NAC_API_KEY` | [Nokia NaC Portal](https://developer.networkascode.nokia.io/) | Yes |
| Python 3.11+ | - | Yes |
| Node 20+ | - | For frontend build only |

**No external AI API keys required. No model downloads. No LLM dependencies.**

---

<div align="center">
  <p>
    Built by <strong>KAWACU RUGIRANEZA Arnaud Kennedy</strong><br>
    Rwanda Coding Academy · GSMA Africa Ignite 2026
  </p>
</div>
