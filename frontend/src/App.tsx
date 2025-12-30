import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import TabBar from './components/TabBar'
import LoadingScreen from './components/LoadingScreen'
import CollectionScreen from './screens/CollectionScreen'
import ProfileScreen from './screens/ProfileScreen'
import WithdrawScreen from './screens/WithdrawScreen'
import useAuthStore from './store/useAuthStore'
import useTelegramAuth from './hooks/useTelegramAuth'


import { GlobalStyles } from './styles/globalStyles';
import GiftCardsScreen from './screens/GiftCardsScreen'

const AppShell = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
  background: #0b0117;
  overflow: hidden;
  padding-bottom:50px;


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
      rgba(84, 30, 120, 1) 0%,
      rgba(120, 0, 255, 0.18) 70%,
      rgba(120, 0, 255, 0.0) 90%
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

const BlockedScreen = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  color: #f2f2f2;
`

const BlockedCard = styled.div`
  max-width: 420px;
  background: rgba(12, 8, 20, 0.95);
  border-radius: 22px;
  padding: 28px;
  box-shadow: 0 28px 52px rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
`

const BlockedTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 22px;
`

const BlockedText = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
`

export default function App() {
  const location = useLocation()
  const appReady = useAuthStore((state) => state.appReady)
  const authBlocked = useAuthStore((state) => state.authBlocked)
  const authMessage = useAuthStore((state) => state.authMessage)
  useTelegramAuth()

  if (!appReady) {
    return <LoadingScreen />
  }

  if (authBlocked) {
    return (
      <>
        <GlobalStyles />
        <BlockedScreen>
          <BlockedCard>
            <BlockedTitle>Доступ ограничен</BlockedTitle>
            <BlockedText>
              {authMessage || 'Откройте приложение через официального Telegram бота.'}
            </BlockedText>
          </BlockedCard>
        </BlockedScreen>
      </>
    )
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
          <Route path="/menu" element={<GiftCardsScreen />} />
          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>
      </Content>
      <TabBar />
    </AppShell>
    </>
    
  )
}
