# Trap Platformer Game — "Syobon Action" Style

A browser-based trap platformer inspired by *Cat Mario / Syobon Action* and *Unfair Mario*. The game features hidden traps, a death counter, timer, and scoring — with no enemies. Built with **React + Phaser 3** (frontend) and **Python + FastAPI + PostgreSQL** (backend).

## Proposed Changes

### Frontend — React + Phaser (`/frontend`)

#### [NEW] Project scaffold (Vite + React)
- Initialize with `create-vite` (React template)
- Install deps: `phaser`, `axios`, `react-router-dom`

#### [NEW] [index.css](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/index.css)
- Dark/neon theme with Google Font (Outfit), glassmorphism panels, animated gradients
- Premium game UI styling for menus, HUD, overlays

#### [NEW] [App.jsx](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/App.jsx)
- React Router: routes for `/` (menu), `/game` (play), `/instructions`, `/levels`

#### [NEW] [components/MainMenu.jsx](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/components/MainMenu.jsx)
- Animated start screen with buttons: Start Game, Instructions, Levels, Exit
- Pixel-art / retro aesthetic with modern polish

#### [NEW] [components/Instructions.jsx](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/components/Instructions.jsx)
- Controls guide and gameplay tips

#### [NEW] [components/LevelSelect.jsx](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/components/LevelSelect.jsx)
- Grid of 3 levels, each unlockable after beating the previous

#### [NEW] [components/GameContainer.jsx](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/components/GameContainer.jsx)
- Mounts the Phaser canvas inside a React component
- Manages lifecycle (create/destroy Phaser game instance)
- Passes level selection & receives game events (death, win)

#### [NEW] [components/GameOverOverlay.jsx](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/components/GameOverOverlay.jsx)
- Shows deaths, time, score on level-complete or game-over
- Restart / Back to Menu buttons
- Posts stats to backend API

---

#### Phaser Scenes (all under `src/game/`)

#### [NEW] [game/BootScene.js](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/game/BootScene.js)
- Configures Phaser, loads minimal assets for preload bar

#### [NEW] [game/PreloadScene.js](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/game/PreloadScene.js)
- Loads all spritesheets, tilemaps, audio
- Shows loading bar

#### [NEW] [game/GameScene.js](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/game/GameScene.js)
- **Player**: sprite with physics, controlled by arrow keys + WASD
- **Level builder**: reads level data (JSON arrays) to place platforms, ground, goal
- **Trap system**: invisible triggers that activate on proximity — falling blocks, surprise spikes, moving platforms, fake floors, spring launchers
- **HUD**: death counter, timer, score (rendered as Phaser text)
- **Camera**: follows player, scrolls horizontally
- **Death/respawn**: on trap hit → increment deaths, respawn at checkpoint
- **Level complete**: touching goal flag triggers win event

#### [NEW] [game/levels.js](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/game/levels.js)
- 3 level definitions as data objects containing:
  - Platform positions, widths
  - Trap definitions (type, position, trigger zone, behavior)
  - Goal position
  - Checkpoint positions

#### [NEW] [game/traps.js](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/game/traps.js)
- Trap factory functions:
  - `fallingBlock` — block that drops when player walks under
  - `fakeFloor` — platform that disappears on contact
  - `surpriseSpike` — hidden spike that pops up
  - `springLauncher` — launches player unexpectedly
  - `fallingCeiling` — ceiling block drops

#### [NEW] [api.js](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/frontend/src/api.js)
- Axios instance with base URL `http://localhost:8000`
- `saveStats(data)` — POST to `/api/stats`
- `getLeaderboard()` — GET from `/api/stats/leaderboard`

---

### Backend — Python + FastAPI (`/backend`)

#### [NEW] [main.py](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/backend/main.py)
- FastAPI app with CORS middleware
- Includes stat routes

#### [NEW] [database.py](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/backend/database.py)
- SQLAlchemy async engine + session (PostgreSQL via asyncpg)
- `Base` declarative base

#### [NEW] [models.py](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/backend/models.py)
- `GameSession` model: id, player_name, level, deaths, time_seconds, score, created_at

#### [NEW] [schemas.py](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/backend/schemas.py)
- Pydantic schemas for request/response validation

#### [NEW] [routes.py](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/backend/routes.py)
- `POST /api/stats` — save session data
- `GET /api/stats` — list all sessions
- `GET /api/stats/leaderboard` — top scores by level
- `GET /api/stats/{id}` — single session
- Prepared for future analytics endpoints

#### [NEW] [requirements.txt](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/backend/requirements.txt)
- fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, pydantic

---

### Documentation

#### [NEW] [README.md](file:///c:/Users/grenm/onedrive/documentos/proyecto%20de%20videojuego/README.md)
- Project overview, setup instructions for frontend & backend

## Asset Strategy

Since this is a code-only project, all game visuals will be **generated programmatically** using Phaser's Graphics API:
- Player: colored rectangle with eyes
- Platforms: textured rectangles
- Traps: drawn shapes with color coding
- Goal flag: simple polygon

This avoids external asset dependencies while keeping the game visually clear and playable.

## Verification Plan

### Automated — Frontend Dev Server
```bash
cd frontend && npm install && npm run dev
```
- Verify app loads at `http://localhost:5173`
- Navigate all menu screens
- Play through level 1 — trigger traps, die, see death counter, reach goal
- Confirm game-over overlay appears with stats

### Automated — Backend Server
```bash
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
```
> Requires a running PostgreSQL instance. Connection string configured via environment variable `DATABASE_URL`.
- Verify Swagger docs at `http://localhost:8000/docs`
- POST a test stat, GET leaderboard

### Browser Testing
- Use the browser tool to navigate the app, click menu items, and verify the game canvas renders
- Verify the game-over screen shows correct stats after completing a level

### Manual Verification (User)
- Play the game in browser, test all 3 levels
- Confirm traps feel surprising and fun
- Check that stats are saved to the backend
