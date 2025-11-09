import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const TabBarContainer = styled.nav`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 420px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  z-index: 10;
`

const TabButton = styled(NavLink)`
  text-decoration: none;
  color: ${(props) => props.theme.colors.textSecondary};
  font-weight: 600;
  font-size: 14px;
  padding: 12px 16px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.2s ease;

  &[aria-current='page'] {
    background: linear-gradient(135deg, #ffdb4d 0%, #ff8a00 100%);
    color: #32043e;
    box-shadow: 0 10px 25px rgba(255, 166, 0, 0.35);
  }
`

export default function TabBar() {
  return (
    <TabBarContainer>
      <TabButton to="/profile">Профиль</TabButton>
      <TabButton to="/collection">Меню</TabButton>
      <TabButton to="/withdraw">Вывести</TabButton>
    </TabBarContainer>
  )
}
