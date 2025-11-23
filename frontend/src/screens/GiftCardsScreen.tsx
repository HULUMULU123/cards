import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import styled from 'styled-components'

import giftPack from '../assets/img/card_pocket.png'
import starIcon from '../assets/icons/star.svg'
import linkIcon from '../assets/icons/link.svg'
import openingAnimation from '../assets/animations/card-opening.json'
import { useNavigate } from 'react-router-dom'

const Screen = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  width: 100%;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 480px;
`

const ReferralButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background:rgb(66, 24, 100);
  color: ${(props) => props.theme.colors.textPrimary};
  border: none;
  border-radius: ${(props) => props.theme.radii.sm};
  font-weight: 500;
  letter-spacing: 0.05em;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  border: 1.2px solid #5f5867;
`

const LinkIcon = styled.img`
  width: 13px;
  height: 13px;
  filter: brightness(0) invert(1);
`

const Balance = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: ${(props) => props.theme.radii.sm};
  background:rgb(79,29,119);
  color: #fff;
  font-weight: 800;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
  border: 1.2px solid #5f5867;
  
`

const StarIcon = styled.img`
  width: 18px;
  height: 18px;
`

const CardContainer = styled.div`
  width: 100%;
  max-width: 420px;
  border-radius: ${(props) => props.theme.radii.xl};
  padding: 24px 20px 28px;

  box-shadow: 0 28px 48px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
`

const CardWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;

  padding: 22px 12px;
  border-radius: 22px;
  width: 90%;
  border: 1.2px solid #6d5c82;

  background: rgb(47, 15, 76);
  overflow: hidden;
  isolation: isolate;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    filter: blur(55px);
    opacity: 0.75;
    pointer-events: none;
  }

  &::before {
    top: -130px;
    right: -110px;
    background: rgba(155, 33, 255, 1);
  }

  &::after {
    bottom: -200px;
    left: -110px;
    background: rgba(155, 33, 255, 0.7);
  }

  & > * {
    z-index: 1;
    position: relative;
  }
`


const CardImageWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const CardImage = styled.img`
  width: 80%;
  max-width: 320px;
  filter: drop-shadow(0 24px 32px rgba(0, 0, 0, 0.45));
`

const CardTitle = styled.h2`
  margin: 0;
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: 24px;
  font-weight: 800;
  text-align: center;
`

const CardSubtitle = styled.p`
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 15px;
  text-align: center;
`

const Price = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: ${(props) => props.theme.radii.lg};
  background: rgba(255, 255, 255, 0.08);
  color: ${(props) => props.theme.colors.textPrimary};
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
`

const OpenButton = styled.button`
  width: 60%;
  max-width: 280px;
  padding: 10px;
  border: none;
  border-radius: 30px;
  background: linear-gradient(135deg, #ffdb4d 0%, #ff8a00 100%);
  color: #2d1f07;
  font-weight: 800;
  font-size: 16px;
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.35);
  font-size: 22px;
  
`
const SecodaryButton = styled.button`
  width: 48%;
  max-width: 280px;
  padding: 16px;
  border: none;
  border-radius: 20px;
  background: rgb(50, 16, 85);
  color: #2d1f07;
  font-weight: 500;
  font-size: 18px;
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.35);
  color: #fff;
  border: 1.2px solid #5f5867;
`

const Overlay = styled.div<{ $isDarkened: boolean; $visible: boolean }>`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 1);
  opacity: ${(props) => (props.$isDarkened ? 1 : 0)};
  pointer-events: ${(props) => (props.$visible ? 'auto' : 'none')};
  transition: opacity 0.5s ease;
  z-index: 20;
`

const AnimationWrapper = styled.div`
  width: min(440px, 100vw);
`

type OverlayPhase = 'idle' | 'fadingIn' | 'animating' | 'fadingOut'

const Footer = styled.div`
  width: 80%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const NavigationButton = styled.button`
  padding: 14px;
  border: none;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  color: ${(props) => props.theme.colors.textPrimary};
  font-weight: 700;
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.28);
`

const InviteHint = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 16px;
  
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 18px;
  text-align: center;
  line-height: 1.5;
  color: rgb(204,	186,	207);

`

export default function GiftCardsScreen() {
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('idle')
  const [isDarkened, setIsDarkened] = useState(false)
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const navigate = useNavigate()
  const handleOpen = () => {
    if (overlayPhase !== 'idle') return

    setIsDarkened(false)
    setOverlayPhase('fadingIn')
  }

  useEffect(() => {
    if (overlayPhase === 'fadingIn') {
      const frame = requestAnimationFrame(() => setIsDarkened(true))

      const timer = setTimeout(() => {
        setOverlayPhase('animating')
        lottieRef.current?.stop()
        lottieRef.current?.goToAndPlay(0, true)
      }, 500)

      return () => {
        cancelAnimationFrame(frame)
        clearTimeout(timer)
      }
    }

    if (overlayPhase === 'fadingOut') {
      setIsDarkened(false)

      const timer = setTimeout(() => setOverlayPhase('idle'), 500)

      return () => clearTimeout(timer)
    }

    if (overlayPhase === 'idle') {
      setIsDarkened(false)
    }
  }, [overlayPhase])

  useEffect(() => {
    if (overlayPhase !== 'animating') return

    const instance = lottieRef.current
    const duration = instance?.getDuration(false)
    const fallback = setTimeout(() => setOverlayPhase('fadingOut'), (duration ?? 1.5) * 1000)

    return () => clearTimeout(fallback)
  }, [overlayPhase])

  return (
    <Screen>
      <Header>
        <ReferralButton>
          <LinkIcon src={linkIcon} alt="Referral" />
          REFERRAL
        </ReferralButton>
        <Balance>
          <span style={{fontWeight: '700', letterSpacing: '0.05rem'}}>
            1000
          </span>
          <StarIcon src={starIcon} alt="Stars" />
        </Balance>
      </Header>

      <CardContainer>
        <CardWrapper>
          <CardImageWrapper>
            <CardImage src={giftPack} alt="Gift cards pack" />
          </CardImageWrapper>
          
          <CardSubtitle>
            Стоимость одного открытия - 15 <StarIcon src={starIcon} alt="Stars" />
          </CardSubtitle>
          <OpenButton onClick={handleOpen}>Открыть</OpenButton>
        </CardWrapper>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <SecodaryButton onClick={()=>navigate('/collection')}>Коллекция</SecodaryButton>
          <SecodaryButton>Звезды</SecodaryButton>
        </div>
      </CardContainer>

      <Footer>
        
        <InviteHint>Пригласи друга и получи бесплатное открытие!</InviteHint>
      </Footer>

      {overlayPhase !== 'idle'
        ? createPortal(
            <Overlay $isDarkened={isDarkened} $visible={overlayPhase !== 'idle'}>
              <AnimationWrapper>
                <Lottie
                  lottieRef={lottieRef}
                  animationData={openingAnimation}
                  loop={false}
                  autoplay={false}
                  onComplete={() => setOverlayPhase('fadingOut')}
                />
              </AnimationWrapper>
            </Overlay>,
            document.body
          )
        : null}
    </Screen>
  )
}
