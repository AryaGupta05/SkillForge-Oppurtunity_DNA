import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

CONFIG_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(CONFIG_DIR)
BACKEND_DIR = os.path.dirname(APP_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./opportunity_dna.db"
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: Optional[str] = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"
    GITHUB_TOKEN: Optional[str] = ""
    PORT: int = 8000
    HOST: str = "127.0.0.1"

    # Email Settings
    EMAIL_PROVIDER: str = "dev"
    RESEND_API_KEY: Optional[str] = ""
    EMAIL_FROM: Optional[str] = "noreply@opportunity-dna.in"

    # Security & OTP Settings
    SECRET_KEY: str = "dev-secret-key-change-in-prod"
    OTP_HASH_SECRET: str = "dev-otp-secret-change-in-prod"
    OTP_EXPIRY_MINUTES: int = 10
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    OTP_MAX_ATTEMPTS: int = 5

    model_config = SettingsConfigDict(
        env_file=[
            os.path.join(BACKEND_DIR, ".env"),
            os.path.join(PROJECT_ROOT, ".env")
        ],
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
