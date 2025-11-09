import styled from 'styled-components'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  width: 100%;
`

const CardItem = styled.div`
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.25), rgba(0, 0, 0, 0.25));
  min-height: 180px;
  display: flex;
  align-items: flex-end;
  padding: 16px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  text-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
  background-size: cover;
  background-position: center;
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

export default function CardGrid({ cards }) {
  return (
    <Grid>
      {cards.map((card) => {
        const style = card.image_url
          ? { backgroundImage: `linear-gradient(120deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45)), url(${card.image_url})` }
          : undefined
        return (
          <CardItem key={card.id || `${card.title}-${card.rarity}`} style={style}>
            <Quantity>{card.quantity}×</Quantity>
            <Title>{card.title}</Title>
          </CardItem>
        )
      })}
    </Grid>
  )
}
