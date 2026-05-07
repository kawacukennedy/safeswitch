"""
TEST SCRIPT - Tests all SafeSwitch scenarios and measures latency.
"""

import asyncio
import time
import json
import sys
sys.path.insert(0, '/Volumes/RCA/safeswitch/backend')

from orchestrator import run_parallel_checks
from aggregator import aggregate_signals
from scorer import compute_risk_score
from decision import make_decision
from reasoning_engine import generate_reasoning

TEST_NUMBERS = [
    ("+99999991000", "Clean - no swaps expected"),
    ("+99999991234", "Device swap detected"),
    ("+99999991500", "SIM swap + anomaly"),
    ("+99999999999", "Invalid number - should error gracefully"),
]

async def test_scenario(phone_number: str, description: str, amount: float = 50000):
    print(f"\n{'='*60}")
    print(f"SCENARIO: {description}")
    print(f"Phone: {phone_number}, Amount: {amount} RWF")
    print('='*60)
    
    # Step 1: CAMARA API calls
    print("\n[1/4] Calling CAMARA APIs in parallel...")
    start = time.time()
    try:
        raw = await run_parallel_checks(phone_number, window_hours=24)
        api_time = (time.time() - start) * 1000
        print(f"  Total wall time: {api_time:.0f}ms")
        
        for api_name in ['sim_swap', 'device_swap', 'number_verification', 'device_status']:
            api_data = raw.get(api_name, {})
            timed_out = api_data.get('timed_out', False)
            error = api_data.get('error')
            resp_ms = api_data.get('response_ms', 0)
            status = "TIMEOUT" if timed_out else ("ERROR" if error else "OK")
            print(f"  - {api_name}: {status} ({resp_ms}ms) {f'- {error}' if error else ''}")
    except Exception as e:
        print(f"  ERROR: {e}")
        return
    
    # Step 2: Aggregate
    print("\n[2/4] Aggregating signals...")
    signals = aggregate_signals(raw)
    print(f"  APIs available: {signals.get('apis_available', 0)}/4")
    print(f"  SIM swap detected: {signals.get('sim_swap_detected')}")
    print(f"  Device swap detected: {signals.get('device_swap_detected')}")
    
    # Step 3: Score (no velocity data in test — None = no penalty)
    print("\n[3/4] Computing risk score...")
    score, confidence, contributions = compute_risk_score(signals, amount_rwf=amount, velocity=None)
    print(f"  Risk Score: {score}/100")
    print(f"  Confidence: {confidence:.2f}")
    print(f"  Contributions: {contributions}")
    
    # Step 4: Decide
    print("\n[4/4] Making decision...")
    decision = make_decision(score, confidence)
    print(f"  Decision: {decision.upper()}")
    
    # Step 5: Reasoning
    reasoning, kinyarwanda = generate_reasoning(
        signals=signals,
        score=score,
        decision=decision,
        amount_rwf=amount,
        contributions=contributions,
        phone_number=phone_number,
        velocity=None
    )
    print(f"\nReasoning: {reasoning[:100]}...")
    if kinyarwanda:
        print(f"Kinyarwanda: {kinyarwanda[:80]}...")
    
    total_time = (time.time() - start) * 1000
    print(f"\nTOTAL PIPELINE TIME: {total_time:.0f}ms")
    
    return {
        "score": score,
        "decision": decision,
        "total_ms": total_time,
        "apis_available": signals.get('apis_available', 0)
    }

async def main():
    print("SafeSwitch Comprehensive Test Suite")
    print("=" * 60)
    
    results = []
    for phone, desc in TEST_NUMBERS:
        result = await test_scenario(phone, desc)
        if result:
            results.append(result)
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    for i, (phone, desc) in enumerate(TEST_NUMBERS):
        if i < len(results) and results[i]:
            r = results[i]
            print(f"{desc}: {r['decision'].upper()} (score={r['score']}, {r['total_ms']:.0f}ms, apis={r['apis_available']}/4)")
    
    # Check for latency issues
    print("\nLATENCY ANALYSIS:")
    avg_time = sum(r['total_ms'] for r in results if r) / len(results) if results else 0
    print(f"  Average pipeline time: {avg_time:.0f}ms")
    if avg_time > 3000:
        print("  ⚠ HIGH LATENCY: First request is typically cold start")
    elif avg_time > 2000:
        print("  ⚠ MODERATE LATENCY: Close to 2s target")
    else:
        print("  ✓ GOOD: Under 2s target")

if __name__ == "__main__":
    asyncio.run(main())
