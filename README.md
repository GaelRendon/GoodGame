# 🎮 Good Game

A browser-based trap platformer inspired by *Cat Mario / Syobon Action* and *Unfair Mario*. Features hidden traps, a death counter, timer, scoring with reset penalties, 7 themed levels, player identity tracking, and post-level sentiment surveys — with no enemies.

**Frontend:** React + Phaser 3 (Vite)  
**Backend:** Python + FastAPI + PostgreSQL

---

## 📁 Project Structure

```
├── frontend/               # React + Phaser game
│   ├── src/
│   │   ├── components/     # React UI (Menu, Instructions, Survey, etc.)
│   │   ├── game/           # Phaser scenes, levels, traps, user cache
│   │   ├── api.js          # Axios API client
│   │   ├── App.jsx         # Router
│   │   └── index.css       # Global styles
│   └── package.json
│
├── backend/                # Python FastAPI server
│   ├── main.py             # App entry point
│   ├── database.py         # PostgreSQL connection
│   ├── models.py           # SQLAlchemy models (4 tables)
│   ├── schemas.py          # Pydantic schemas
│   ├── routes.py           # API endpoints
│   └── requirements.txt
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** running locally (or a remote instance)

### 1. Database Setup

```bash
# Create the database (one-time)
psql -U postgres -c "CREATE DATABASE goodgame;"
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
# .venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server (tables auto-created on first run)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.  
Swagger docs: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`.

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| `←` / `A` | Move left |
| `→` / `D` | Move right |
| `↑` / `W` / `Space` | Jump |
| `ESC` | Pause |

---

## 📊 Scoring

- **Base score:** 1000 points per level
- **Death penalty:** −25 points per death
- **Time bonus:** Faster completion = more points
- **Score reset:** When your score hits 0, it resets and your time bonus restarts

---

## 🗺️ Levels

| Level | Theme | Difficulty |
|-------|-------|-----------|
| 1–2 | 🌙 Blue | Easy |
| 3–4 | 🌲 Green | Medium |
| 5 | 🔥 Red | Hardest |
| 6–7 | 🔮 Purple | Hard |

After completing odd-numbered levels (1, 3, 5, 7), a quick sentiment survey appears.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/players` | Register/update player |
| `GET` | `/api/players/{uuid}` | Check if player exists |
| `GET` | `/api/players/{uuid}/stats` | Player game history |
| `POST` | `/api/stats` | Save enriched game session |
| `GET` | `/api/stats` | List all sessions |
| `GET` | `/api/stats/leaderboard` | Top scores by level |
| `GET` | `/api/stats/analytics` | Summary analytics |
| `POST` | `/api/sentiment` | Save sentiment survey |
| `GET` | `/api/sentiment` | List sentiment responses |

---

## 🗄️ Database Schema

4 normalized tables in the `goodgame` database:

- **players** — Persistent anonymous identity (UUID + display name)
- **game_sessions** — Enriched play data (deaths, score, jumps, checkpoints)
- **checkpoint_events** — Per-checkpoint cumulative analytics
- **sentiment_responses** — Post-level survey data (linked to sessions)

---

## 🏗️ Tech Stack

- **Phaser 3** — 2D game engine
- **React 19** — UI framework
- **Vite** — Build tool
- **FastAPI** — Python async web framework
- **PostgreSQL** — Database (via asyncpg + SQLAlchemy)
- **Axios** — HTTP client

---

## 🔧 Admin Features

- **Clear local data:** Click the version text at the bottom of the main menu 5 times quickly to reset all local player data (useful for testing multiple players on one PC).
