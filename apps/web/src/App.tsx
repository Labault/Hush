import { Routes, Route } from 'react-router-dom'
import { AdminProvider } from './context/AdminContext'
import { PlayerProvider } from './context/PlayerContext'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import RequireAdmin from './components/RequireAdmin'
import HomePage from './pages/HomePage'
import SessionPage from './pages/SessionPage'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminSessionsPage from './pages/admin/AdminSessionsPage'
import AdminPlayersPage from './pages/admin/AdminPlayersPage'

export default function App() {
  return (
    <AdminProvider>
      <PlayerProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route path="/admin" element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="sessions" element={<AdminSessionsPage />} />
              <Route path="players" element={<AdminPlayersPage />} />
            </Route>
          </Route>
        </Routes>
      </PlayerProvider>
    </AdminProvider>
  )
}
