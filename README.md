# 🎮 Trap Runner

A browser-based trap platformer inspired by *Cat Mario / Syobon Action* and *Unfair Mario*. Features hidden traps, a death counter, timer, and scoring — with no enemies.

**Frontend:** React + Phaser 3 (Vite)  
**Backend:** Python + FastAPI + PostgreSQL

---

## 📁 Project Structure

```
├── frontend/               # React + Phaser game
│   ├── src/
│   │   ├── components/     # React UI (Menu, Instructions, etc.)
│   │   ├── game/           # Phaser scenes, levels, traps
│   │   ├── api.js          # Axios API client
│   │   ├── App.jsx         # Router
│   │   └── index.css       # Global styles
│   └── package.json
│
├── backend/                # Python FastAPI server
│   ├── main.py             # App entry point
│   ├── database.py         # PostgreSQL connection
│   ├── models.py           # SQLAlchemy models
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

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create the PostgreSQL database
# (make sure PostgreSQL is running)
psql -U postgres -c "CREATE DATABASE traprunner;"

# Set connection string (optional — defaults to localhost)
# set DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/traprunner

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.  
Swagger docs: `http://localhost:8000/docs`

### 2. Frontend Setup

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

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/stats` | Save game session stats |
| `GET` | `/api/stats` | List all sessions |
| `GET` | `/api/stats/leaderboard` | Top scores by level |
| `GET` | `/api/stats/analytics` | Summary analytics |
| `GET` | `/api/stats/{id}` | Get single session |

---

## 🏗️ Tech Stack

- **Phaser 3** — 2D game engine
- **React 19** — UI framework
- **Vite** — Build tool
- **FastAPI** — Python async web framework
- **PostgreSQL** — Database (via asyncpg + SQLAlchemy)
- **Axios** — HTTP client
