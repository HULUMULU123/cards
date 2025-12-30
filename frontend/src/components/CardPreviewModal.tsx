import { createPortal } from 'react-dom'
import styled from 'styled-components'
import fallbackCardImage from '../assets/img/card.png'
import { Card } from '../types/entities'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const Modal = styled.div`
  position: relative;
  width: min(520px, 92vw);
  max-height: 80vh;
  border-radius: 22px;
  background: rgba(12, 8, 20, 0.95);
  box-shadow: 0 28px 52px rgba(0, 0, 0, 0.55);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 18px;
  line-height: 1;
`

const Image = styled.img`
  width: 100%;
  max-width: 360px;
  max-height: 62vh;
  object-fit: contain;
  border-radius: 18px;
  box-shadow: 0 22px 44px rgba(0, 0, 0, 0.45);
`

const Title = styled.div`
  font-weight: 700;
  text-align: center;
  font-size: 18px;
`

const Subtitle = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
`

interface CardPreviewModalProps {
  card: Card
  onClose: () => void
}

export default function CardPreviewModal({ card, onClose }: CardPreviewModalProps) {
  const imageUrl = card.image_url || fallbackCardImage
  return createPortal(
    <Backdrop onClick={onClose}>
      <Modal onClick={(event) => event.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="close">
          ×
        </CloseButton>
        <Image src={imageUrl} alt={card.title} loading="lazy" decoding="async" />
        <Title>{card.title}</Title>
        <Subtitle>{card.group?.name || card.rarity}</Subtitle>
      </Modal>
    </Backdrop>,
    document.body,
  )
}
