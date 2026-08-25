from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "change-me-in-production"
    # MVP: SQLite local por defecto (cero infraestructura para arrancar).
    # En Docker Compose se sobreescribe con PostgreSQL via env var.
    DATABASE_URL: str = "sqlite+aiosqlite:///./cyberremote.db"
    REDIS_URL: str = "redis://redis:6379/0"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    # Alertas
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "alerts@cyberremote.io"

    # IA (opcional)
    OPENAI_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
