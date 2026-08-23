"""
Project Hermes — backend starter.
Just proves the server runs and returns real-shaped JSON.
No database yet — categories are hardcoded from the sample dataset.
"""

from fastapi import FastAPI

app = FastAPI(title="Project Hermes API")

# Placeholder data — will be replaced by a real Supabase query later.
CATEGORIES = ["Food", "Beverages", "Activities"]


@app.get("/")
def health_check():
    """Quick check that the server is alive."""
    return {"status": "ok", "message": "Hermes backend is running"}


@app.get("/api/v1/categories")
def get_categories():
    """Matches the /categories endpoint in the API contract."""
    return {"categories": CATEGORIES}