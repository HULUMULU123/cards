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
  aspect-ratio: 3 / 5;
  min-height: 180px;

  /* убираем padding, чтобы ничего не сдвигало картинку */
  padding: 0;

  display: flex;
  align-items: flex-end;
  justify-content: flex-start;

  box-shadow: ${(props) =>
    props.$placeholder
      ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)'
      : 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)'};

  background: ${(props) =>
    props.$placeholder
      ? 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))'
      : 'none'};
  opacity: ${(props) => (props.$placeholder ? 0.35 : 1)};
`
const Quantity = styled.div`
  position: absolute;
  top: 7px;
  right: 7px;
  background: linear-gradient(135deg, #ffdb4d, #ff8a00);
  color: #32043e;
  border-radius: 999px;
  padding: 3px 5px;
  font-weight: 700;
  font-size: 13px;
`

const Title = styled.span`
  font-weight: 700;
  letter-spacing: 0.5px;
`

const BGImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;     /* ключевой момент — растягивает без искажений */
  object-position: center;
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
          <CardSlot key={card.id}>
            <BGImage src={card.image_url} alt="" />

            <Quantity>{card.quantity}×</Quantity>
          </CardSlot>
        )
      })}
    </Grid>
  )
}
