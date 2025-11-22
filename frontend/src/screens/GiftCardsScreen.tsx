import { useEffect, useRef, useState } from 'react'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import styled from 'styled-components'

import giftPack from '../assets/img/card_pocket.png'
import starIcon from '../assets/icons/star.svg'
import linkIcon from '../assets/icons/link.svg'
import openingAnimation from '../assets/animations/card-opening.json'

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
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.1);
  color: ${(props) => props.theme.colors.textPrimary};
  border: none;
  border-radius: ${(props) => props.theme.radii.md};
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
`

const LinkIcon = styled.img`
  width: 18px;
  height: 18px;
`

const Balance = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: ${(props) => props.theme.radii.lg};
  background: linear-gradient(102deg, #f9f2b3 0%, #f5c544 100%);
  color: #000;
  font-weight: 800;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
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
  gap: 10px;
  background: #321055;
  padding: 10px;
  border-radius: 20px;
  overflow: hidden;
  isolation: isolate;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(40px);
    opacity: 0.9;
  }

  &::before {
    top: -140px;
    right: -110px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 60%);
  }

  &::after {
    bottom: -140px;
    left: -110px;
    background: radial-gradient(circle, rgba(199, 153, 255, 0.3) 0%, rgba(199, 153, 255, 0) 60%);
  }

  & > * {
    position: relative;
    z-index: 1;
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
  width: 48%;
  max-width: 280px;
  padding: 16px;
  border: none;
  border-radius: 20px;
  background:rgb(50,16,85);
  color: #2d1f07;
  font-weight: 800;
  font-size: 16px;
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.35);
`

const Overlay = styled.div<{ $isDarkened: boolean; $visible: boolean }>`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  opacity: ${(props) => (props.$isDarkened ? 1 : 0)};
  pointer-events: ${(props) => (props.$visible ? 'auto' : 'none')};
  transition: opacity 0.5s ease;
  z-index: 20;
`

const AnimationWrapper = styled.div`
  width: min(440px, 90vw);
`

type OverlayPhase = 'idle' | 'fadingIn' | 'animating' | 'fadingOut'

const Footer = styled.div`
  width: 100%;
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
  background: rgba(255, 255, 255, 0.05);
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 14px;
  text-align: center;
`

export default function GiftCardsScreen() {
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('idle')
  const [isDarkened, setIsDarkened] = useState(false)
  const lottieRef = useRef<LottieRefCurrentProps>(null)

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

  useEffect(() => {
    if (overlayPhase === 'idle') return

    const instance = lottieRef.current
    if (!instance) return

    const handleComplete = () => setOverlayPhase('fadingOut')

    instance.addEventListener('complete', handleComplete)

    return () => {
      instance.removeEventListener('complete', handleComplete)
    }
  }, [overlayPhase])

  return (
    <Screen>
      <Header>
        <ReferralButton>
          <LinkIcon src={linkIcon} alt="Referral" />
          REFERRAL
        </ReferralButton>
        <Balance>
          1000
          <StarIcon src={starIcon} alt="Stars" />
        </Balance>
      </Header>

      <CardContainer>
        <CardWrapper>
          <CardImageWrapper>
            <CardImage src={giftPack} alt="Gift cards pack" />
          </CardImageWrapper>
          <CardTitle>AL Gift cards</CardTitle>
          <CardSubtitle>
            Стоимость одного открытия - 15 <StarIcon src={starIcon} alt="Stars" />
          </CardSubtitle>
          <Price>
            15
            <StarIcon src={starIcon} alt="Stars" />
          </Price>
        </CardWrapper>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <OpenButton onClick={handleOpen}>Открыть</OpenButton>
          <OpenButton>Коллекция</OpenButton>
        </div>
      </CardContainer>

      <Footer>
        <NavigationButton>Коллекция</NavigationButton>
        <InviteHint>Пригласи друга и получи бесплатное открытие!</InviteHint>
      </Footer>

      {overlayPhase !== 'idle' && (
        <Overlay $isDarkened={isDarkened} $visible={overlayPhase !== 'idle'}>
          <AnimationWrapper>
            <Lottie
              lottieRef={lottieRef}
              animationData={openingAnimation}
              loop={false}
              autoplay={false}
            />
          </AnimationWrapper>
        </Overlay>
      )}
    </Screen>
  )
}
