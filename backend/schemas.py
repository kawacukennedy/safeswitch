from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TransactionRequest(BaseModel):
    phone_number: str = Field(
        ...,
        description="Nokia NaC sandbox numbers: +99999991000 (clean), +99999991234 (device swap), +99999991500 (SIM swap+anomaly)"
    )
    amount_rwf: float = Field(..., gt=0)
    recipient_wallet: str
    sim_swap_window_hours: int = Field(default=24, ge=1, le=168)

    class Config:
        extra = "forbid"

class ApiSignalResponse(BaseModel):
    api_name: str
    risk_contribution: int
    response_ms: Optional[int]
    timed_out: bool
    summary: str

class TransactionResponse(BaseModel):
    transaction_id: str
    phone_number: str
    amount_rwf: float
    risk_score: int
    decision: str
    reasoning_text: str
    alert_kinyarwanda: Optional[str]
    total_response_ms: int
    signals: List[ApiSignalResponse]

class TransactionListItem(BaseModel):
    id: str
    created_at: datetime
    phone_number: str
    amount_rwf: float
    risk_score: int
    decision: str
    total_response_ms: int
    signals: List[ApiSignalResponse]
    signals: List[ApiSignalResponse]

class DashboardStats(BaseModel):
    total_transactions: int
    total_blocked: int
    total_challenged: int
    total_approved: int
    block_rate_pct: float
    avg_response_ms: float
    signals_total: int
    signals_healthy: int
    signals_ok_pct: float
