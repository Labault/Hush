import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AdminSession } from '@hush/shared'
import { getAllSessions, invalidateSession, revalidateSession } from '../../api/admin'
import { formatDuration, formatRelativeDate } from '../../lib/format'
import styles from './AdminSessionsPage.module.css'

const PER_PAGE = 25

export default function AdminSessionsPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'sessions', page, PER_PAGE],
    queryFn: () => getAllSessions(page, PER_PAGE),
  })

  const invalidateMutation = useMutation({
    mutationFn: invalidateSession,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'sessions'] })
      const prev = queryClient.getQueryData(['admin', 'sessions', page, PER_PAGE])
      queryClient.setQueryData(['admin', 'sessions', page, PER_PAGE], (old: typeof data) => {
        if (!old) return old
        return { ...old, items: old.items.map(s => s.id === id ? { ...s, isValid: false } : s) }
      })
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['admin', 'sessions', page, PER_PAGE], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] })
    },
  })

  const revalidateMutation = useMutation({
    mutationFn: revalidateSession,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'sessions'] })
      const prev = queryClient.getQueryData(['admin', 'sessions', page, PER_PAGE])
      queryClient.setQueryData(['admin', 'sessions', page, PER_PAGE], (old: typeof data) => {
        if (!old) return old
        return { ...old, items: old.items.map(s => s.id === id ? { ...s, isValid: true } : s) }
      })
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['admin', 'sessions', page, PER_PAGE], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] })
    },
  })

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 1

  return (
    <div>
      <h1 className={styles.title}>Sessions</h1>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Pseudo</th>
              <th>Durée</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j}><span className={styles.skeletonCell} /></td>
                    ))}
                  </tr>
                ))
              : data?.items.map((session: AdminSession) => (
                  <tr key={session.id}>
                    <td>
                      <span title={new Date(session.createdAt).toLocaleString('fr-FR')}>
                        {formatRelativeDate(session.createdAt)}
                      </span>
                    </td>
                    <td>{session.pseudoSnapshot}</td>
                    <td className={styles.mono}>{formatDuration(session.durationMs)}</td>
                    <td>
                      <span className={`${styles.badge} ${session.isValid ? styles.badgeValid : styles.badgeInvalid}`}>
                        {session.isValid ? 'Valide' : 'Invalidée'}
                      </span>
                    </td>
                    <td>
                      {session.isValid ? (
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => invalidateMutation.mutate(session.id)}
                          disabled={invalidateMutation.isPending}
                        >
                          Invalider
                        </button>
                      ) : (
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                          onClick={() => revalidateMutation.mutate(session.id)}
                          disabled={revalidateMutation.isPending}
                        >
                          Réactiver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Précédent
        </button>
        <span className={styles.pageInfo}>
          Page {page} / {totalPages}
          {data && <span className={styles.pageTotal}>&nbsp;({data.total} sessions)</span>}
        </span>
        <button
          className={styles.pageBtn}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || !data}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}
