"""
models.py — SQLAlchemy ORM models for the Good Game platformer.

4 normalized tables:
  - players: persistent anonymous identity
  - game_sessions: enriched play session data
  - checkpoint_events: per-checkpoint analytics (cumulative)
  - sentiment_responses: post-level survey data (linked to session)
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from database import Base


class Player(Base):
    """
    Persistent anonymous player identity.
    UUID generated client-side, display name set on first visit.
    """
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    uuid = Column(String(64), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False, default="Player")
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    sessions = relationship("GameSession", back_populates="player", cascade="all, delete-orphan")
    sentiments = relationship("SentimentResponse", back_populates="player", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Player(id={self.id}, uuid='{self.uuid}', name='{self.display_name}')>"


class GameSession(Base):
    """
    A single game play session with enriched analytics data.
    Linked to a player via player_id FK.
    """
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False, index=True)
    level = Column(Integer, nullable=False)
    deaths = Column(Integer, nullable=False, default=0)
    time_seconds = Column(Float, nullable=False, default=0.0)
    score = Column(Integer, nullable=False, default=0)
    total_jumps = Column(Integer, nullable=False, default=0)
    max_x_reached = Column(Float, nullable=False, default=0.0)
    score_resets = Column(Integer, nullable=False, default=0)
    completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    player = relationship("Player", back_populates="sessions")
    checkpoint_events = relationship(
        "CheckpointEvent", back_populates="session", cascade="all, delete-orphan",
        lazy="selectin"
    )
    sentiment = relationship(
        "SentimentResponse", back_populates="session", uselist=False, cascade="all, delete-orphan",
        lazy="selectin"
    )

    def __repr__(self):
        return (
            f"<GameSession(id={self.id}, player_id={self.player_id}, "
            f"level={self.level}, deaths={self.deaths}, score={self.score})>"
        )


class CheckpointEvent(Base):
    """
    Records when a player reaches a checkpoint during a session.
    Values are CUMULATIVE from level start:
      - reached_at_seconds: total time elapsed since level began
      - deaths_so_far: total deaths since level began
    Per-segment data can be derived by subtracting consecutive checkpoints.
    """
    __tablename__ = "checkpoint_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("game_sessions.id", ondelete="CASCADE"), nullable=False)
    checkpoint_index = Column(Integer, nullable=False)
    reached_at_seconds = Column(Float, nullable=False, default=0.0)
    deaths_so_far = Column(Integer, nullable=False, default=0)

    # Relationships
    session = relationship("GameSession", back_populates="checkpoint_events")

    def __repr__(self):
        return (
            f"<CheckpointEvent(session={self.session_id}, cp={self.checkpoint_index}, "
            f"time={self.reached_at_seconds}, deaths={self.deaths_so_far})>"
        )


class SentimentResponse(Base):
    """
    Post-level sentiment survey data.
    Linked to both a player and a specific game session.
    Level info comes from the linked session.
    """
    __tablename__ = "sentiment_responses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("game_sessions.id", ondelete="CASCADE"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False, index=True)
    emoji_mood = Column(Integer, nullable=False, default=0)
    color_mood = Column(String(20), nullable=False, default="")
    word = Column(String(50), nullable=True)
    skipped = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    session = relationship("GameSession", back_populates="sentiment")
    player = relationship("Player", back_populates="sentiments")

    def __repr__(self):
        return (
            f"<SentimentResponse(id={self.id}, session={self.session_id}, "
            f"emoji={self.emoji_mood}, skipped={self.skipped})>"
        )
