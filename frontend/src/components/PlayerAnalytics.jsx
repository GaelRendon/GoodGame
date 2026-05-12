import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardAnalytics, getPlayerStats } from '../api'
import { getUserId, getUserName } from '../game/userCache'

/**
 * PlayerAnalytics — Full-page analytics dashboard.
 * Displays: Summary cards, Player leaderboard, Level difficulty,
 * Retention funnel, Player segments, Sentiment by difficulty,
 * Checkpoint analysis, Level Leaderboards, and Personal Stats.
 */
function PlayerAnalytics() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [personalStats, setPersonalStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState('global')
  const sectionsRef = useRef([])

  useEffect(() => {
    async function fetchData() {
      const [dashboardResult, personalResult] = await Promise.all([
        getDashboardAnalytics(),
        getPlayerStats(getUserId())
      ])
      
      if (dashboardResult) {
        setData(dashboardResult)
      } else {
        setError(true)
      }
      
      if (personalResult) {
        setPersonalStats(personalResult)
      }
      
      setLoading(false)
    }
    fetchData()
  }, [])

  // Intersection Observer for staggered entrance animations
  useEffect(() => {
    if (!data && !personalStats) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('analytics-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [data, personalStats, activeTab])

  const addSectionRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el)
    }
  }

  if (loading) {
    return (
      <div className="analytics-screen">
        <div className="analytics-loading">
          <div className="analytics-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="analytics-screen">
        <div className="analytics-empty">
          <span className="analytics-empty-icon">📊</span>
          <h2>No Data Available</h2>
          <p>Play some games first to generate analytics!</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            ← Back to Menu
          </button>
        </div>
      </div>
    )
  }

  const isGlobalEmpty = data.total_sessions === 0

  const renderGlobalStats = () => {
    if (isGlobalEmpty) {
      return (
        <div className="analytics-empty" ref={addSectionRef}>
          <span className="analytics-empty-icon">🎮</span>
          <h2>No Sessions Yet</h2>
          <p>Start playing to see your analytics here!</p>
        </div>
      )
    }

    // Group speed leaderboard by level
    const speedByLevel = {}
    if (data.speed_leaderboard) {
      data.speed_leaderboard.forEach(entry => {
        if (!speedByLevel[entry.level]) speedByLevel[entry.level] = []
        speedByLevel[entry.level].push(entry)
      })
    }
    const levelsWithLeaderboard = Object.keys(speedByLevel).sort((a, b) => Number(a) - Number(b))

    return (
      <div className="analytics-body">
        {/* Summary Cards */}
        <div className="summary-cards" ref={addSectionRef}>
          <SummaryCard icon="👥" value={data.total_players} label="Players" delay={0} />
          <SummaryCard icon="🎮" value={data.total_sessions} label="Sessions" delay={1} />
          <SummaryCard icon="💀" value={data.total_deaths} label="Deaths" delay={2} />
          <SummaryCard icon="⭐" value={data.average_score} label="Avg Score" delay={3} />
        </div>

        {/* Level Leaderboards (Fastest Completion Times) */}
        {levelsWithLeaderboard.length > 0 && (
          <section className="analytics-section" ref={addSectionRef}>
            <h2 className="section-title">⏱️ Level Leaderboards (Fastest Times)</h2>
            <div className="level-leaderboards">
              {levelsWithLeaderboard.map((lvl) => (
                <div key={lvl} className="level-leaderboard-card" style={{ marginBottom: '2rem' }}>
                  <h3 className="section-subtitle" style={{ color: 'var(--accent-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Level {lvl}</h3>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Player</th>
                          <th>Time</th>
                          <th>Deaths</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {speedByLevel[lvl].map((p, i) => (
                          <tr key={i}>
                            <td>
                              {i === 0 ? '🥇 1st' : i === 1 ? '🥈 2nd' : i === 2 ? '🥉 3rd' : `#${i + 1}`}
                            </td>
                            <td className="player-name-cell">{p.player_name}</td>
                            <td style={{ color: 'var(--accent-tertiary)', fontWeight: 'bold' }}>{formatTime(p.time_seconds)}</td>
                            <td>{p.deaths}</td>
                            <td>{p.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Players */}
        {data.player_metrics.length > 0 && (
          <section className="analytics-section" ref={addSectionRef}>
            <h2 className="section-title">🏆 Top Players (Most Playtime)</h2>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Sessions</th>
                    <th>Max Level</th>
                    <th>Avg Deaths</th>
                    <th>Playtime</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {data.player_metrics.map((p, i) => (
                    <tr key={i}>
                      <td className="player-name-cell">{p.display_name}</td>
                      <td>{p.total_sessions}</td>
                      <td>{p.max_level}</td>
                      <td>{p.avg_deaths}</td>
                      <td>{formatTime(p.total_playtime)}</td>
                      <td>
                        <span className={`segment-badge segment-${p.player_type.toLowerCase()}`}>
                          {p.player_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Level Difficulty Analysis */}
        {data.level_analysis.length > 0 && (
          <section className="analytics-section" ref={addSectionRef}>
            <h2 className="section-title">📊 Level Difficulty</h2>
            <div className="level-bars">
              {data.level_analysis.map((lv) => (
                <div key={lv.level} className="level-bar-row">
                  <div className="level-bar-label">Lvl {lv.level}</div>
                  <div className="level-bar-group">
                    <div className="level-bar-item">
                      <span className="bar-label">Completion</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill bar-fill-completion"
                          style={{ width: `${Math.min(lv.completion_rate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="bar-value">{lv.completion_rate}%</span>
                    </div>
                    <div className="level-bar-meta">
                      <span>⚔ {lv.total_attempts} attempts</span>
                      <span>💀 {lv.avg_deaths} avg deaths</span>
                      <span>⏱ {formatTime(lv.avg_time)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Retention Funnel */}
        {data.level_funnel.length > 0 && (
          <section className="analytics-section" ref={addSectionRef}>
            <h2 className="section-title">📉 Retention Funnel</h2>
            <div className="funnel-chart">
              {data.level_funnel.map((f, i) => (
                <div key={f.level} className="funnel-step" style={{ '--delay': `${i * 0.1}s` }}>
                  <div
                    className="funnel-bar"
                    style={{ width: `${Math.max(f.retention_rate_pct, 8)}%` }}
                  >
                    <span className="funnel-bar-text">
                      Level {f.level} — {f.unique_players} player{f.unique_players !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="funnel-pct">{f.retention_rate_pct}%</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Player Segments */}
        {data.player_segments.some(s => s.player_count > 0) && (
          <section className="analytics-section" ref={addSectionRef}>
            <h2 className="section-title">🎯 Player Segments</h2>
            <div className="segments-display">
              {data.player_segments.map((seg) => (
                <div key={seg.segment} className={`segment-card segment-card-${seg.segment.toLowerCase()}`}>
                  <div className="segment-icon">
                    {seg.segment === 'Hardcore' ? '🔥' : seg.segment === 'Regular' ? '⚡' : '🌱'}
                  </div>
                  <div className="segment-count">{seg.player_count}</div>
                  <div className="segment-name">{seg.segment}</div>
                  <div className="segment-desc">
                    {seg.segment === 'Hardcore' ? '10+ sessions' : seg.segment === 'Regular' ? '3-9 sessions' : '1-2 sessions'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sentiment by Difficulty */}
        {data.difficulty_sentiment.length > 0 && (
          <section className="analytics-section" ref={addSectionRef}>
            <h2 className="section-title">😊 Sentiment × Difficulty</h2>
            <div className="sentiment-grid">
              {data.difficulty_sentiment.map((ds, i) => (
                <div key={i} className="sentiment-cell">
                  <div className="sentiment-cell-header">
                    Lvl {ds.level} · {ds.death_tier}
                  </div>
                  <div className="sentiment-cell-score">
                    {getMoodEmoji(ds.avg_sentiment)} {ds.avg_sentiment}
                  </div>
                  <div className="sentiment-cell-count">{ds.session_count} sessions</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Checkpoint Analysis */}
        {data.checkpoint_analysis.length > 0 && (
          <section className="analytics-section" ref={addSectionRef}>
            <h2 className="section-title">🚩 Checkpoint Analysis</h2>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Checkpoint</th>
                    <th>Times Reached</th>
                    <th>Avg Time</th>
                    <th>Avg Deaths</th>
                  </tr>
                </thead>
                <tbody>
                  {data.checkpoint_analysis.map((cp, i) => (
                    <tr key={i}>
                      <td>Lvl {cp.level}</td>
                      <td>CP {cp.checkpoint_index + 1}</td>
                      <td>{cp.times_reached}</td>
                      <td>{formatTime(cp.avg_time_to_reach)}</td>
                      <td>{cp.avg_deaths_at_checkpoint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    )
  }

  const renderPersonalStats = () => {
    if (!personalStats || personalStats.length === 0) {
      return (
        <div className="analytics-empty">
          <span className="analytics-empty-icon">👤</span>
          <h2>No Personal Sessions Yet</h2>
          <p>Start playing to see your personal stats here!</p>
        </div>
      )
    }

    const totalSessions = personalStats.length;
    const totalDeaths = personalStats.reduce((acc, curr) => acc + curr.deaths, 0);
    const totalTime = personalStats.reduce((acc, curr) => acc + curr.time_seconds, 0);
    const avgScore = personalStats.reduce((acc, curr) => acc + curr.score, 0) / totalSessions;

    return (
      <div className="analytics-body">
        <h2 className="personal-welcome" style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: '"Press Start 2P", cursive', fontSize: '1.2rem', color: 'var(--accent-tertiary)' }}>
          Welcome, {getUserName()}!
        </h2>
        
        <div className="summary-cards" ref={addSectionRef}>
          <SummaryCard icon="🎮" value={totalSessions} label="Sessions" delay={0} />
          <SummaryCard icon="💀" value={totalDeaths} label="Total Deaths" delay={1} />
          <SummaryCard icon="⏱️" value={formatTime(totalTime)} label="Total Time" delay={2} />
          <SummaryCard icon="⭐" value={avgScore} label="Avg Score" delay={3} />
        </div>

        <section className="analytics-section" ref={addSectionRef}>
          <h2 className="section-title">📜 Recent Sessions</h2>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Deaths</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {personalStats.map((session, i) => (
                  <tr key={i}>
                    <td>{new Date(session.created_at).toLocaleDateString()}</td>
                    <td>{session.level}</td>
                    <td style={{ color: session.completed ? 'var(--success)' : 'var(--danger)' }}>
                      {session.completed ? '✅ Completed' : '❌ Failed'}
                    </td>
                    <td>{formatTime(session.time_seconds)}</td>
                    <td>{session.deaths}</td>
                    <td>{session.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="analytics-screen">
      {/* Header */}
      <div className="analytics-header">
        <button
          id="btn-analytics-back"
          className="btn btn-secondary analytics-back-btn"
          onClick={() => navigate('/')}
        >
          ← Back
        </button>
        <h1 className="analytics-title">Player Analytics</h1>
        
        <div className="analytics-tabs">
          <button 
            className={`tab-btn ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => setActiveTab('global')}
          >
            🌍 Global Analytics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            👤 My Stats
          </button>
        </div>
      </div>

      {activeTab === 'global' ? renderGlobalStats() : renderPersonalStats()}

    </div>
  )
}

/* ---- Helper Components ---- */

function SummaryCard({ icon, value, label, delay }) {
  const [displayed, setDisplayed] = useState(0)
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0
  const isFloat = !Number.isInteger(numValue)

  useEffect(() => {
    const duration = 1200
    const steps = 40
    const increment = numValue / steps
    let current = 0
    let step = 0
    const timer = setInterval(() => {
      step++
      current += increment
      if (step >= steps) {
        clearInterval(timer)
        current = numValue
      }
      setDisplayed(isFloat ? parseFloat(current.toFixed(1)) : Math.round(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [numValue, isFloat])

  return (
    <div className="summary-card" style={{ '--delay': `${delay * 0.15}s` }}>
      <span className="summary-icon">{icon}</span>
      <span className="summary-value">{displayed.toLocaleString()}</span>
      <span className="summary-label">{label}</span>
    </div>
  )
}

/* ---- Utility functions ---- */

function formatTime(seconds) {
  if (seconds == null || isNaN(seconds)) return '0s'
  if (typeof seconds === 'string') seconds = parseFloat(seconds)
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m ${secs}s`
}

function getMoodEmoji(score) {
  if (score >= 4) return '😄'
  if (score >= 3) return '🙂'
  if (score >= 2) return '😐'
  if (score >= 1) return '😟'
  return '😢'
}

export default PlayerAnalytics
