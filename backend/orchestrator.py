"""
THE CORE ENGINE — Parallel CAMARA API execution.

Fires all four Nokia Network as Code CAMARA API calls simultaneously using
asyncio.gather(). Total latency = max(individual latencies), not sum.

Device object fetched once and shared across all SIM/Device/Status calls,
eliminating redundant devices.get() lookups.

Nokia Network as Code Python SDK v8.0.0:
  Install: pip install network-as-code==8.0.0
  Docs: https://networkascode.nokia.io/docs

Sandbox note: all test numbers return identical data from the Nokia sandbox.
The sandbox reports recent SIM swaps and device swaps for every query.

CAMARA APIs called:
  1. SIM Swap:          device.verify_sim_swap(max_age=hours) → bool
                           device.get_sim_swap_date()            → datetime
  2. Device Swap:       device.verify_device_swap(max_age=hours) → bool
                           device.get_device_swap_date()            → datetime
  3. Number Verification: device.verify_number(code, state) → bool  [REQUIRES OAUTH]
  4. Device Status:     device.get_roaming() → bool

Each call wrapped in asyncio.wait_for() with CAMARA_TIMEOUT_SECONDS.
On timeout or error: returns a graceful null result, never raises.
The pipeline always completes with whatever signals are available.
"""
import asyncio
import time
from config import settings
from typing import Dict, Any

_nac_client = None

def _get_nac_client():
    global _nac_client
    if _nac_client is None:
        import network_as_code as nac
        _nac_client = nac.NetworkAsCodeClient(token=settings.NAC_API_KEY)
    return _nac_client


async def _call_sim_swap(device: Any, window_hours: int) -> Dict[str, Any]:
    try:
        start = time.time()
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
            "response_ms": 0,
            "timed_out": False,
            "error": str(e)
        }


async def _call_device_swap(device: Any, window_hours: int) -> Dict[str, Any]:
    try:
        start = time.time()
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
            "response_ms": 0,
            "timed_out": False,
            "error": str(e)
        }


async def _call_number_verification(device: Any) -> Dict[str, Any]:
    try:
        start = time.time()
        verified = await asyncio.wait_for(
            asyncio.to_thread(device.verify_number, code="sandbox", state="sandbox"),
            timeout=settings.CAMARA_TIMEOUT_SECONDS
        )
        return {
            "api": "number_verification",
            "verified": verified if isinstance(verified, bool) else None,
            "response_ms": int((time.time() - start) * 1000),
            "timed_out": False,
            "error": None
        }
    except asyncio.TimeoutError:
        return {
            "api": "number_verification",
            "verified": None,
            "response_ms": int(settings.CAMARA_TIMEOUT_SECONDS * 1000),
            "timed_out": True,
            "error": "timeout"
        }
    except Exception as e:
        return {
            "api": "number_verification",
            "verified": None,
            "response_ms": 0,
            "timed_out": False,
            "error": str(e)
        }


async def _call_device_status(device: Any) -> Dict[str, Any]:
    try:
        start = time.time()
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
            "response_ms": 0,
            "timed_out": False,
            "error": str(e)
        }


async def run_parallel_checks(phone_number: str, window_hours: int = 24) -> Dict[str, Any]:
    """
    PUBLIC INTERFACE. Fires all four CAMARA calls simultaneously.
    Fetches the device object once and reuses it across SIM/Device/Status calls.
    Total latency = max(individual latencies), not sum.
    """
    wall_start = time.time()
    sim = dev_swap = num_verify = dev_status = None

    device = _get_nac_client().devices.get(phone_number=phone_number)

    try:
        results = await asyncio.wait_for(
            asyncio.gather(
                _call_sim_swap(device, window_hours),
                _call_device_swap(device, window_hours),
                _call_number_verification(device),
                _call_device_status(device)
            ),
            timeout=settings.CAMARA_TIMEOUT_SECONDS * 4
        )
        sim, dev_swap, num_verify, dev_status = results
    except asyncio.TimeoutError:
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
