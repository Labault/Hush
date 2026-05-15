import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Player } from '@hush/shared'
import { createPlayer, getPlayer, updatePlayerPseudo } from '../api/players'
import { getStoredPlayerId, setStoredPlayerId, clearStoredPlayerId } from '../lib/storage'

type PlayerContextValue = {
  player: Player | null
  isLoading: boolean
  createNewPlayer: (pseudo: string) => Promise<Player>
  updatePseudo: (pseudo: string) => Promise<Player>
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [playerId, setPlayerId] = useState<string | null>(() => getStoredPlayerId())

  const { data: player, isLoading } = useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      if (!playerId) return null
      try {
        return await getPlayer(playerId)
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        if (msg.includes('404') || msg.includes('not found')) {
          clearStoredPlayerId()
          setPlayerId(null)
        }
        return null
      }
    },
    enabled: playerId !== null,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (playerId === null) {
      queryClient.removeQueries({ queryKey: ['player'] })
    }
  }, [playerId, queryClient])

  const createMutation = useMutation({
    mutationFn: (pseudo: string) => createPlayer({ pseudo }),
    onSuccess: (newPlayer) => {
      setStoredPlayerId(newPlayer.id)
      setPlayerId(newPlayer.id)
      queryClient.setQueryData(['player', newPlayer.id], newPlayer)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (pseudo: string) => updatePlayerPseudo(playerId!, { pseudo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', playerId] })
    },
  })

  const createNewPlayer = async (pseudo: string): Promise<Player> => {
    return createMutation.mutateAsync(pseudo)
  }

  const updatePseudo = async (pseudo: string): Promise<Player> => {
    return updateMutation.mutateAsync(pseudo)
  }

  return (
    <PlayerContext.Provider
      value={{
        player: player ?? null,
        isLoading: playerId !== null && isLoading,
        createNewPlayer,
        updatePseudo,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within <PlayerProvider>')
  return ctx
}
