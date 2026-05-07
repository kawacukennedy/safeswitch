# SafeSwitch

**Real-time fraud prevention for mobile money. Built on Nokia's Network as Code.**

[GSMA Africa Ignite 2026](https://www.hackerearth.com/challenges/hackathon/africa-ignite-hackathon/)

---

## What it does

SafeSwitch intercepts mobile money transactions in the 1-2 second window before approval.
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

## Quick start (development)

```bash
./start.sh
```

Starts backend (:8000) and frontend (:5173) in parallel. Press Ctrl+C to stop both.

Requires `backend/.env` with a valid `NAC_API_KEY`.

## Deploy to production

### Option A: Railway (single service, Docker)

1. Push to GitHub
2. On [Railway](https://railway.app), create a new project → **Deploy from GitHub repo**
3. Railway auto-detects the `Dockerfile` and builds the image
4. Set environment variables:
   - `NAC_API_KEY` — your Nokia Network as Code key
   - `PORT` — Railway sets this automatically (default: 8000)
   - `ALLOWED_ORIGINS` — set to your Railway domain, e.g. `https://safeswitch.up.railway.app`
5. That's it. The Dockerfile builds the frontend, bundles it with the backend, and serves everything from one URL.

### Option B: Render (single service, Docker)

Same as Railway. Create a new **Web Service**, connect your repo, Render detects the `Dockerfile`.

### Option C: Fly.io (single service, Docker)

```bash
fly launch --dockerfile Dockerfile
fly secrets set NAC_API_KEY=your_key_here
fly deploy
```

### Option D: Split deployment (Vercel + Railway)

**Backend → Railway:**
```bash
cd backend
railway up
# Set NAC_API_KEY in Railway dashboard
```

**Frontend → Vercel:**
```bash
cd frontend
VERCEL_BUILD_COMMAND="npm run build"
# Set VITE_API_URL to https://your-railway-url/api/v1
vercel --prod
```

## Dependencies

| Requirement | Purpose |
|-------------|---------|
| `NAC_API_KEY` | Nokia Network as Code (the only external credential required) |

No other API keys. No external AI services.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/docs` | OpenAPI documentation |
| POST | `/api/v1/analyze` | Run full fraud analysis pipeline |
| GET | `/api/v1/transactions` | Paginated transaction history |
| GET | `/api/v1/dashboard/stats` | Aggregate dashboard statistics |
| GET | `/api/v1/health` | Health check |

Built by KAWACU RUGIRANEZA Arnaud Kennedy · Rwanda Coding Academy · GSMA Africa Ignite 2026
