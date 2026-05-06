"""
Central configuration. Only one external credential needed: NAC_API_KEY.
No AI API keys. No external model dependencies.
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Nokia Network as Code
    # Register: https://developer.networkascode.nokia.io/
    NAC_API_KEY: str

    APP_ENV: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:5173,https://safeswitch.vercel.app"

    BLOCK_THRESHOLD: int = 70
    CHALLENGE_THRESHOLD: int = 40
    CAMARA_TIMEOUT_SECONDS: float = 1.5

    MOCK_MODE: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
