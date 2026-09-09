"""Application settings, loaded from environment variables (12-factor)."""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # SQLAlchemy async URL. Note the +asyncpg driver.
    # Flyway uses its own jdbc:postgresql:// URL (see docker-compose / CI), because
    # Flyway is a JVM tool and does not share this connection string.
    database_url: str = Field(
        default="postgresql+asyncpg://hermes:hermes@localhost:5432/hermes",
        description="Async SQLAlchemy connection URL.",
    )

    app_name: str = "Project Hermes API"
    cors_origins: list[str] = Field(
        default_factory=lambda: ["*"],
        description="Allowed CORS origins for the (future) frontend.",
    )
    default_page_size: int = 50
    max_page_size: int = 200


@lru_cache
def get_settings() -> Settings:
    return Settings()
