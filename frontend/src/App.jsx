import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import styled from 'styled-components'

import TabBar from './components/TabBar'
import CollectionScreen from './screens/CollectionScreen'
import ProfileScreen from './screens/ProfileScreen'
import WithdrawScreen from './screens/WithdrawScreen'
import useAuthStore from './store/useAuthStore'

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
  background: radial-gradient(120% 120% at 50% 0%, #640ecb 0%, #200035 100%);
`

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 96px;
`

export default function App() {
  const location = useLocation()
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <AppShell>
      <Content>
        <Routes location={location}>
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/withdraw" element={<WithdrawScreen />} />
          <Route path="/collection" element={<CollectionScreen />} />
          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>
      </Content>
      <TabBar />
    </AppShell>
  )
}
