# SafeSwitch

**Real-time fraud prevention for mobile money. Built on Nokia's Network as Code.**

[Live Demo](https://safeswitch.vercel.app) · [API Docs](https://your-railway-url/docs) · [GSMA Africa Ignite 2026](https://www.hackerearth.com/challenges/hackathon/africa-ignite-hackathon/)

---

## What it does

SafeSwitch intercepts mobile money transactions in the 1–2 second window before approval.
It fires four CAMARA API calls simultaneously through Nokia's Network as Code:

| API | What it checks |
|-----|---------------|
| SIM Swap | Was this SIM replaced in the last 24 hours? |
| Device Swap | Has this number moved to a new physical device? |
| Number Verification | Does this number match the session device? |
| Device Status | Is this device showing anomalous behaviour? |

Signals are processed by an **on-device reasoning engine** — a Python pattern-matching
system that classifies threats, computes a probabilistic fraud score, and generates
plain-language analysis. No external AI APIs. No model weights. Runs in <1ms.

## Why this matters

In March 2026, fraudsters stole $3.4M from Equity Bank Rwanda using SIM swap.
SafeSwitch uses telecom-layer intelligence that most fraud systems never see — and
acts before the transaction completes, not after.

## Dependencies

| Requirement | Purpose |
|-------------|---------|
| `NAC_API_KEY` | Nokia Network as Code (the only external credential required) |

No other API keys. No external AI services.

## Nokia Network as Code APIs

- `device.verify_sim_swap(max_age=24)` — SIM Swap
- `device.verify_device_swap(max_age=24)` — Device Swap
- `device.verify_number()` — Number Verification
- `device.get_connectivity()` — Device Status

All fired in parallel via `asyncio.gather()`. Sandbox numbers pre-loaded in demo UI.

## Nokia Network as Code Setup

1. Register at https://developer.networkascode.nokia.io/
2. Create application → get API key
3. Subscribe to these APIs in your dashboard:
   - SIM Swap (sim-swap)
   - Device Swap (device-swap)
   - Number Verification (number-verification)
   - Device Status (device-status)
4. Note your sandbox test numbers from the dashboard

## Quick start

```bash
# Backend setup
cd backend
pip3 install -r requirements.txt
cp .env.example .env
# Edit .env and add: NAC_API_KEY=your_key_from_dashboard
python3 main.py

# Frontend setup
cd frontend
npm install  # already done
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
npm run dev
```

## Test Scenarios

Based on Nokia NaC sandbox configuration:

| Scenario | Phone Number | Expected Result |
|----------|-------------|-----------------|
| Clean transaction | `+99999991000` | APPROVE (~12/100) |
| Device swap only | `+99999991234` | CHALLENGE (~25/100) |
| SIM swap + anomaly | `+99999991000`* | BLOCK (~91/100) |

*Note: Sandbox behavior may vary. Check your Nokia dashboard at https://dashboard.networkascode.nokia.io/hub for exact test numbers.

## Deployment

**Frontend (Vercel):**
1. Connect GitHub repo, set root: `frontend`
2. Build: `npm run build`, Output: `dist`
3. Env var: `VITE_API_URL=https://your-railway-url.railway.app/api/v1`

**Backend (Railway):**
1. Connect GitHub repo, set root: `backend`
2. Railway auto-detects `Procfile`
3. Env vars: `NAC_API_KEY=your_key`, `ALLOWED_ORIGINS=https://safeswitch.vercel.app`

## API Documentation

Once backend is running: http://localhost:8000/docs

Built by KAWACU RUGIRANEZA Arnaud Kennedy · Rwanda Coding Academy · GSMA Africa Ignite 2026
