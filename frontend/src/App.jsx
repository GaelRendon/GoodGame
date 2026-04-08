import { Routes, Route } from 'react-router-dom'
import MainMenu from './components/MainMenu'
import Instructions from './components/Instructions'
import LevelSelect from './components/LevelSelect'
import GameContainer from './components/GameContainer'
import VictoryScreen from './components/VictoryScreen'

/**
 * App — Root component with routing.
 * Routes: / (menu), /instructions, /levels, /game/:levelId, /victory
 */
function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/levels" element={<LevelSelect />} />
        <Route path="/game/:levelId" element={<GameContainer />} />
        <Route path="/victory" element={<VictoryScreen />} />
      </Routes>
    </div>
  )
}

export default App
