import { useEffect } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import type { Player } from '@hush/shared'
import { useQuery } from '@tanstack/react-query'
import { usePlayer } from '../hooks/usePlayer'
import { getLeaderboard } from '../api/sessions'
import { formatDuration, formatRelativeDate } from '../lib/format'
import styles from './LeaderboardPage.module.css'

export default function LeaderboardPage() {
  const { player } = usePlayer()
  if (!player) return <Navigate to="/" replace />
  return <LeaderboardContent player={player} />
}

function LeaderboardContent({ player }: { player: Player }) {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Hush — Classement'
    return () => { document.title = 'Hush' }
  }, [])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard(100),
    refetchInterval: 30_000,
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Classement</h1>
        <div className={styles.headerActions}>
          <button className={styles.btnPrimary} onClick={() => navigate('/session')}>
            Nouvelle session
          </button>
          <Link to="/" className={styles.btnTertiary}>← Accueil</Link>
        </div>
      </div>

      {isLoading && <p className={styles.state}>Chargement…</p>}
      {isError && <p className={styles.stateError}>Erreur de chargement</p>}

      {data && data.length === 0 && (
        <p className={styles.state}>Pas encore de session, sois le premier !</p>
      )}

      {data && data.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Rang</th>
                <th className={styles.th}>Pseudo</th>
                <th className={styles.th}>Temps</th>
                <th className={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, i) => {
                const isCurrent = entry.pseudoSnapshot === player.pseudo
                return (
                  <tr
                    key={entry.id}
                    className={isCurrent ? styles.rowCurrent : styles.row}
                  >
                    <td className={styles.td}>{i + 1}</td>
                    <td className={styles.td}>{entry.pseudoSnapshot}</td>
                    <td className={`${styles.td} ${styles.tdMono}`}>{formatDuration(entry.durationMs)}</td>
                    <td className={styles.td}>{formatRelativeDate(entry.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
