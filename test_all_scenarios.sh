#!/bin/bash
# Comprehensive test script for SafeSwitch
# Tests all scenarios and measures latency

BASE_URL="http://localhost:8000/api/v1"
TIMEOUT=5

echo "========================================"
echo "SafeSwitch Comprehensive Test Suite"
echo "========================================"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
curl -s --max-time $TIMEOUT "$BASE_URL/../health" | python3 -m json.tool
echo ""

# Test 2: Clean Transaction (no swaps)
echo "Test 2: Clean Transaction (+99999991000)"
START=$(date +%s%N | cut -b1-13)
curl -s --max-time $TIMEOUT -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+99999991000",
    "amount_rwf": 50000,
    "recipient_wallet": "wallet_rw_001",
    "sim_swap_window_hours": 24
  }' | python3 -m json.tool
END=$(date +%s%N | cut -b1-13)
echo "Latency: $((END - START))ms"
echo ""

# Test 3: Device Swap Detected
echo "Test 3: Device Swap (+99999991234)"
START=$(date +%s%N | cut -b1-13)
curl -s --max-time $TIMEOUT -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+99999991234",
    "amount_rwf": 180000,
    "recipient_wallet": "wallet_rw_002",
    "sim_swap_window_hours": 24
  }' | python3 -m json.tool
END=$(date +%s%N | cut -b1-13)
echo "Latency: $((END - START))ms"
echo ""

# Test 4: SIM Swap + Anomaly (+99999991500)
echo "Test 4: SIM Swap + Anomaly (+99999991500)"
START=$(date +%s%N | cut -b1-13)
curl -s --max-time $TIMEOUT -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+99999991500",
    "amount_rwf": 320000,
    "recipient_wallet": "wallet_rw_003",
    "sim_swap_window_hours": 24
  }' | python3 -m json.tool
END=$(date +%s%N | cut -b1-13)
echo "Latency: $((END - START))ms"
echo ""

# Test 5: Invalid Phone Number
echo "Test 5: Invalid Phone Number"
curl -s --max-time $TIMEOUT -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "invalid",
    "amount_rwf": 10000,
    "recipient_wallet": "wallet_test"
  }' | python3 -m json.tool
echo ""

# Test 6: Missing Fields
echo "Test 6: Missing Required Fields"
curl -s --max-time $TIMEOUT -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+99999991000"}' | python3 -m json.tool
echo ""

# Test 7: Get Transactions
echo "Test 7: Get Transactions (Dashboard)"
curl -s --max-time $TIMEOUT "$BASE_URL/transactions?limit=5" | python3 -m json.tool
echo ""

# Test 8: Get Dashboard Stats
echo "Test 8: Dashboard Stats"
curl -s --max-time $TIMEOUT "$BASE_URL/dashboard/stats" | python3 -m json.tool
echo ""

echo "========================================"
echo "All tests completed!"
echo "========================================"
