import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import styled from 'styled-components'

import TabBar from './components/TabBar'
import LoadingScreen from './components/LoadingScreen'
import CollectionScreen from './screens/CollectionScreen'
import ProfileScreen from './screens/ProfileScreen'
import WithdrawScreen from './screens/WithdrawScreen'
import useAuthStore from './store/useAuthStore'


import { GlobalStyles } from './styles/globalStyles';

const AppShell = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
  background: #0b0117;
  overflow: hidden;
 


  /* Фиолетовые круги */
  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(120, 0, 255, 0.55) 0%,
      rgba(120, 0, 255, 0.18) 55%,
      rgba(120, 0, 255, 0.0) 70%
    );
    filter: blur(90px);
    pointer-events: none;
    z-index: 0;
  }
  /* правый верхний */
  &::before {
    top: -140px;
    right: -140px;
  }
  /* левый нижний */
  &::after {
    bottom: -140px;
    left: -140px;
  }
`

const Content = styled.main`
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 96px;
`

export default function App() {
  const location = useLocation()
  const initialize = useAuthStore((state) => state.initialize)
  const appReady = useAuthStore((state) => state.appReady)

  useEffect(() => {
    void initialize()
  }, [initialize])

  if (!appReady) {
    return <LoadingScreen />
  }

  return (
    <>
    <GlobalStyles />
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
    </>
    
  )
}
