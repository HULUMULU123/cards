import { useEffect } from 'react'
import styled from 'styled-components'

import CardGrid from '../components/CardGrid'
import useAuthStore from '../store/useAuthStore'

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

  useEffect(() => {
    fetchCollection()
  }, [fetchCollection])

  return (
    <Screen>
      <Heading>Коллекция</Heading>
      <Container>
        <Subtitle>Все карточки под рукой. Проверь, что выпало.</Subtitle>
        {cards.length > 0 ? <CardGrid cards={cards} /> : <EmptyState>Карточек пока нет</EmptyState>}
      </Container>
    </Screen>
  )
}
