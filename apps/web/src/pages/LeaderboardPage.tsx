import { Link } from 'react-router-dom'
import styles from './LeaderboardPage.module.css'

export default function LeaderboardPage() {
  return (
    <div className={styles.container}>
      <h1>Classement</h1>
      <p>À venir dans l'étape 4.B</p>
      <Link to="/" className={styles.back}>← Retour</Link>
    </div>
  )
}
