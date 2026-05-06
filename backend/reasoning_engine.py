"""
REASONING ENGINE — Pure Python, executes in <1ms.

Generates human-readable reasoning text and Kinyarwanda alerts based on
aggregated signals. No external API calls — runs entirely on-device.

The reasoning text explains WHY a decision was made, citing specific
signal combinations. This transparency is critical for regulatory compliance
and user trust.

Kinyarwanda alerts are only generated for BLOCK decisions, as per
Rwanda telecom regulations requiring local language notifications.
"""

def generate_reasoning(
    signals: dict,
    score: int,
    decision: str,
    amount_rwf: float,
    contributions: dict,
    phone_number: str
) -> tuple[str, str | None]:
    """
    Returns (reasoning_text, kinyarwanda_alert).
    kinyarwanda_alert is None unless decision == "block".
    """
    parts = []

    # SIM Swap reasoning
    sim_detected = signals.get("sim_swap_detected")
    sim_minutes = signals.get("sim_swap_minutes_ago")
    if sim_detected:
        if sim_minutes is not None and sim_minutes < 60:
            parts.append(f"SIM swap detected {sim_minutes} minutes ago — active takeover window")
        elif sim_minutes is not None:
            parts.append(f"SIM swap detected {sim_minutes} minutes ago")
        else:
            parts.append("SIM swap detected on this number")
    else:
        parts.append("No SIM swap detected")

    # Device Swap reasoning
    dev_swap = signals.get("device_swap_detected")
    if dev_swap:
        parts.append("Device swap detected — SIM moved to new hardware")
    else:
        parts.append("No device swap detected")

    # Number Verification
    num_verified = signals.get("number_verified")
    if num_verified is True:
        parts.append("Number verified against session device")
    elif num_verified is False:
        parts.append("Number verification failed — potential mismatch")
    else:
        parts.append("Number verification unavailable")

    # Device Status
    anomalous = signals.get("device_anomalous")
    if anomalous:
        parts.append("Anomalous device status detected (roaming)")
    else:
        parts.append("Device status nominal")

    # Combine patterns
    if sim_detected and dev_swap:
        parts.append("⚠ COMBO ATTACK PATTERN: SIM swap + device swap indicates high-confidence fraud")

    if amount_rwf > 200000:
        parts.append(f"Transaction amount ({amount_rwf:,.0f} RWF) exceeds typical threshold")

    # Build final reasoning
    reasoning = f"Risk Score: {score}/100. " + ". ".join(parts) + "."

    # Kinyarwanda alert (only for blocks)
    kinyarwanda = None
    if decision == "block":
        kinyarwanda = _kinyarwanda_alert(score, sim_detected, dev_swap)

    return reasoning, kinyarwanda


def _kinyarwanda_alert(score: int, sim_swap: bool, device_swap: bool) -> str:
    """Generate Kinyarwanda SMS/notification alert."""
    if sim_swap and device_swap:
        return "Muraho. SafeSwitch yahageze ko hari ikibazo cy'umutekano ku kugura kwawe. SIM yawe yahinduwe ndetse n'akagaju gashya kakoreshwa. Kugura mwatumye kurahiwe. Hamagara 111 tugufashe."
    elif sim_swap:
        return "Muraho. SafeSwitch yahageze ko SIM yawe yahinduwe mu minota ishize. Kugura mwatumye kurahiwe kubera umutekano. Hamagara 111 tugufashe."
    elif score >= 70:
        return "Muraho. SafeSwitch yahageze ko kugura kwanyu gushobora kuba ari ikibazo. Kugura mwatumye kurahiwe. Hamagara 111 tugufashe."
    else:
        return "Muraho. SafeSwitch yahageze ko hari ikibazo cy'umutekano. Kugura mwatumye kurahiwe. Hamagara 111 tugufashe."
