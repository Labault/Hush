import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'
import styles from './AdminLoginPage.module.css'

export default function AdminLoginPage() {
  const { admin, login } = useAdmin()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (admin) {
      navigate('/admin', { replace: true })
    }
  }, [admin, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Hush Admin</h1>
        <p className={styles.subtitle}>Connecte-toi pour accéder au panel</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">Identifiant</label>
            <input
              id="username"
              type="text"
              autoFocus
              autoComplete="username"
              className={styles.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {error && (
            <p className={styles.error} role="alert">{error}</p>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>

      <Link to="/" className={styles.backLink}>← Retour au site</Link>
    </div>
  )
}
