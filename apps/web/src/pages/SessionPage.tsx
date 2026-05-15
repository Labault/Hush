import { useEffect } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import type { Player } from '@hush/shared'
import { usePlayer } from '../hooks/usePlayer'
import { useSilenceSession } from '../hooks/useSilenceSession'
import { useWakeLock } from '../hooks/useWakeLock'
import { formatDuration } from '../lib/format'
import styles from './SessionPage.module.css'

export default function SessionPage() {
  const { player } = usePlayer()
  if (!player) return <Navigate to="/" replace />
  return <SessionContent player={player} />
}

function SessionContent({ player }: { player: Player }) {
  const navigate = useNavigate()
  const { state, reset, submit } = useSilenceSession(player.id)
  const wakeLock = useWakeLock()

  useEffect(() => {
    document.title = 'Hush — Session en cours'
    return () => { document.title = 'Hush' }
  }, [])

  useEffect(() => {
    wakeLock.request()
    return () => { wakeLock.release() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (state.phase === 'completed') {
      submit()
    }
  }, [state.phase, submit])

  const { phase, durationMs, error } = state

  return (
    <div className={styles.container} key={phase}>
      {phase === 'waiting' && (
        <div className={styles.phase}>
          <h1 className={styles.phaseTitle}>Prêt ?</h1>
          <p className={styles.instructions}>
            Cache cet onglet ou minimise la fenêtre.<br />
            Le compteur démarre dès que tu disparais.
          </p>
          <div className={styles.wakeLockIndicator}>
            {wakeLock.state === 'active' && (
              <span className={styles.wakeLockActive}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="6" cy="6" r="2" fill="currentColor" />
                </svg>
                Écran maintenu éveillé
              </span>
            )}
            {wakeLock.state === 'unsupported' && (
              <span className={styles.wakeLockWarn}>Garde ta fenêtre éveillée</span>
            )}
          </div>
          <Link to="/" className={styles.btnGhost} aria-label="Retour à l'accueil">Retour</Link>
        </div>
      )}

      {phase === 'hidden' && (
        <div className={styles.phase}>
          <div className={styles.pulseWrap} aria-hidden="true">
            <div className={styles.pulse} />
          </div>
          <p className={styles.silenceText}>Silence en cours</p>
        </div>
      )}

      {phase === 'completed' && (
        <div className={styles.phase}>
          <p className={styles.timer}>{formatDuration(durationMs)}</p>
          <p className={styles.sub}>Soumission…</p>
        </div>
      )}

      {phase === 'tooShort' && (
        <div className={styles.phase}>
          <div className={`${styles.iconCircle} ${styles.iconCircleError}`} aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="12" x2="28" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="28" y1="12" x2="12" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className={styles.phaseTitleError}>Trop court</h1>
          <p className={styles.sub}>
            {Math.floor(durationMs / 1000)}s — il faut au moins 10 secondes
          </p>
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={reset}>Réessayer</button>
            <Link to="/" className={styles.btnGhost}>Retour</Link>
          </div>
        </div>
      )}

      {phase === 'submitted' && (
        <div className={styles.phase}>
          <div className={`${styles.iconCircle} ${styles.iconCircleSuccess}`} aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
              <polyline points="12,20 17,25 28,14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className={styles.phaseTitleSuccess}>Session enregistrée</h1>
          <p className={styles.timerSubmitted}>{formatDuration(durationMs)}</p>
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={() => navigate('/leaderboard')}>
              Voir le classement →
            </button>
            <button className={styles.btnGhost} onClick={reset}>Nouvelle session</button>
          </div>
        </div>
      )}

      {phase === 'failed' && (
        <div className={styles.phase}>
          <div className={`${styles.iconCircle} ${styles.iconCircleError}`} aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
              <line x1="20" y1="12" x2="20" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="27" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <h1 className={styles.phaseTitleError}>Erreur lors de l'envoi</h1>
          <p className={styles.errorMsg}>{error}</p>
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={submit}>Réessayer l'envoi</button>
            <Link to="/" className={styles.btnGhost}>Retour</Link>
          </div>
        </div>
      )}
    </div>
  )
}
