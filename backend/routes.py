"""
routes.py — API endpoints for Good Game.

Endpoints:
  POST   /api/players              — Register/update a player
  GET    /api/players/{uuid}       — Check if player exists
  GET    /api/players/{uuid}/stats — Player game history
  POST   /api/stats                — Save enriched game session
  GET    /api/stats                — List all game sessions
  GET    /api/stats/leaderboard    — Top scores per level
  GET    /api/stats/analytics      — Summary analytics
  POST   /api/sentiment            — Save sentiment survey response
  GET    /api/sentiment            — List sentiment responses
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Player, GameSession, CheckpointEvent, SentimentResponse
from schemas import (
    PlayerCreate,
    PlayerResponse,
    GameSessionCreate,
    GameSessionResponse,
    SentimentCreate,
    SentimentResponseSchema,
    LeaderboardEntry,
    AnalyticsSummary,
    CheckpointEventCreate,
)

router = APIRouter()


# ==========================================
# POST /api/players — Register or update a player
# ==========================================
@router.post("/players", response_model=PlayerResponse, status_code=201)
async def register_player(
    data: PlayerCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new player or update display name if UUID already exists."""
    result = await db.execute(
        select(Player).where(Player.uuid == data.uuid)
    )
    player = result.scalar_one_or_none()

    if player:
        # Update display name if changed
        player.display_name = data.display_name
        await db.commit()
        await db.refresh(player)
        return player

    # Create new player
    player = Player(uuid=data.uuid, display_name=data.display_name)
    db.add(player)
    await db.commit()
    await db.refresh(player)
    return player


# ==========================================
# GET /api/players/{uuid} — Check if player exists
# ==========================================
@router.get("/players/{uuid}", response_model=PlayerResponse)
async def get_player(
    uuid: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a player by UUID. Returns 404 if not found."""
    result = await db.execute(
        select(Player).where(Player.uuid == uuid)
    )
    player = result.scalar_one_or_none()

    if player is None:
        raise HTTPException(status_code=404, detail="Player not found")

    return player


# ==========================================
# GET /api/players/{uuid}/stats — Player game history
# ==========================================
@router.get("/players/{uuid}/stats", response_model=List[GameSessionResponse])
async def get_player_stats(
    uuid: str,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """Get all game sessions for a player."""
    result = await db.execute(
        select(Player).where(Player.uuid == uuid)
    )
    player = result.scalar_one_or_none()

    if player is None:
        raise HTTPException(status_code=404, detail="Player not found")

    result = await db.execute(
        select(GameSession)
        .where(GameSession.player_id == player.id)
        .order_by(desc(GameSession.created_at))
        .limit(limit)
    )
    return result.scalars().all()


# ==========================================
# POST /api/stats — Save enriched game session
# ==========================================
@router.post("/stats", response_model=GameSessionResponse, status_code=201)
async def create_game_session(
    session_data: GameSessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """Save a new game session with enriched analytics data."""
    # Look up the player by UUID
    result = await db.execute(
        select(Player).where(Player.uuid == session_data.player_uuid)
    )
    player = result.scalar_one_or_none()

    if player is None:
        raise HTTPException(status_code=404, detail="Player not found. Register first via POST /api/players.")

    # Create the session
    new_session = GameSession(
        player_id=player.id,
        level=session_data.level,
        deaths=session_data.deaths,
        time_seconds=session_data.time_seconds,
        score=session_data.score,
        total_jumps=session_data.total_jumps,
        max_x_reached=session_data.max_x_reached,
        score_resets=session_data.score_resets,
        completed=session_data.completed,
    )
    db.add(new_session)
    await db.flush()  # Get the session ID

    # Create checkpoint events
    for cp in session_data.checkpoint_events:
        event = CheckpointEvent(
            session_id=new_session.id,
            checkpoint_index=cp.checkpoint_index,
            reached_at_seconds=cp.reached_at_seconds,
            deaths_so_far=cp.deaths_so_far,
        )
        db.add(event)

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
    """Get leaderboard — top scores with player names resolved via JOIN."""
    query = (
        select(
            Player.display_name.label("player_name"),
            GameSession.level,
            GameSession.score,
            GameSession.deaths,
            GameSession.time_seconds,
            GameSession.created_at,
        )
        .join(Player, GameSession.player_id == Player.id)
        .order_by(desc(GameSession.score))
    )

    if level is not None:
        query = query.where(GameSession.level == level)

    query = query.limit(limit)
    result = await db.execute(query)
    rows = result.all()

    return [
        LeaderboardEntry(
            player_name=row.player_name,
            level=row.level,
            score=row.score,
            deaths=row.deaths,
            time_seconds=row.time_seconds,
            created_at=row.created_at,
        )
        for row in rows
    ]


# ==========================================
# GET /api/stats/analytics — Summary stats
# ==========================================
@router.get("/stats/analytics", response_model=AnalyticsSummary)
async def get_analytics(db: AsyncSession = Depends(get_db)):
    """Get summary analytics across all sessions."""
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
# POST /api/sentiment — Save sentiment response
# ==========================================
@router.post("/sentiment", response_model=SentimentResponseSchema, status_code=201)
async def create_sentiment(
    data: SentimentCreate,
    db: AsyncSession = Depends(get_db)
):
    """Save a sentiment survey response linked to a game session."""
    # Verify player exists
    result = await db.execute(
        select(Player).where(Player.uuid == data.player_uuid)
    )
    player = result.scalar_one_or_none()

    if player is None:
        raise HTTPException(status_code=404, detail="Player not found")

    # Verify session exists
    result = await db.execute(
        select(GameSession).where(GameSession.id == data.session_id)
    )
    session = result.scalar_one_or_none()

    if session is None:
        raise HTTPException(status_code=404, detail="Game session not found")

    sentiment = SentimentResponse(
        session_id=data.session_id,
        player_id=player.id,
        emoji_mood=data.emoji_mood,
        color_mood=data.color_mood,
        word=data.word,
        skipped=data.skipped,
    )
    db.add(sentiment)
    await db.commit()
    await db.refresh(sentiment)
    return sentiment


# ==========================================
# GET /api/sentiment — List sentiment responses
# ==========================================
@router.get("/sentiment", response_model=List[SentimentResponseSchema])
async def list_sentiments(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """List all sentiment responses."""
    result = await db.execute(
        select(SentimentResponse)
        .order_by(desc(SentimentResponse.created_at))
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()
