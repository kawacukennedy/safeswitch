# Nokia Network as Code Sandbox Behavior (observed)

Based on testing with SDK v8.0.0 and the shared Nokia sandbox environment.

## Key Observations

### All phone numbers return identical data

The Nokia sandbox returns the same data regardless of the phone number queried.
Even clearly invalid numbers like +99999999999 return the same results.

Observed responses for ALL numbers:
- **SIM Swap (`verify_sim_swap`)**: `True` (swap detected ~10 minutes ago)
- **Device Swap (`verify_device_swap`)**: `True` (swap detected)  
- **Device Status (`get_roaming`)**: `False` (not roaming)
- **Number Verification (`verify_number`)**: Not available — SDK v8.0.0+ requires OAuth2 `code` and `state` parameters, which is a browser redirect flow, not usable in server-to-server context.

### Cold start

First request after server restart takes ~10–12s total (`devices.get()` ~4s + API calls ~8s).
Subsequent requests take ~4–5s total.

### SDK API signatures (v8.0.0)

```python
# Device lookup
device = client.devices.get(phone_number="+9999999xxxx")

# SIM Swap — returns bool
device.verify_sim_swap(max_age=24)         # checks if SIM swapped in last N hours
device.get_sim_swap_date()                 # returns datetime or None

# Device Swap — returns bool
device.verify_device_swap(max_age=24)
device.get_device_swap_date()

# Device Status — returns bool (roaming or not)
device.get_roaming()

# Number Verification — NOT usable without OAuth2 redirect
device.verify_number(code="<oauth_code>", state="<oauth_state>")
```

## Risk Scoring (with observed sandbox data)

Since the sandbox always reports recent SIM and device swaps:

| Signal             | Value    | Contribution |
|--------------------|----------|-------------|
| SIM swap           | True     | +50         |
| Device swap        | True     | +25         |
| Number verification| None     | 0           |
| Device status      | False    | 0           |
| **Total**          |          | **75**      |

Decision: **BLOCK** (score >= 70 threshold)

## Demo Notes

All three preset numbers (+99999991000, +99999991234, +99999991500) produce
identical risk scores and decisions when tested against the live sandbox.
The value of the demo is in showing the full pipeline working with real
Nokia NaC API calls — parallel execution, signal aggregation, risk scoring,
and the reasoning engine — not in differentiated results per number.
