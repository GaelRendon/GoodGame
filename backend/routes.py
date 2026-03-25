"""
routes.py — API endpoints for game statistics.

Endpoints:
  POST   /api/stats              — Save a game session
  GET    /api/stats              — List all game sessions
  GET    /api/stats/leaderboard  — Top scores per level
  GET    /api/stats/{id}         — Get a single session
  GET    /api/stats/analytics    — Summary analytics (future use)
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import GameSession
from schemas import (
    GameSessionCreate,
    GameSessionResponse,
    LeaderboardEntry,
    AnalyticsSummary,
)

router = APIRouter()


# ==========================================
# POST /api/stats — Save a game session
# ==========================================
@router.post("/stats", response_model=GameSessionResponse, status_code=201)
async def create_game_session(
    session_data: GameSessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """Save a new game session with player statistics."""
    new_session = GameSession(
        player_name=session_data.player_name,
        level=session_data.level,
        deaths=session_data.deaths,
        time_seconds=session_data.time_seconds,
        score=session_data.score,
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return new_session


# ==========================================
# GET /api/stats — List all sessions
# ==========================================
@router.get("/stats", response_model=List[GameSessionResponse])
async def list_game_sessions(
    level: Optional[int] = Query(None, description="Filter by level"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """List all game sessions, optionally filtered by level."""
    query = select(GameSession).order_by(desc(GameSession.created_at))

    if level is not None:
        query = query.where(GameSession.level == level)

    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


# ==========================================
# GET /api/stats/leaderboard — Top scores
# ==========================================
@router.get("/stats/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    level: Optional[int] = Query(None, description="Filter by level"),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get leaderboard — top scores, optionally filtered by level."""
    query = select(GameSession).order_by(desc(GameSession.score))

    if level is not None:
        query = query.where(GameSession.level == level)

    query = query.limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


# ==========================================
# GET /api/stats/analytics — Summary stats
# ==========================================
@router.get("/stats/analytics", response_model=AnalyticsSummary)
async def get_analytics(db: AsyncSession = Depends(get_db)):
    """
    Get summary analytics across all sessions.
    Prepared for future dashboard/analytics features.
    """
    result = await db.execute(
        select(
            func.count(GameSession.id).label("total_sessions"),
            func.coalesce(func.sum(GameSession.deaths), 0).label("total_deaths"),
            func.coalesce(func.avg(GameSession.score), 0).label("average_score"),
            func.coalesce(func.avg(GameSession.time_seconds), 0).label("average_time"),
        )
    )
    row = result.one()

    # Most played level
    most_played_result = await db.execute(
        select(GameSession.level, func.count(GameSession.id).label("cnt"))
        .group_by(GameSession.level)
        .order_by(desc("cnt"))
        .limit(1)
    )
    most_played_row = most_played_result.first()

    return AnalyticsSummary(
        total_sessions=row.total_sessions,
        total_deaths=row.total_deaths,
        average_score=round(float(row.average_score), 2),
        average_time=round(float(row.average_time), 2),
        most_played_level=most_played_row.level if most_played_row else None,
    )


# ==========================================
# GET /api/stats/{id} — Single session
# ==========================================
@router.get("/stats/{session_id}", response_model=GameSessionResponse)
async def get_game_session(
    session_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a single game session by its ID."""
    result = await db.execute(
        select(GameSession).where(GameSession.id == session_id)
    )
    session = result.scalar_one_or_none()

    if session is None:
        raise HTTPException(status_code=404, detail="Game session not found")

    return session
