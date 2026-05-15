import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  const { admin, logout } = useAdmin()

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <Link to="/" className={styles.backLink}>← Retour au site</Link>
            <span className={styles.logo}>Hush Admin</span>
          </div>
          <nav className={styles.nav}>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/sessions"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              Sessions
            </NavLink>
            <NavLink
              to="/admin/players"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              Joueurs
            </NavLink>
          </nav>
          <div className={styles.headerRight}>
            <span className={styles.userLabel}>
              {admin?.username}
            </span>
            <button className={styles.logoutBtn} onClick={logout}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
