import { ROUTES } from '@ui/routes'
import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'

export const useGoBack = (): (() => void) => {
  const navigate = useNavigate()
  const location = useLocation()
  const hasHistory = location.key !== 'default'

  return useCallback(() => {
    if (hasHistory) void navigate(-1)
    else void navigate(ROUTES.home, { replace: true })
  }, [hasHistory, navigate])
}
