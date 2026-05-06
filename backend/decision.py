"""
DECISION ENGINE. Applies risk thresholds to produce approve/challenge/block.
Thresholds in config.py. Conservative override when confidence is low.
"""
from config import settings

def make_decision(score: int, confidence: float) -> str:
    if confidence < 0.35 and score > 0:
        return "challenge"
    if score >= settings.BLOCK_THRESHOLD:
        return "block"
    elif score >= settings.CHALLENGE_THRESHOLD:
        return "challenge"
    return "approve"

def get_ussd_challenge_text(phone_number: str, amount_rwf: float) -> str:
    return (
        f"SafeSwitch Security Check\n"
        f"A transfer of RWF {amount_rwf:,.0f} was requested.\n"
        f"We detected a recent change on your account.\n"
        f"Reply 1 to approve, 2 to cancel."
    )
