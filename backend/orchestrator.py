"""
THE CORE ENGINE — Parallel CAMARA API execution.

Fires all four Nokia Network as Code CAMARA API calls simultaneously using
asyncio.gather(). Total latency = max(individual latencies), not sum.

Nokia Network as Code Python SDK v8.0.0:
  Install: pip install network-as-code==8.0.0
  Docs: https://networkascode.nokia.io/docs

Sandbox device identifiers (pre-configured by Nokia to return specific responses):
  +99999991000 → All clear: no swaps, verified number, normal device
  +99999991234 → Device swap detected in last 6 hours
  +99999991500 → SIM swap 22 min ago + device swap + anomalous status

CAMARA APIs called:
  1. SIM Swap:          device.verify_sim_swap(max_age=hours) → bool
                         device.get_sim_swap_date()            → datetime
  2. Device Swap:       device.verify_device_swap(max_age=hours) → bool
                         device.get_device_swap_date()            → datetime
  3. Number Verification: device.verify_number(code, state) → bool  [REQUIRES OAUTH]
  4. Device Status:     device.get_roaming() → bool

MOCK MODE: Set MOCK_MODE=true in .env to use simulated responses.
  Mock calls complete in 100-300ms each. Total pipeline ~300ms.

Each call wrapped in asyncio.wait_for() with CAMARA_TIMEOUT_SECONDS.
On timeout or error: returns a graceful null result, never raises.
The pipeline always completes with whatever signals are available.
"""
import asyncio
import time
import random
import network_as_code as nac
from config import settings
from typing import Dict, Any

nac_client = nac.NetworkAsCodeClient(token=settings.NAC_API_KEY)

# Mock mode for testing when API is unavailable
# Set MOCK_MODE=true in .env to enable
MOCK_MODE = settings.MOCK_MODE

# Simulated responses for sandbox numbers
MOCK_RESPONSES = {
    "+99999991000": {
        "sim_swap": {"detected": False, "swap_date": None},
        "device_swap": {"detected": False, "swap_date": None},
        "number_verification": {"verified": True},
        "device_status": {"roaming": False, "anomalous": False}
    },
    "+99999991234": {
        "sim_swap": {"detected": False, "swap_date": None},
        "device_swap": {"detected": True, "swap_date": "2026-05-06T10:00:00"},
        "number_verification": {"verified": True},
        "device_status": {"roaming": False, "anomalous": False}
    },
    "+99999991500": {
        "sim_swap": {"detected": True, "swap_date": "2026-05-06T16:38:00"},
        "device_swap": {"detected": True, "swap_date": "2026-05-06T10:00:00"},
        "number_verification": {"verified": False},
        "device_status": {"roaming": True, "anomalous": True}
    }
}


async def _mock_delay():
    """Simulate API latency in mock mode (100-300ms)."""
    await asyncio.sleep(random.uniform(0.1, 0.3))


async def _call_sim_swap(phone_number: str, window_hours: int) -> Dict[str, Any]:
    start = time.time()
    try:
        if MOCK_MODE:
            await _mock_delay()
            mock = MOCK_RESPONSES.get(phone_number, MOCK_RESPONSES["+99999991000"])
            result = mock["sim_swap"]
            return {
                "api": "sim_swap",
                "detected": result["detected"],
                "swap_date": result["swap_date"],
                "response_ms": int((time.time() - start) * 1000),
                "timed_out": False,
                "error": None
            }

        device = nac_client.devices.get(phone_number=phone_number)
        detected = await asyncio.wait_for(
            asyncio.to_thread(device.verify_sim_swap, max_age=window_hours),
            timeout=settings.CAMARA_TIMEOUT_SECONDS
        )
        swap_date = None
        if detected:
            try:
                dt = await asyncio.to_thread(device.get_sim_swap_date)
                swap_date = dt.isoformat() if dt else None
            except Exception:
                pass
        return {
            "api": "sim_swap",
            "detected": detected,
            "swap_date": swap_date,
            "response_ms": int((time.time() - start) * 1000),
            "timed_out": False,
            "error": None
        }
    except asyncio.TimeoutError:
        return {
            "api": "sim_swap",
            "detected": None,
            "swap_date": None,
            "response_ms": int(settings.CAMARA_TIMEOUT_SECONDS * 1000),
            "timed_out": True,
            "error": "timeout"
        }
    except Exception as e:
        return {
            "api": "sim_swap",
            "detected": None,
            "swap_date": None,
            "response_ms": int((time.time() - start) * 1000),
            "timed_out": False,
            "error": str(e)
        }


async def _call_device_swap(phone_number: str, window_hours: int) -> Dict[str, Any]:
    start = time.time()
    try:
        if MOCK_MODE:
            await _mock_delay()
            mock = MOCK_RESPONSES.get(phone_number, MOCK_RESPONSES["+99999991000"])
            result = mock["device_swap"]
            return {
                "api": "device_swap",
                "detected": result["detected"],
                "swap_date": result["swap_date"],
                "response_ms": int((time.time() - start) * 1000),
                "timed_out": False,
                "error": None
            }

        device = nac_client.devices.get(phone_number=phone_number)
        detected = await asyncio.wait_for(
            asyncio.to_thread(device.verify_device_swap, max_age=window_hours),
            timeout=settings.CAMARA_TIMEOUT_SECONDS
        )
        swap_date = None
        if detected:
            try:
                dt = await asyncio.to_thread(device.get_device_swap_date)
                swap_date = dt.isoformat() if dt else None
            except Exception:
                pass
        return {
            "api": "device_swap",
            "detected": detected,
            "swap_date": swap_date,
            "response_ms": int((time.time() - start) * 1000),
            "timed_out": False,
            "error": None
        }
    except asyncio.TimeoutError:
        return {
            "api": "device_swap",
            "detected": None,
            "swap_date": None,
            "response_ms": int(settings.CAMARA_TIMEOUT_SECONDS * 1000),
            "timed_out": True,
            "error": "timeout"
        }
    except Exception as e:
        return {
            "api": "device_swap",
            "detected": None,
            "swap_date": None,
            "response_ms": int((time.time() - start) * 1000),
            "timed_out": False,
            "error": str(e)
        }


async def _call_number_verification(phone_number: str) -> Dict[str, Any]:
    """
    Note: SDK v8.0.0+ requires OAuth2 flow (code, state params).
    For mock mode or when OAuth not available, returns graceful fallback.
    """
    start = time.time()
    try:
        if MOCK_MODE:
            await _mock_delay()
            mock = MOCK_RESPONSES.get(phone_number, MOCK_RESPONSES["+99999991000"])
            result = mock["number_verification"]
            return {
                "api": "number_verification",
                "verified": result["verified"],
                "response_ms": int((time.time() - start) * 1000),
                "timed_out": False,
                "error": None
            }

        # SDK v8.0.0 requires: verify_number(code: str, state: str)
        # Without OAuth flow, return None to indicate unavailable signal.
        return {
            "api": "number_verification",
            "verified": None,
            "response_ms": int((time.time() - start) * 1000),
            "timed_out": False,
            "error": "OAuth2 required in SDK v8.0.0+"
        }
    except Exception as e:
        return {
            "api": "number_verification",
            "verified": None,
            "response_ms": int((time.time() - start) * 1000),
            "timed_out": False,
            "error": str(e)
        }


async def _call_device_status(phone_number: str) -> Dict[str, Any]:
    start = time.time()
    try:
        if MOCK_MODE:
            await _mock_delay()
            mock = MOCK_RESPONSES.get(phone_number, MOCK_RESPONSES["+99999991000"])
            result = mock["device_status"]
            return {
                "api": "device_status",
                "roaming": result["roaming"],
                "connectivity_status": str(result["roaming"]),
                "anomalous": result["anomalous"],
                "response_ms": int((time.time() - start) * 1000),
                "timed_out": False,
                "error": None
            }

        device = nac_client.devices.get(phone_number=phone_number)
        # get_roaming() returns a boolean in SDK v8.0.0
        status = await asyncio.wait_for(
            asyncio.to_thread(device.get_roaming),
            timeout=settings.CAMARA_TIMEOUT_SECONDS
        )
        is_anomalous = status if isinstance(status, bool) else False
        return {
            "api": "device_status",
            "roaming": status if isinstance(status, bool) else None,
            "connectivity_status": str(status),
            "anomalous": is_anomalous,
            "response_ms": int((time.time() - start) * 1000),
            "timed_out": False,
            "error": None
        }
    except asyncio.TimeoutError:
        return {
            "api": "device_status",
            "roaming": None,
            "connectivity_status": None,
            "anomalous": None,
            "response_ms": int(settings.CAMARA_TIMEOUT_SECONDS * 1000),
            "timed_out": True,
            "error": "timeout"
        }
    except Exception as e:
        return {
            "api": "device_status",
            "roaming": None,
            "connectivity_status": None,
            "anomalous": None,
            "response_ms": int((time.time() - start) * 1000),
            "timed_out": False,
            "error": str(e)
        }


async def run_parallel_checks(phone_number: str, window_hours: int = 24) -> Dict[str, Any]:
    """
    PUBLIC INTERFACE. Fires all four CAMARA calls simultaneously.
    Total latency = max(individual latencies), not sum.

    In mock mode: ~300ms total (max of 4 parallel calls at 100-300ms each).
    In live mode: ~1500ms (timeout) if APIs unavailable, or faster if they respond.
    """
    wall_start = time.time()
    sim = dev_swap = num_verify = dev_status = None
    
    try:
        # Add a global timeout to prevent hanging
        results = await asyncio.wait_for(
            asyncio.gather(
                _call_sim_swap(phone_number, window_hours),
                _call_device_swap(phone_number, window_hours),
                _call_number_verification(phone_number),
                _call_device_status(phone_number)
            ),
            timeout=settings.CAMARA_TIMEOUT_SECONDS * 4  # 4x timeout for all 4 calls
        )
        sim, dev_swap, num_verify, dev_status = results
    except asyncio.TimeoutError:
        # Return timeout response for all if global timeout
        timeout_ms = int(settings.CAMARA_TIMEOUT_SECONDS * 1000)
        sim = {"api": "sim_swap", "detected": None, "swap_date": None,
               "response_ms": timeout_ms, "timed_out": True, "error": "global timeout"}
        dev_swap = {"api": "device_swap", "detected": None, "swap_date": None,
                    "response_ms": timeout_ms, "timed_out": True, "error": "global timeout"}
        num_verify = {"api": "number_verification", "verified": None,
                      "response_ms": timeout_ms, "timed_out": True, "error": "global timeout"}
        dev_status = {"api": "device_status", "roaming": None, "connectivity_status": None,
                     "anomalous": None, "response_ms": timeout_ms,
                     "timed_out": True, "error": "global timeout"}
    
    return {
        "sim_swap": sim if sim else {"api": "sim_swap", "detected": None, "swap_date": None,
                                       "response_ms": 0, "timed_out": False, "error": "not executed"},
        "device_swap": dev_swap if dev_swap else {"api": "device_swap", "detected": None, "swap_date": None,
                                                  "response_ms": 0, "timed_out": False, "error": "not executed"},
        "number_verification": num_verify if num_verify else {"api": "number_verification", "verified": None,
                                                           "response_ms": 0, "timed_out": False, "error": "not executed"},
        "device_status": dev_status if dev_status else {"api": "device_status", "roaming": None, "connectivity_status": None,
                                                      "anomalous": None, "response_ms": 0, "timed_out": False, "error": "not executed"},
        "total_wall_ms": int((time.time() - wall_start) * 1000)
    }
