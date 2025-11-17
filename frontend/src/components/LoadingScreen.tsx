import styled, { keyframes } from 'styled-components'

const fade = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: radial-gradient(circle at top, #2c0054 0%, #100019 60%);
  color: #fff;
  z-index: 999;
`

const Spinner = styled.div`
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #e2c9ff 0%, #c27dff 28%, #8f3df9 60%, #5a18a8 100%);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 12px;
    border-radius: 50%;
    border: 6px solid transparent;
    border-top-color: rgba(255, 255, 255, 0.85);
    border-right-color: rgba(255, 255, 255, 0.35);
    animation: ${fade} 1.6s linear infinite;
  }
`

const Title = styled.p`
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.5px;
`

export default function LoadingScreen() {
  return (
    <Backdrop>
      <Spinner />
      <Title>Загрузка...</Title>
    </Backdrop>
  )
}
