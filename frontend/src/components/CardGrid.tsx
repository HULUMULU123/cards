import styled from 'styled-components'

import { Card } from '../types/entities'
import starIcon from '../assets/icons/star.svg'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  width: 100%;
  justify-items: center;
`

const CardSlot = styled.div<{ $placeholder?: boolean }>`
  position: relative;
  width: 100%;
  max-width: 180px;
  border-radius: 24px;
  overflow: hidden;
  aspect-ratio: 3 / 5;
  min-height: 0;
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
  display: none;
`

const BGImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`

const Info = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 100%);
`

const Rarity = styled.span`
  font-size: 12px;
  text-transform: capitalize;
  color: rgba(255, 255, 255, 0.86);
  white-space: nowrap;
`

const Fallback = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.08), transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.06), transparent 45%),
    #1c0f2f;
`

const Row = styled.div<{ $accent?: string }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  align-items: start;
  width: 100%;
  border-radius: 18px;
  padding: 12px;
  background: ${({ $accent }) =>
    $accent
      ? `linear-gradient(120deg, rgba(0,0,0,0.2), ${$accent}22)`
      : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid rgba(255, 255, 255, 0.08);
`

const RewardBadge = styled.div<{ $accent?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 14px;
  background: ${({ $accent }) =>
    $accent
      ? `linear-gradient(160deg, ${$accent}33, rgba(0,0,0,0.45))`
      : 'rgba(0,0,0,0.45)'};
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  align-self: center;
`

const GroupTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  font-weight: 700;
  flex-wrap: wrap;
`

const GroupMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  opacity: 0.8;
`

const ProgressBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-weight: 700;
`

interface CardGridProps {
  cards: Card[]
  groupName?: string
  groupColor?: string
  groupRating?: number
  groupReward?: number
  groupTotal?: number
}

export default function CardGrid({
  cards,
  groupName,
  groupColor,
  groupRating,
  groupReward,
  groupTotal,
}: CardGridProps) {
  const columns = 3
  const remainder = cards.length % columns
  const placeholders = remainder === 0 ? 0 : columns - remainder
  const slots: (Card | null)[] = [...cards, ...Array(placeholders).fill(null)]
  const collected = cards.length
  const total = groupTotal ?? collected

  return (
    <div style={{ width: '100%' }}>
      <GroupTitle>
        <span>{groupName}</span>
        <GroupMeta>
          <span>Рейтинг: {groupRating ?? '—'}</span>
          <ProgressBadge>
            {collected}/{total}
          </ProgressBadge>
          <RewardBadge $accent={groupColor}>
            <img src={starIcon} alt="star" width={16} height={16} />
            <span>{groupReward ?? 0}</span>
          </RewardBadge>
        </GroupMeta>
      </GroupTitle>
      <Row $accent={groupColor}>
        <Grid>
          {slots.map((card, index) => {
            if (!card) {
              return <CardSlot key={`placeholder-${index}`} $placeholder />
            }
            return (
              <CardSlot key={card.id}>
                {card.image_url ? (
                  <BGImage src={card.image_url} alt={card.title} loading="lazy" decoding="async" />
                ) : (
                  <Fallback />
                )}
                {card.quantity > 1 && <Quantity>{card.quantity}×</Quantity>}
                {/* <Info>
                  <Title title={card.title}>{card.title}</Title>
                  <Rarity>{card.group?.name || card.rarity}</Rarity>
                </Info> */}
              </CardSlot>
            )
          })}
        </Grid>
      </Row>
    </div>
  )
}
