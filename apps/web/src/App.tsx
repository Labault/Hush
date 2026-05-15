import { Routes, Route } from 'react-router-dom'
import { PlayerProvider } from './context/PlayerContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SessionPage from './pages/SessionPage'
import LeaderboardPage from './pages/LeaderboardPage'

export default function App() {
  return (
    <PlayerProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Routes>
    </PlayerProvider>
  )
}
