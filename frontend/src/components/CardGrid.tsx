import React, { useRef } from 'react'
import styled from 'styled-components'

import { Card } from '../types/entities'
import starIcon from '../assets/icons/star.svg'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
  touch-action: pan-y;
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
  position: relative;
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

const RowReward = styled.span<{ $accent?: string }>`
  position: absolute;
  top: -8px;
  right: 8px;
  z-index: 2;
  pointer-events: none;
  font-size: 10px;
  padding: 4px 6px;
  border-radius: 999px;
  background: ${({ $accent }) =>
    $accent ? `linear-gradient(160deg, ${$accent}55, rgba(0,0,0,0.5))` : 'rgba(0,0,0,0.55)'};
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  white-space: nowrap;
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

const Rows = styled.div`
  display: grid;
  gap: 12px;
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
  groupRowRewards?: number[]
  groupTotal?: number
  templates?: { id: number; rank?: number }[]
  onCardOpen?: (card: Card) => void
}

export default function CardGrid({
  cards,
  groupName,
  groupColor,
  groupRating,
  groupRowRewards,
  groupTotal,
  templates,
  onCardOpen,
}: CardGridProps) {
  const columns = 3
  const sortedCards = [...cards].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))
  const cardsByTemplate = new Map<number, Card>()
  cards.forEach((card) => {
    if (card.template_id != null) {
      cardsByTemplate.set(card.template_id, card)
    }
  })
  const rows: (Card | null)[][] = []
  const collected = cards.length
  const total = groupTotal ?? collected
  const rowRewards = groupRowRewards ?? []
  const displayRowRewards = rowRewards.length > 0 ? [...rowRewards].reverse() : []
  const templateList = templates ? [...templates].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0)) : []
  const totalRows =
    rowRewards.length > 0
      ? rowRewards.length
      : Math.max(1, Math.ceil((templateList.length || sortedCards.length) / columns))
  const badgeReward =
    rowRewards.length > 0 ? rowRewards.reduce((sum, reward) => sum + reward, 0) : 0
  const totalSlots = totalRows * columns
  if (templateList.length > 0) {
    const slots: (Card | null)[] = []
    for (let index = 0; index < totalSlots; index += 1) {
      const template = templateList[index]
      if (!template) {
        slots.push(null)
        continue
      }
      const card = cardsByTemplate.get(template.id) ?? null
      slots.push(card)
    }
    for (let i = 0; i < slots.length; i += columns) {
      rows.push(slots.slice(i, i + columns))
    }
  } else {
    for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
      const start = rowIndex * columns
      const row = sortedCards.slice(start, start + columns)
      while (row.length < columns) row.push(null)
      rows.push(row)
    }
  }
  const pointerRef = useRef<{ x: number; y: number; time: number; id: number } | null>(null)
  const movedRef = useRef(false)

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!onCardOpen) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    pointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
      id: event.pointerId,
    }
    movedRef.current = false
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    const start = pointerRef.current
    if (!start || start.id !== event.pointerId) return
    const dx = Math.abs(event.clientX - start.x)
    const dy = Math.abs(event.clientY - start.y)
    if (dx > 8 || dy > 8) {
      movedRef.current = true
    }
  }

  const handlePointerCancel = () => {
    pointerRef.current = null
    movedRef.current = false
  }

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
            <span>{badgeReward}</span>
          </RewardBadge>
        </GroupMeta>
      </GroupTitle>
      <Rows>
        {rows.map((row, rowIndex) => (
          <Row key={`row-${rowIndex}`} $accent={groupColor}>
            <RowReward $accent={groupColor}>
              Награда за ряд: {displayRowRewards[rowIndex] ?? 0}
            </RowReward>
            <Grid>
              {row.map((card, index) => {
                if (!card) {
                  return <CardSlot key={`placeholder-${rowIndex}-${index}`} $placeholder />
                }
                return (
                  <CardSlot
                    key={card.id}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerCancel={handlePointerCancel}
                    onPointerUp={(event) => {
                      const start = pointerRef.current
                      if (!start || start.id !== event.pointerId) return
                      const elapsed = Date.now() - start.time
                      const isTap = !movedRef.current && elapsed < 280
                      pointerRef.current = null
                      if (isTap && onCardOpen) {
                        onCardOpen(card)
                      }
                    }}
                  >
                    {card.image_url ? (
                      <BGImage
                        src={card.image_url}
                        alt={card.title}
                        loading="lazy"
                        decoding="async"
                      />
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
        ))}
      </Rows>
    </div>
  )
}
