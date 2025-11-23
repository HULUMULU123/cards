import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import profile from '../assets/icons/profile.svg'
import menu from '../assets/icons/menu.svg'
import widthdraw from '../assets/icons/out.svg'
const TabBarContainer = styled.nav`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 420px;
  background:rgb(79,29,119);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  z-index: 10;
  border: 1.2px solid #5f5867;
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
    color: #fff;
    box-shadow: 0 10px 25px rgba(255, 166, 0, 0.35);
  }
`

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const StyledIcon = styled.img`
  filter: brightness(0) invert(1);
  width: 40px;
  height: 40px;
  margin-bottom: 4px;`
const StyledSpan = styled.span``
export default function TabBar() {
  return (
    <TabBarContainer>
      <TabButton to="/profile">
        <StyledWrapper>
          <StyledIcon src={profile}/><StyledSpan>Профиль</StyledSpan>
        </StyledWrapper>
      </TabButton>
      <TabButton to="/menu">
        <StyledWrapper>
          <StyledIcon src={menu}/>
          <StyledSpan>Меню</StyledSpan>
        </StyledWrapper>
      </TabButton>
      <TabButton to="/withdraw">
        <StyledWrapper>
          <StyledIcon src={widthdraw}/>
          <StyledSpan>Вывести</StyledSpan>
        </StyledWrapper>
      </TabButton>
    </TabBarContainer>
  )
}
