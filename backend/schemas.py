"""
schemas.py — Pydantic schemas for request/response validation.

Normalized to match the 4-table schema:
  - Player, GameSession (with nested checkpoints), Sentiment
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ==========================================
# Player schemas
# ==========================================

class PlayerCreate(BaseModel):
    """Register or update an anonymous player."""
    uuid: str = Field(max_length=64)
    display_name: str = Field(max_length=100)


class PlayerResponse(BaseModel):
    """Player record returned from the API."""
    id: int
    uuid: str
    display_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ==========================================
# Checkpoint event schemas
# ==========================================

class CheckpointEventCreate(BaseModel):
    """Nested checkpoint data within a game session."""
    checkpoint_index: int = Field(ge=0)
    reached_at_seconds: float = Field(ge=0)
    deaths_so_far: int = Field(ge=0)


class CheckpointEventResponse(BaseModel):
    """Checkpoint event returned from the API."""
    id: int
    checkpoint_index: int
    reached_at_seconds: float
    deaths_so_far: int

    model_config = {"from_attributes": True}


# ==========================================
# Game session schemas
# ==========================================

class GameSessionCreate(BaseModel):
    """Create a new game session with enriched analytics data."""
    player_uuid: str = Field(max_length=64)
    level: int = Field(ge=1, le=10)
    deaths: int = Field(ge=0)
    time_seconds: float = Field(ge=0)
    score: int = Field(ge=0)
    total_jumps: int = Field(ge=0, default=0)
    max_x_reached: float = Field(ge=0, default=0.0)
    score_resets: int = Field(ge=0, default=0)
    completed: bool = False
    checkpoint_events: List[CheckpointEventCreate] = []


class GameSessionResponse(BaseModel):
    """Game session record returned from the API."""
    id: int
    player_id: int
    level: int
    deaths: int
    time_seconds: float
    score: int
    total_jumps: int
    max_x_reached: float
    score_resets: int
    completed: bool
    created_at: datetime
    checkpoint_events: List[CheckpointEventResponse] = []

    model_config = {"from_attributes": True}


# ==========================================
# Sentiment schemas
# ==========================================

class SentimentCreate(BaseModel):
    """Save a sentiment survey response, linked to a session."""
    session_id: int
    player_uuid: str = Field(max_length=64)
    emoji_mood: int = Field(ge=0, le=5)
    color_mood: str = Field(max_length=20)
    word: Optional[str] = Field(default=None, max_length=50)
    skipped: bool = False


class SentimentResponseSchema(BaseModel):
    """Sentiment response returned from the API."""
    id: int
    session_id: int
    player_id: int
    emoji_mood: int
    color_mood: str
    word: Optional[str]
    skipped: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ==========================================
# Analytics / Leaderboard schemas
# ==========================================

class LeaderboardEntry(BaseModel):
    """Leaderboard entry with player name resolved."""
    player_name: str
    level: int
    score: int
    deaths: int
    time_seconds: float
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalyticsSummary(BaseModel):
    """Summary analytics across all sessions."""
    total_sessions: int
    total_deaths: int
    average_score: float
    average_time: float
    most_played_level: Optional[int] = None
