# Walkthrough — Trap Runner Game

## What Was Built

A complete trap platformer game inspired by *Cat Mario / Syobon Action* with a React+Phaser frontend and Python+FastAPI+PostgreSQL backend.

## Frontend Verification

### Main Menu
![Main Menu](C:\Users\grenm\.gemini\antigravity\brain\9f040322-07d8-4b9a-a4c5-8a82bf4441a5\trap_runner_main_menu_verified_1774410198141.png)

- Premium dark/neon theme with glassmorphism and pixel-art font
- All 4 buttons present: Start Game, Levels, Instructions, Exit

### Gameplay (Level 1)
![Gameplay](C:\Users\grenm\.gemini\antigravity\brain\9f040322-07d8-4b9a-a4c5-8a82bf4441a5\gameplay_level_1_state_1774410284503.png)

- Phaser 3 canvas embedded in React
- Player character (cyan cube with eyes) on ground
- Textured platforms with grass stripe, floating platforms
- Starfield background with parallax mountains
- HUD: Deaths, Timer, Score, Level indicator
- No console errors — Phaser v3.90.0 initialized cleanly

## Files Created

### Frontend (`/frontend/src/`)
| File | Purpose |
|------|---------|
| `index.css` | Premium dark/neon design system |
| `App.jsx` | React Router (menu, instructions, levels, game) |
| `api.js` | Axios client for backend |
| `components/MainMenu.jsx` | Animated start screen |
| `components/Instructions.jsx` | Controls & scoring guide |
| `components/LevelSelect.jsx` | 3-level grid selector |
| `components/GameContainer.jsx` | Phaser lifecycle in React |
| `components/GameOverOverlay.jsx` | Stats overlay + save to backend |
| `game/GameScene.js` | Core game: player, physics, traps, HUD, camera, death/respawn, win |
| `game/levels.js` | 3 level definitions (platforms, traps, checkpoints, goals) |
| `game/traps.js` | 5 trap types: fake floor, falling block, surprise spike, spring launcher, falling ceiling |

### Backend (`/backend/`)
| File | Purpose |
|------|---------|
| `main.py` | FastAPI app with CORS + async lifespan |
| `database.py` | Async SQLAlchemy + asyncpg for PostgreSQL |
| `models.py` | GameSession ORM model |
| `schemas.py` | Pydantic request/response schemas |
| `routes.py` | 5 API endpoints (CRUD + leaderboard + analytics) |
| `requirements.txt` | Python dependencies |

## Game Features
- **5 trap types**: fake floors, falling blocks, surprise spikes, spring launchers, falling ceilings
- **3 levels**: progressive difficulty (The Innocent Path → Deceptive Forest → Chaos Castle)
- **Checkpoint system**: saves progress within levels
- **Death counter**, **timer**, **scoring** (1000 base − 50 per death + time bonus)
- **Game-over overlay**: auto-saves stats to backend, shows deaths/time/score

## How to Run

```bash
# Frontend
cd frontend && npm install && npm run dev
# → http://localhost:5173

# Backend (requires PostgreSQL running)
cd backend && pip install -r requirements.txt
# Create DB: psql -U postgres -c "CREATE DATABASE traprunner;"
uvicorn main:app --reload
# → http://localhost:8000/docs
```
