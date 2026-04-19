"""
main.py — FastAPI application entry point for Good Game.
Configures CORS, includes routes, and creates database tables on startup.
Tables are created if they don't exist (never dropped).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, Base
# Import all models so they are registered with Base.metadata
import models  # noqa: F401
from routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup (if they don't exist)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Good Game API",
    description="Backend API for the Good Game platformer. Stores player data, game analytics, and sentiment surveys.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS — allow frontend dev server and Azure production
import os
_extra_origins = os.getenv("CORS_ORIGINS", "").split(",")
_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://goodgame.azurewebsites.net",
    "https://goodgame-facygha7e5gzg0hm.westus3-01.azurewebsites.net",
] + [o.strip() for o in _extra_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "game": "Good Game", "version": "2.0.0"}
