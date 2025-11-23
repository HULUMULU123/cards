import { createPortal } from 'react-dom'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import openingAnimation from '../assets/animations/card-opening.json'
import { Card } from '../types/entities'

const Backdrop = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 1);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`

const ModalCard = styled.div`
  background: #000;
  padding: 22px;
  border-radius: 18px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.55);
  width: min(420px, 90vw);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
`

interface CardOpenModalProps {
  card: Card
  onClose: () => void
}

export default function CardOpenModal({ card, onClose }: CardOpenModalProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const [visible, setVisible] = useState(false)
  const closingRef = useRef(false)

  useEffect(() => {
    closingRef.current = false
    setVisible(true)
    lottieRef.current?.goToAndPlay(0, true)
  }, [card])

  const handleClose = () => {
    if (closingRef.current) return
    closingRef.current = true
    setVisible(false)
    setTimeout(onClose, 500)
  }

  return createPortal(
    <Backdrop onClick={handleClose} $visible={visible}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <Lottie
          lottieRef={lottieRef}
          animationData={openingAnimation}
          style={{ width: '100%', maxWidth: 320 }}
          loop={false}
          onComplete={handleClose}
        />
      </ModalCard>
    </Backdrop>,
    document.body,
  )
}
