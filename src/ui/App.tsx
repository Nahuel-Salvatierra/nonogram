import { useThemeSync } from '@app/hooks/useThemeSync'
import { MockAdDialog } from '@ui/components/MockAdDialog/MockAdDialog'
import { ROUTES } from '@ui/routes'
import { CollectionScreen } from '@ui/screens/CollectionScreen/CollectionScreen'
import { GameScreen } from '@ui/screens/GameScreen/GameScreen'
import { HomeScreen } from '@ui/screens/HomeScreen/HomeScreen'
import { HowToPlayScreen } from '@ui/screens/HowToPlayScreen/HowToPlayScreen'
import { SettingsScreen } from '@ui/screens/SettingsScreen/SettingsScreen'
import { StatsScreen } from '@ui/screens/StatsScreen/StatsScreen'
import { VictoryScreen } from '@ui/screens/VictoryScreen/VictoryScreen'
import { HashRouter, Navigate, Route, Routes } from 'react-router'

export function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path={ROUTES.home} element={<HomeScreen />} />
        <Route path={ROUTES.collection} element={<CollectionScreen />} />
        <Route path={ROUTES.game} element={<GameScreen />} />
        <Route path={ROUTES.victory} element={<VictoryScreen />} />
        <Route path={ROUTES.stats} element={<StatsScreen />} />
        <Route path={ROUTES.settings} element={<SettingsScreen />} />
        <Route path={ROUTES.howToPlay} element={<HowToPlayScreen />} />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
      <MockAdDialog />
    </>
  )
}

export function App() {
  useThemeSync()

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
