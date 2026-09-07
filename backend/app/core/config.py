import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./opportunity_dna.db"
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: Optional[str] = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"
    GITHUB_TOKEN: Optional[str] = ""
    PORT: int = 8000
    HOST: str = "127.0.0.1"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
