import { useQuery } from '@tanstack/react-query'
import { getAdminStats } from '../../api/admin'
import { formatDuration } from '../../lib/format'
import styles from './AdminDashboardPage.module.css'

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className={styles.card}>
      <span className={styles.cardValue}>{value}</span>
      <span className={styles.cardLabel}>{label}</span>
      {sub && <span className={styles.cardSub}>{sub}</span>}
    </div>
  )
}

function SkeletonCard() {
  return <div className={styles.skeleton} />
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
    refetchInterval: 60_000,
  })

  return (
    <div>
      <h1 className={styles.title}>Tableau de bord</h1>

      {isError && (
        <p className={styles.error}>Impossible de charger les statistiques.</p>
      )}

      <div className={styles.grid}>
        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
        ) : stats ? (
          <>
            <StatCard label="joueurs inscrits" value={String(stats.totalPlayers)} />
            <StatCard label="sessions valides" value={String(stats.totalSessions)} />
            <StatCard
              label="sessions invalidées"
              value={String(stats.totalInvalidSessions)}
              sub="modérées"
            />
            <StatCard
              label="durée moyenne"
              value={stats.avgDurationMs != null ? formatDuration(stats.avgDurationMs) : '—'}
            />
            <StatCard
              label="record"
              value={stats.maxDurationMs != null ? formatDuration(stats.maxDurationMs) : '—'}
            />
            <StatCard label="sessions (24h)" value={String(stats.sessionsLast24h)} />
            <StatCard label="sessions (7 jours)" value={String(stats.sessionsLast7d)} />
          </>
        ) : null}
      </div>
    </div>
  )
}
