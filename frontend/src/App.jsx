import { Routes, Route } from 'react-router-dom'
import MainMenu from './components/MainMenu'
import Instructions from './components/Instructions'
import LevelSelect from './components/LevelSelect'
import GameContainer from './components/GameContainer'

/**
 * App — Root component with routing.
 * Routes: / (menu), /instructions, /levels, /game/:levelId
 */
function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/levels" element={<LevelSelect />} />
        <Route path="/game/:levelId" element={<GameContainer />} />
      </Routes>
    </div>
  )
}

export default App
