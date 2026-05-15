import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { usePlayer } from '../hooks/usePlayer'
import { getSessionsByPlayer } from '../api/sessions'
import { formatDuration, formatRelativeDate } from '../lib/format'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { player, isLoading, createNewPlayer, updatePseudo } = usePlayer()
  const navigate = useNavigate()

  useEffect(() => { document.title = 'Hush' }, [])

  const [pseudo, setPseudo] = useState('')
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [newPseudo, setNewPseudo] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [updating, setUpdating] = useState(false)

  const { data: recentSessions } = useQuery({
    queryKey: ['sessions-by-player', player?.id],
    queryFn: () => getSessionsByPlayer(player!.id, 5),
    enabled: !!player,
  })

  if (isLoading) {
    return <div className={styles.container}><p className={styles.loadingText}>Chargement…</p></div>
  }

  if (!player) {
    const handleCreate = async (e: FormEvent) => {
      e.preventDefault()
      setCreateError('')
      if (pseudo.trim().length < 1 || pseudo.trim().length > 30) {
        setCreateError('Pseudo doit faire entre 1 et 30 caractères.')
        return
      }
      setCreating(true)
      try {
        await createNewPlayer(pseudo.trim())
      } catch (err) {
        setCreateError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setCreating(false)
      }
    }

    return (
      <div className={styles.container}>
        <div className={styles.pill} aria-label="Statut">
          <span className={styles.pillDot} aria-hidden="true" />
          Online · Silence Protocol
        </div>
        <h1 className={styles.heroTitle}>Tiens le silence.</h1>
        <p className={styles.heroSubtitle}>
          Cache l'onglet. Le compteur monte. Reviens quand tu craques.
        </p>
        <div className={styles.createSection}>
          <form className={styles.form} onSubmit={handleCreate}>
            <label className={styles.srOnly} htmlFor="pseudo-input">Ton pseudo</label>
            <input
              id="pseudo-input"
              className={styles.input}
              type="text"
              placeholder="Ton pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              maxLength={30}
              required
              aria-describedby={createError ? 'create-error' : undefined}
            />
            {createError && <p id="create-error" className={styles.error} role="alert">{createError}</p>}
            <button className={styles.btnPrimary} type="submit" disabled={creating}>
              {creating ? 'Création…' : 'Commencer →'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setUpdateError('')
    if (newPseudo.trim().length < 1 || newPseudo.trim().length > 30) {
      setUpdateError('Pseudo doit faire entre 1 et 30 caractères.')
      return
    }
    setUpdating(true)
    try {
      await updatePseudo(newPseudo.trim())
      setShowUpdateForm(false)
      setNewPseudo('')
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.pill}>
        <span className={styles.pillDot} aria-hidden="true" />
        Connecté en tant que {player.pseudo}
      </div>
      <h1 className={styles.welcomeTitle}>Bonjour, {player.pseudo}.</h1>
      <p className={styles.welcomeSubtitle}>Prêt à recommencer ?</p>

      <div className={styles.primaryAction}>
        <button className={styles.btnPrimary} onClick={() => navigate('/session')}>
          Démarrer une session →
        </button>
      </div>

      <section className={styles.historyList} aria-label="Mes 5 dernières sessions">
        <h2 className={styles.historyTitle}>Tes dernières sessions</h2>
        {recentSessions && recentSessions.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recentSessions.map((s) => (
              <li key={s.id} className={styles.historyItem}>
                <span className={styles.historyDuration}>{formatDuration(s.durationMs)}</span>
                <span className={styles.historyDate}>{formatRelativeDate(s.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.historyEmpty}>Aucune session encore. Le silence t'attend.</p>
        )}
      </section>

      <div className={styles.secondaryActions}>
        <button
          className={styles.btnGhost}
          onClick={() => { setShowUpdateForm(!showUpdateForm); setUpdateError('') }}
          aria-expanded={showUpdateForm}
        >
          Changer mon pseudo
        </button>
        <Link to="/leaderboard" className={styles.btnTertiary}>Voir le classement →</Link>
      </div>

      <div className={`${styles.toggleForm} ${showUpdateForm ? styles.toggleFormOpen : ''}`} aria-hidden={!showUpdateForm}>
        <form className={styles.inlineForm} onSubmit={handleUpdate}>
          <label className={styles.srOnly} htmlFor="update-pseudo-input">Nouveau pseudo</label>
          <input
            id="update-pseudo-input"
            className={styles.input}
            type="text"
            placeholder="Nouveau pseudo"
            value={newPseudo}
            onChange={(e) => setNewPseudo(e.target.value)}
            maxLength={30}
            required
            tabIndex={showUpdateForm ? 0 : -1}
            aria-describedby={updateError ? 'update-error' : undefined}
          />
          {updateError && <p id="update-error" className={styles.error} role="alert">{updateError}</p>}
          <div className={styles.inlineFormActions}>
            <button className={styles.btnPrimary} type="submit" disabled={updating} tabIndex={showUpdateForm ? 0 : -1}>
              {updating ? 'Mise à jour…' : 'Sauvegarder'}
            </button>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => { setShowUpdateForm(false); setNewPseudo(''); setUpdateError('') }}
              tabIndex={showUpdateForm ? 0 : -1}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
