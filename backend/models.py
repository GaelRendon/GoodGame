"""
models.py — SQLAlchemy ORM models for the Trap Runner game.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base


class GameSession(Base):
    """
    Represents a single game play session.
    Stores the player's performance data for analytics and leaderboard.
    """
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    player_name = Column(String(100), nullable=False, default="Player")
    level = Column(Integer, nullable=False)
    deaths = Column(Integer, nullable=False, default=0)
    time_seconds = Column(Float, nullable=False, default=0.0)
    score = Column(Integer, nullable=False, default=0)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self):
        return (
            f"<GameSession(id={self.id}, player='{self.player_name}', "
            f"level={self.level}, deaths={self.deaths}, score={self.score})>"
        )
