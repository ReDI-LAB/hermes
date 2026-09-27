"""FastAPI application entrypoint."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from config import get_settings
from db import engine
from routers import catalog, price

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description=(
        "Price-transparency API for Oktoberfest visitors (Project Hermes MVP). "
        "Navigate Category -> Product -> Max Price to compare vendors."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(catalog.router)
app.include_router(price.router)


@app.get("/health", tags=["meta"])
async def health():
    """Liveness + database connectivity check."""
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    return {"status": "ok"}
