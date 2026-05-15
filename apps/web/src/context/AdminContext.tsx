import { createContext, useContext, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { Admin } from '@hush/shared'
import * as adminApi from '../api/admin'

type AdminContextValue = {
  admin: Admin | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: admin, isLoading } = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: adminApi.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
    throwOnError: false,
  })

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      adminApi.login(username, password),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin', 'me'], data.admin)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: adminApi.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['admin'] })
      navigate('/admin/login', { replace: true })
    },
  })

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password })
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  const resolvedAdmin =
    admin instanceof Error || admin === undefined
      ? null
      : admin

  const resolvedLoading = isLoading

  return (
    <AdminContext.Provider
      value={{
        admin: resolvedAdmin,
        isLoading: resolvedLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within <AdminProvider>')
  return ctx
}

export { AdminAuthError } from '../api/admin'
