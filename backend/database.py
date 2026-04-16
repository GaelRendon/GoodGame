"""
database.py — SQLAlchemy async engine and session configuration for PostgreSQL.
Connection string is built from PG* environment variables (Azure PostgreSQL).
"""

import os
import ssl
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

# ── Read individual PG* variables provided by Azure ──────────────────
PGHOST = os.getenv("PGHOST", "localhost")
PGUSER = os.getenv("PGUSER", "postgres")
PGPASSWORD = os.getenv("PGPASSWORD", "postgres")
PGPORT = os.getenv("PGPORT", "5432")
PGDATABASE = os.getenv("PGDATABASE", "goodgame")
PGSSLMODE = os.getenv("PGSSLMODE", "require")

# Build the async connection URL
# DATABASE_URL env var takes precedence if explicitly set (for flexibility)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+asyncpg://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"
)

# Azure PostgreSQL requires SSL — configure connect_args accordingly
connect_args = {}
if PGSSLMODE == "require":
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ssl_context

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=False, connect_args=connect_args)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


async def get_db():
    """
    Dependency that provides a database session.
    Yields an AsyncSession and ensures it is closed after use.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
