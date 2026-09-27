"""Application settings, loaded from environment variables (12-factor)."""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def to_asyncpg_url(url: str) -> str:
    """Accept postgres://, postgresql://, or postgresql+asyncpg:// (Render / Supabase)."""
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://") :]
    if url.startswith("postgresql://") and "+asyncpg" not in url:
        url = "postgresql+asyncpg://" + url[len("postgresql://") :]
    return url.replace("sslmode=require", "ssl=require")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # SQLAlchemy async URL. Note the +asyncpg driver.
    # Flyway uses its own jdbc:postgresql:// URL (see docker-compose / CI), because
    # Flyway is a JVM tool and does not share this connection string.
    database_url: str = Field(
        default="postgresql+asyncpg://hermes:hermes@localhost:5432/hermes",
        description="Async SQLAlchemy connection URL.",
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: object) -> object:
        if isinstance(value, str):
            return to_asyncpg_url(value)
        return value

    app_name: str = "Oktoberfest Pricing API"
    cors_origins: list[str] = Field(
        default_factory=lambda: ["*"],
        description="Allowed CORS origins for the frontend.",
    )
    default_page_size: int = 200
    max_page_size: int = 200


@lru_cache
def get_settings() -> Settings:
    return Settings()
