import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'

import CardGrid from '../components/CardGrid'
import CardPreviewModal from '../components/CardPreviewModal'
import useAuthStore from '../store/useAuthStore'
import ReferralBadge from '../components/ReferralBadge'
import { Card } from '../types/entities'

const Screen = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  width: 100%;
`

const Heading = styled.h1`
  font-size: 32px;
  margin: 0;
`

const Container = styled.div`
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: ${(props) => props.theme.radii.xl};
  padding: 24px;
  box-shadow: 0 28px 48px rgba(0, 0, 0, 0.35);
`

const Subtitle = styled.p`
  margin: 0 0 24px;
  color: ${(props) => props.theme.colors.textSecondary};
`

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  border-radius: ${(props) => props.theme.radii.lg};
  background: rgba(0, 0, 0, 0.2);
  color: ${(props) => props.theme.colors.textSecondary};
`

export default function CollectionScreen() {
  const cards = useAuthStore((state) => state.collection)
  const fetchCollection = useAuthStore((state) => state.fetchCollection)
  const profile = useAuthStore((state) => state.profile)
  const navigate = useNavigate()
  const [previewCard, setPreviewCard] = useState<Card | null>(null)

  useEffect(() => {
    void fetchCollection()
  }, [fetchCollection])

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      {
        cards: typeof cards
        color?: string
        rating?: number
        reward?: number
        rowRewards?: number[]
        total?: number
      }
    >()
    cards.forEach((card) => {
      const key = card.group?.name || 'Без группы'
      if (!map.has(key)) {
        map.set(key, {
          cards: [],
          color: card.group?.color,
          rating: card.group?.rating,
          reward: card.group?.row_reward,
          rowRewards: card.group?.row_rewards,
          total: card.group?.total_templates,
        })
      }
      map.get(key)!.cards.push(card)
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }, [cards])

  const handleReferral = () => navigate('/profile')

  return (
    <Screen>
      <Heading>Коллекция</Heading>
      <Container>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Subtitle>Все карточки под рукой. Проверь, что выпало.</Subtitle>
          <ReferralBadge link={profile?.referral_link} onCopy={handleReferral} />
        </div>
        {grouped.length > 0 ? (
          grouped.map((group) => (
            <div key={group.name} style={{ marginBottom: 18 }}>
              <CardGrid
                cards={group.cards}
                groupName={group.name}
                groupColor={group.color}
                groupRating={group.rating}
                groupReward={group.reward}
                groupRowRewards={group.rowRewards}
                groupTotal={group.total}
                onCardOpen={(card) => setPreviewCard(card)}
              />
            </div>
          ))
        ) : (
          <EmptyState>Карточек пока нет</EmptyState>
        )}
      </Container>
      {previewCard && (
        <CardPreviewModal card={previewCard} onClose={() => setPreviewCard(null)} />
      )}
    </Screen>
  )
}
