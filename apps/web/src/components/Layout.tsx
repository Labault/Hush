import { Link, Outlet } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>Hush</Link>
          <nav className={styles.nav}>
            <Link to="/leaderboard" className={styles.navLink}>Classement</Link>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <span>Hush — l'art du silence</span>
        <Link to="/admin/login" className={styles.adminLink}>Admin</Link>
      </footer>
    </div>
  )
}
