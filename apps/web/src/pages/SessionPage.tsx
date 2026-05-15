import { Link } from 'react-router-dom'
import styles from './SessionPage.module.css'

export default function SessionPage() {
  return (
    <div className={styles.container}>
      <h1>Session en cours</h1>
      <p>À venir dans l'étape 4.B</p>
      <Link to="/" className={styles.back}>← Retour</Link>
    </div>
  )
}
