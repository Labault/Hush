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
    <div className={styles.container}>
      {phase === 'waiting' && (
        <>
          <h1 className={styles.title}>Prêt ?</h1>
          <p className={styles.instructions}>
            Cache cet onglet ou minimise la fenêtre.<br />
            Le timer démarrera dès que l'onglet sera masqué.
          </p>
          {wakeLock.state === 'unsupported' && (
            <p className={styles.wakeLockWarning}>
              Ton navigateur ne supporte pas le Wake Lock, l'écran peut s'éteindre.
            </p>
          )}
          <Link to="/" className={styles.btnSecondary}>← Retour</Link>
        </>
      )}

      {phase === 'hidden' && (
        <div className={styles.silenceWrap}>
          <p className={styles.silenceText}>Silence en cours…</p>
        </div>
      )}

      {phase === 'completed' && (
        <>
          <p className={styles.timer}>{formatDuration(durationMs)}</p>
          <p className={styles.sub}>Soumission en cours…</p>
        </>
      )}

      {phase === 'tooShort' && (
        <>
          <h1 className={styles.title}>Trop court !</h1>
          <p className={styles.sub}>
            {Math.floor(durationMs / 1000)}s — Il faut au moins 10 secondes.
          </p>
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={reset}>Réessayer</button>
            <Link to="/" className={styles.btnSecondary}>← Retour</Link>
          </div>
        </>
      )}

      {phase === 'submitted' && (
        <>
          <p className={styles.timer}>{formatDuration(durationMs)}</p>
          <p className={styles.successMsg}>Session enregistrée</p>
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={() => navigate('/leaderboard')}>
              Voir le classement
            </button>
            <button className={styles.btnSecondary} onClick={reset}>Nouvelle session</button>
            <Link to="/" className={styles.btnTertiary}>← Retour</Link>
          </div>
        </>
      )}

      {phase === 'failed' && (
        <>
          <h1 className={styles.title}>Erreur</h1>
          <p className={styles.errorMsg}>Erreur lors de l'envoi : {error}</p>
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={submit}>Réessayer l'envoi</button>
            <Link to="/" className={styles.btnSecondary}>← Retour</Link>
          </div>
        </>
      )}
    </div>
  )
}
