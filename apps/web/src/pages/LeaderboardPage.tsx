import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
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
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.title = 'Hush — Classement'
    return () => { document.title = 'Hush' }
  }, [])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard(100),
    refetchInterval: 30_000,
  })

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Classement</h1>
          <p className={styles.subtitle}>Les gardiens du silence</p>
        </div>
        <button
          className={styles.btnCopy}
          onClick={handleCopyLink}
          aria-label="Copier le lien du classement"
        >
          {copied ? (
            'Lien copié'
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 10V2h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Copier le lien
            </>
          )}
        </button>
      </div>

      {isLoading && (
        <div className={styles.skeletonList} aria-label="Chargement…">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      )}

      {isError && (
        <div className={styles.errorState}>
          <p className={styles.errorText}>Erreur de chargement</p>
          <button className={styles.btnRetry} onClick={() => refetch()}>Réessayer</button>
        </div>
      )}

      {data && data.length === 0 && (
        <p className={styles.emptyState}>Le silence n'a pas encore de gardien.</p>
      )}

      {data && data.length > 0 && (
        <div className={styles.list} role="list">
          {data.map((entry, i) => {
            const isCurrent = entry.pseudoSnapshot === player.pseudo
            const rank = i + 1
            const useStagger = i < 30
            return (
              <div
                key={entry.id}
                className={`${styles.row} ${isCurrent ? styles.rowCurrent : ''}`}
                role="listitem"
                style={useStagger ? { '--i': i } as React.CSSProperties : undefined}
              >
                <div className={styles.rank}>
                  {rank <= 3 ? (
                    <span className={`${styles.badge} ${styles[`badge${rank}` as 'badge1' | 'badge2' | 'badge3']}`} aria-label={`Rang ${rank}`}>
                      {rank}
                    </span>
                  ) : (
                    <span className={styles.rankNum} aria-label={`Rang ${rank}`}>{rank}</span>
                  )}
                </div>
                <span className={styles.pseudo}>{entry.pseudoSnapshot}</span>
                <span className={styles.duration}>{formatDuration(entry.durationMs)}</span>
                <span className={styles.date}>{formatRelativeDate(entry.createdAt)}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.footerActions}>
        <button className={styles.btnPrimary} onClick={() => navigate('/session')}>
          Nouvelle session
        </button>
      </div>
    </div>
  )
}
