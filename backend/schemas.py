"""
schemas.py — Pydantic schemas for request/response validation.
"""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class GameSessionCreate(BaseModel):
    """Schema for creating a new game session record."""
    player_name: str = Field(default="Player", max_length=100)
    level: int = Field(ge=1, le=10)
    deaths: int = Field(ge=0)
    time_seconds: float = Field(ge=0)
    score: int = Field(ge=0)


class GameSessionResponse(BaseModel):
    """Schema for returning a game session record."""
    id: int
    player_name: str
    level: int
    deaths: int
    time_seconds: float
    score: int
    created_at: datetime

    model_config = {"from_attributes": True}


class LeaderboardEntry(BaseModel):
    """Schema for a leaderboard entry."""
    player_name: str
    level: int
    score: int
    deaths: int
    time_seconds: float
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalyticsSummary(BaseModel):
    """Schema for analytics summary (future use)."""
    total_sessions: int
    total_deaths: int
    average_score: float
    average_time: float
    most_played_level: Optional[int] = None
