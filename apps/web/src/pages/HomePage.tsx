import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../hooks/usePlayer'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { player, isLoading, createNewPlayer, updatePseudo } = usePlayer()
  const navigate = useNavigate()

  const [pseudo, setPseudo] = useState('')
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [newPseudo, setNewPseudo] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [updating, setUpdating] = useState(false)

  if (isLoading) {
    return <div className={styles.container}><p>Chargement…</p></div>
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
        <h1 className={styles.title}>Bienvenue sur Hush</h1>
        <p className={styles.subtitle}>Choisis ton pseudo pour commencer</p>
        <form className={styles.form} onSubmit={handleCreate}>
          <input
            className={styles.input}
            type="text"
            placeholder="Ton pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            maxLength={30}
            required
          />
          {createError && <p className={styles.error}>{createError}</p>}
          <button className={styles.btnPrimary} type="submit" disabled={creating}>
            {creating ? 'Création…' : 'Créer mon profil'}
          </button>
        </form>
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
      <h1 className={styles.title}>Salut, {player.pseudo}</h1>
      <p className={styles.subtitle}>Prêt à tenir le silence ?</p>
      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={() => navigate('/session')}>
          Démarrer une session
        </button>
        <button className={styles.btnSecondary} onClick={() => { setShowUpdateForm(!showUpdateForm); setUpdateError('') }}>
          Changer mon pseudo
        </button>
        <button className={styles.btnTertiary} onClick={() => navigate('/leaderboard')}>
          Voir le classement
        </button>
      </div>
      {showUpdateForm && (
        <form className={styles.inlineForm} onSubmit={handleUpdate}>
          <input
            className={styles.input}
            type="text"
            placeholder="Nouveau pseudo"
            value={newPseudo}
            onChange={(e) => setNewPseudo(e.target.value)}
            maxLength={30}
            required
          />
          {updateError && <p className={styles.error}>{updateError}</p>}
          <button className={styles.btnPrimary} type="submit" disabled={updating}>
            {updating ? 'Mise à jour…' : 'Valider'}
          </button>
        </form>
      )}
    </div>
  )
}
