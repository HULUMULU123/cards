import styled from 'styled-components'

import { Card } from '../types/entities'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  width: 100%;
`

const CardSlot = styled.div<{ $placeholder?: boolean }>`
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: ${(props) =>
    props.$placeholder
      ? 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))'
      : 'radial-gradient(circle at top, rgba(255, 255, 255, 0.25), rgba(0, 0, 0, 0.25))'};
  aspect-ratio: 3 / 5;
  min-height: 180px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 16px;
  box-shadow: ${(props) =>
    props.$placeholder
      ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)'
      : 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)'};
  text-shadow: ${(props) => (props.$placeholder ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.45)')};
  background-size: cover;
  background-position: center;
  opacity: ${(props) => (props.$placeholder ? 0.35 : 1)};
`

const Quantity = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ffdb4d, #ff8a00);
  color: #32043e;
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 700;
  font-size: 13px;
`

const Title = styled.span`
  font-weight: 700;
  letter-spacing: 0.5px;
`

interface CardGridProps {
  cards: Card[]
}

export default function CardGrid({ cards }: CardGridProps) {
  const columns = 3
  const remainder = cards.length % columns
  const placeholders = remainder === 0 ? 0 : columns - remainder
  const slots: (Card | null)[] = [...cards, ...Array(placeholders).fill(null)]

  return (
    <Grid>
      {slots.map((card, index) => {
        if (!card) {
          return <CardSlot key={`placeholder-${index}`} $placeholder />
        }
        const style = card.image_url
          ? { backgroundImage: `linear-gradient(120deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45)), url(${card.image_url})` }
          : undefined
        return (
          <CardSlot key={card.id || `${card.title}-${card.rarity}`} style={style}>
            <Quantity>{card.quantity}×</Quantity>
            <Title>{card.title}</Title>
          </CardSlot>
        )
      })}
    </Grid>
  )
}
