import asyncio
import time
from orchestrator import run_parallel_checks
from aggregator import aggregate_signals
from scorer import compute_risk_score
from decision import make_decision
from reasoning_engine import generate_reasoning

async def test(phone, desc):
    print(f'\n=== Testing: {desc} ({phone}) ===')
    start = time.time()
    raw = await run_parallel_checks(phone, 24)
    signals = aggregate_signals(raw)
    score, conf, contrib = compute_risk_score(signals)
    decision = make_decision(score, conf)
    reasoning, kinyarwanda = generate_reasoning(signals, score, decision, 50000, contrib, phone)
    elapsed = (time.time() - start) * 1000
    print(f'Score: {score}/100, Decision: {decision}, Time: {elapsed:.0f}ms')
    print(f'Available APIs: {signals.get("apis_available")}/4')
    if kinyarwanda:
        print(f'Kinyarwanda alert: Yes')
    return elapsed

async def main():
    times = []
    for phone, desc in [('+99999991000', 'Clean'), ('+99999991234', 'Device Swap'), ('+99999991500', 'SIM+Device+Anomaly')]:
        t = await test(phone, desc)
        times.append(t)
    print(f'\n=== SUMMARY ===')
    print(f'Average time: {sum(times)/len(times):.0f}ms')
    print(f'Max time: {max(times):.0f}ms')
    if all(t < 2000 for t in times):
        print('✓ All scenarios under 2s target!')
    else:
        print('⚠ Some scenarios exceed 2s target')

asyncio.run(main())
