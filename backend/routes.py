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
from sqlalchemy import select, func, desc, Integer, case, asc
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
    DashboardResponse,
    PlayerMetricsEntry,
    LevelAnalysisEntry,
    LevelFunnelEntry,
    PlayerSegmentSummary,
    DifficultySentimentEntry,
    CheckpointAnalysisEntry,
    SpeedLeaderboardEntry,
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
# GET /api/stats/dashboard — Full analytics dashboard
# ==========================================
@router.get("/stats/dashboard", response_model=DashboardResponse)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    """Get comprehensive analytics dashboard data.
    Replicates Gold-layer transformations from the ETL pipeline,
    computed live against PostgreSQL.
    """

    # --- Summary counts ---
    summary = await db.execute(
        select(
            func.count(func.distinct(Player.id)).label("total_players"),
            func.count(GameSession.id).label("total_sessions"),
            func.coalesce(func.sum(GameSession.deaths), 0).label("total_deaths"),
            func.coalesce(func.avg(GameSession.score), 0).label("average_score"),
        ).outerjoin(GameSession, Player.id == GameSession.player_id)
    )
    summary_row = summary.one()

    # --- Player Metrics (GOLD_PLAYER_METRICS + GOLD_PLAYER_SEGMENTS) ---
    pm_query = await db.execute(
        select(
            Player.display_name,
            func.count(GameSession.id).label("total_sessions"),
            func.max(GameSession.level).label("max_level"),
            func.avg(GameSession.deaths).label("avg_deaths"),
            func.sum(GameSession.time_seconds).label("total_playtime"),
        )
        .join(GameSession, Player.id == GameSession.player_id)
        .group_by(Player.id, Player.display_name)
        .order_by(desc(func.sum(GameSession.time_seconds)))
    )
    player_metrics = []
    for row in pm_query.all():
        sessions = row.total_sessions
        if sessions >= 10:
            segment = "Hardcore"
        elif sessions >= 3:
            segment = "Regular"
        else:
            segment = "Casual"
        player_metrics.append(PlayerMetricsEntry(
            display_name=row.display_name,
            total_sessions=sessions,
            max_level=row.max_level or 1,
            avg_deaths=round(float(row.avg_deaths or 0), 2),
            total_playtime=round(float(row.total_playtime or 0), 1),
            player_type=segment,
        ))

    # --- Level Analysis (GOLD_LEVEL_ANALYSIS) ---
    la_query = await db.execute(
        select(
            GameSession.level,
            func.count(GameSession.id).label("total_attempts"),
            (func.sum(func.cast(GameSession.completed, Integer)) * 100.0 / func.count(GameSession.id)).label("completion_rate"),
            func.avg(GameSession.deaths).label("avg_deaths"),
            func.avg(GameSession.time_seconds).label("avg_time"),
        )
        .group_by(GameSession.level)
        .order_by(GameSession.level)
    )
    level_analysis = [
        LevelAnalysisEntry(
            level=row.level,
            total_attempts=row.total_attempts,
            completion_rate=round(float(row.completion_rate or 0), 1),
            avg_deaths=round(float(row.avg_deaths or 0), 2),
            avg_time=round(float(row.avg_time or 0), 1),
        )
        for row in la_query.all()
    ]

    # --- Level Funnel (GOLD_LEVEL_FUNNEL) ---
    funnel_query = await db.execute(
        select(
            GameSession.level,
            func.count(func.distinct(GameSession.player_id)).label("unique_players"),
        )
        .group_by(GameSession.level)
        .order_by(GameSession.level)
    )
    funnel_rows = funnel_query.all()
    max_players = funnel_rows[0].unique_players if funnel_rows else 1
    level_funnel = [
        LevelFunnelEntry(
            level=row.level,
            unique_players=row.unique_players,
            retention_rate_pct=round((row.unique_players / max_players) * 100, 1) if max_players > 0 else 0,
        )
        for row in funnel_rows
    ]

    # --- Player Segments (GOLD_PLAYER_SEGMENTS) ---
    segment_counts = {"Hardcore": 0, "Regular": 0, "Casual": 0}
    for pm in player_metrics:
        segment_counts[pm.player_type] += 1
    player_segments = [
        PlayerSegmentSummary(segment=seg, player_count=cnt)
        for seg, cnt in segment_counts.items()
    ]

    # --- Difficulty-Sentiment Correlation (GOLD_DIFFICULTY_SENTIMENT_CORRELATION) ---
    ds_query = await db.execute(
        select(
            GameSession.level,
            case(
                (GameSession.deaths <= 3, "Low (0-3)"),
                (GameSession.deaths <= 10, "Medium (4-10)"),
                else_="High (11+)",
            ).label("death_tier"),
            func.avg(SentimentResponse.emoji_mood).label("avg_sentiment"),
            func.count(SentimentResponse.id).label("session_count"),
        )
        .join(SentimentResponse, GameSession.id == SentimentResponse.session_id)
        .where(SentimentResponse.skipped == False)
        .group_by(GameSession.level, "death_tier")
        .order_by(GameSession.level)
    )
    difficulty_sentiment = [
        DifficultySentimentEntry(
            level=row.level,
            death_tier=row.death_tier,
            avg_sentiment=round(float(row.avg_sentiment or 0), 2),
            session_count=row.session_count,
        )
        for row in ds_query.all()
    ]

    # --- Checkpoint Analysis (GOLD_CHECKPOINT_ANALYSIS) ---
    cp_query = await db.execute(
        select(
            GameSession.level,
            CheckpointEvent.checkpoint_index,
            func.count(CheckpointEvent.id).label("times_reached"),
            func.avg(CheckpointEvent.reached_at_seconds).label("avg_time_to_reach"),
            func.avg(CheckpointEvent.deaths_so_far).label("avg_deaths_at_checkpoint"),
        )
        .join(GameSession, CheckpointEvent.session_id == GameSession.id)
        .group_by(GameSession.level, CheckpointEvent.checkpoint_index)
        .order_by(GameSession.level, CheckpointEvent.checkpoint_index)
    )
    checkpoint_analysis = [
        CheckpointAnalysisEntry(
            level=row.level,
            checkpoint_index=row.checkpoint_index,
            times_reached=row.times_reached,
            avg_time_to_reach=round(float(row.avg_time_to_reach or 0), 1),
            avg_deaths_at_checkpoint=round(float(row.avg_deaths_at_checkpoint or 0), 1),
        )
        for row in cp_query.all()
    ]

    # --- Speed Leaderboard (fastest completion times per level) ---
    speed_query = await db.execute(
        select(
            Player.display_name.label("player_name"),
            GameSession.level,
            func.min(GameSession.time_seconds).label("time_seconds"),
            func.min(GameSession.deaths).label("deaths"),
            func.max(GameSession.score).label("score"),
            func.max(GameSession.created_at).label("created_at"),
        )
        .join(Player, GameSession.player_id == Player.id)
        .where(GameSession.completed == True)
        .group_by(GameSession.level, Player.id, Player.display_name)
        .order_by(GameSession.level.asc(), asc(func.min(GameSession.time_seconds)))
    )
    speed_leaderboard = [
        SpeedLeaderboardEntry(
            player_name=row.player_name,
            level=row.level,
            time_seconds=round(float(row.time_seconds), 1),
            deaths=row.deaths,
            score=row.score,
            created_at=row.created_at,
        )
        for row in speed_query.all()
    ]

    return DashboardResponse(
        total_players=summary_row.total_players,
        total_sessions=summary_row.total_sessions,
        total_deaths=summary_row.total_deaths,
        average_score=round(float(summary_row.average_score), 2),
        player_metrics=player_metrics,
        level_analysis=level_analysis,
        level_funnel=level_funnel,
        player_segments=player_segments,
        difficulty_sentiment=difficulty_sentiment,
        checkpoint_analysis=checkpoint_analysis,
        speed_leaderboard=speed_leaderboard,
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
