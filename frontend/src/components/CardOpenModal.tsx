import { createPortal } from 'react-dom'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import openingAnimation from '../assets/animations/card-opening.json'
import { Card } from '../types/entities'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`

const ModalCard = styled.div`
  background: #130720;
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

const CardImage = styled.img`
  width: 80%;
  max-width: 280px;
  filter: drop-shadow(0 24px 32px rgba(0, 0, 0, 0.45));
`

interface CardOpenModalProps {
  card: Card
  onClose: () => void
}

export default function CardOpenModal({ card, onClose }: CardOpenModalProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  useEffect(() => {
    lottieRef.current?.goToAndPlay(0, true)
  }, [card])

  return createPortal(
    <Backdrop onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <Lottie
          lottieRef={lottieRef}
          animationData={openingAnimation}
          style={{ width: '100%', maxWidth: 320 }}
          loop={false}
        />
        {card.image_url && <CardImage src={card.image_url} alt={card.title} />}
        <div>
          <strong>{card.title}</strong>
          <div>{card.group || card.rarity}</div>
        </div>
        {card.animation_url && <small>Анимация будет загружена из бэкенда</small>}
      </ModalCard>
    </Backdrop>,
    document.body,
  )
}
