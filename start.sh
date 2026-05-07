#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colours for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       SafeSwitch — Cold Start        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"

# ── Prerequisites ──────────────────────────────────────────
command -v python3 >/dev/null 2>&1 || { echo "python3 is required but not found"; exit 1; }
command -v node    >/dev/null 2>&1 || { echo "node is required but not found";    exit 1; }
command -v npm     >/dev/null 2>&1 || { echo "npm is required but not found";     exit 1; }

echo -e "${GREEN}✓${NC} python3, node, npm found"

# ── Environment check ──────────────────────────────────────
if [ ! -f "$ROOT_DIR/backend/.env" ]; then
    echo -e "${YELLOW}⚠  backend/.env not found${NC}"
    echo "   Creating from .env.example..."
    cp "$ROOT_DIR/backend/.env.example" "$ROOT_DIR/backend/.env"
    echo -e "${YELLOW}   Edit backend/.env and add your NAC_API_KEY before running again${NC}"
    exit 1
fi

# ── Backend ────────────────────────────────────────────────
echo ""
echo -e "${BLUE}── Backend ──────────────────────────────${NC}"

cd "$ROOT_DIR/backend"

if [ ! -d venv ]; then
    echo "   Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
echo -e "${GREEN}✓${NC} Virtual environment activated"

pip install -q -r requirements.txt
echo -e "${GREEN}✓${NC} Python dependencies installed"

echo -e "   Starting backend on ${GREEN}http://localhost:8000${NC}"
uvicorn main:app --reload --port 8000 > /tmp/safeswitch-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} Backend PID: $BACKEND_PID"

# Wait for backend to accept connections (can take 30-40s on cold start with --reload)
echo -ne "   Waiting for backend"
for i in $(seq 1 45); do
    if curl -s http://localhost:8000/api/v1/health >/dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✓${NC} Backend ready (health check passed)"
        break
    fi
    echo -n "."
    sleep 1
done
if [ $i -eq 45 ]; then
    echo ""
    echo -e "${YELLOW}⚠  Backend health check timed out after 45s${NC}"
    echo "   Check /tmp/safeswitch-backend.log for errors"
fi

# ── Frontend ───────────────────────────────────────────────
echo ""
echo -e "${BLUE}── Frontend ─────────────────────────────${NC}"

cd "$ROOT_DIR/frontend"

npm install --silent 2>/dev/null
echo -e "${GREEN}✓${NC} Node dependencies installed"

echo -e "   Starting frontend on ${GREEN}http://localhost:5173${NC}"
npm run dev > /tmp/safeswitch-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓${NC} Frontend PID: $FRONTEND_PID"

# ── Summary ────────────────────────────────────────────────
cd "$ROOT_DIR"
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     SafeSwitch is running            ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost:5173${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:8000${NC}"
echo -e "  API docs:  ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

trap "echo ''; echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Done.'; exit 0" INT TERM

wait
