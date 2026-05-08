"""
Central configuration. Only one external credential needed: NAC_API_KEY.
No AI API keys. No external model dependencies.
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    NAC_API_KEY: str

    APP_ENV: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    BLOCK_THRESHOLD: int = 70
    CHALLENGE_THRESHOLD: int = 40
    CAMARA_TIMEOUT_SECONDS: float = 10.0

    AMOUNT_HIGH_THRESHOLD: float = 100000.0
    VELOCITY_WINDOW_MINUTES: int = 60
    VELOCITY_TX_WARN: int = 3
    VELOCITY_TX_HIGH: int = 5

    class Config:
        env_file = ".env"

settings = Settings()
