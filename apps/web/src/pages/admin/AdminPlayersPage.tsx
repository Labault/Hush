import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AdminPlayer } from '@hush/shared'
import { getAllPlayers, deletePlayer } from '../../api/admin'
import { formatRelativeDate } from '../../lib/format'
import styles from './AdminPlayersPage.module.css'

const PER_PAGE = 25

function ConfirmModal({
  player,
  onCancel,
  onConfirm,
  isPending,
}: {
  player: AdminPlayer
  onCancel: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <p className={styles.modalText}>
          Supprimer <strong>{player.pseudo}</strong> et ses{' '}
          <strong>{player._count.sessions}</strong> session{player._count.sessions !== 1 ? 's' : ''} ?
          Cette action est irréversible.
        </p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={isPending}>
            Annuler
          </button>
          <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Suppression…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPlayersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [playerToDelete, setPlayerToDelete] = useState<AdminPlayer | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'players', page, PER_PAGE, debouncedSearch],
    queryFn: () => getAllPlayers(page, PER_PAGE, debouncedSearch || undefined),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'players'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      setPlayerToDelete(null)
    },
  })

  const handleDelete = useCallback(() => {
    if (playerToDelete) deleteMutation.mutate(playerToDelete.id)
  }, [playerToDelete, deleteMutation])

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 1

  return (
    <div>
      <h1 className={styles.title}>Joueurs</h1>

      <input
        type="search"
        placeholder="Rechercher un pseudo…"
        className={styles.searchInput}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pseudo</th>
              <th>Inscrit</th>
              <th>Sessions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j}><span className={styles.skeletonCell} /></td>
                    ))}
                  </tr>
                ))
              : data?.items.map((player: AdminPlayer) => (
                  <tr key={player.id}>
                    <td className={styles.pseudoCell}>{player.pseudo}</td>
                    <td>{formatRelativeDate(player.createdAt)}</td>
                    <td>{player._count.sessions}</td>
                    <td>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => setPlayerToDelete(player)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {data?.items.length === 0 && !isLoading && (
        <p className={styles.empty}>Aucun joueur trouvé.</p>
      )}

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
          {data && <span className={styles.pageTotal}>&nbsp;({data.total} joueurs)</span>}
        </span>
        <button
          className={styles.pageBtn}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || !data}
        >
          Suivant
        </button>
      </div>

      {playerToDelete && (
        <ConfirmModal
          player={playerToDelete}
          onCancel={() => setPlayerToDelete(null)}
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
