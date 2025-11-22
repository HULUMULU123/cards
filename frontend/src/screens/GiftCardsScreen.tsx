import styled from 'styled-components'

import giftPack from '../assets/img/card_pocket.png'
import starIcon from '../assets/icons/star.svg'
import linkIcon from '../assets/icons/link.svg'

const Screen = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  width: 100%;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 480px;
`

const ReferralButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.1);
  color: ${(props) => props.theme.colors.textPrimary};
  border: none;
  border-radius: ${(props) => props.theme.radii.md};
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
`

const LinkIcon = styled.img`
  width: 18px;
  height: 18px;
`

const Balance = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: ${(props) => props.theme.radii.lg};
  background: linear-gradient(102deg, #f9f2b3 0%, #f5c544 100%);
  color: #000;
  font-weight: 800;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
`

const StarIcon = styled.img`
  width: 18px;
  height: 18px;
`

const CardContainer = styled.div`
  width: 100%;
  max-width: 420px;
  border-radius: ${(props) => props.theme.radii.xl};
  padding: 24px 20px 28px;

  box-shadow: 0 28px 48px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
`

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background:rgb(50,16,85);
  padding: 10px;
  border-radius: 20px;
`

const CardImageWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const CardImage = styled.img`
  width: 80%;
  max-width: 320px;
  filter: drop-shadow(0 24px 32px rgba(0, 0, 0, 0.45));
`

const CardTitle = styled.h2`
  margin: 0;
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: 24px;
  font-weight: 800;
  text-align: center;
`

const CardSubtitle = styled.p`
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 15px;
  text-align: center;
`

const Price = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: ${(props) => props.theme.radii.lg};
  background: rgba(255, 255, 255, 0.08);
  color: ${(props) => props.theme.colors.textPrimary};
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
`

const OpenButton = styled.button`
  width: 48%;
  max-width: 280px;
  padding: 16px;
  border: none;
  border-radius: 20px;
  background:rgb(50,16,85);
  color: #2d1f07;
  font-weight: 800;
  font-size: 16px;
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.35);
`

const Footer = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const NavigationButton = styled.button`
  padding: 14px;
  border: none;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  color: ${(props) => props.theme.colors.textPrimary};
  font-weight: 700;
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.28);
`

const InviteHint = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 14px;
  text-align: center;
`

export default function GiftCardsScreen() {
  return (
    <Screen>
      <Header>
        <ReferralButton>
          <LinkIcon src={linkIcon} alt="Referral" />
          REFERRAL
        </ReferralButton>
        <Balance>
          1000
          <StarIcon src={starIcon} alt="Stars" />
        </Balance>
      </Header>

      <CardContainer>
        <CardWrapper>
        <CardImageWrapper>
          <CardImage src={giftPack} alt="Gift cards pack" />
        </CardImageWrapper>
        <CardTitle>AL Gift cards</CardTitle>
        <CardSubtitle>Стоимость одного открытия - 15 <StarIcon src={starIcon} alt='Stars'/></CardSubtitle>
        <Price>
          15
          <StarIcon src={starIcon} alt="Stars" />
        </Price>
        </CardWrapper>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <OpenButton>Открыть</OpenButton>
          <OpenButton>Коллекция</OpenButton>
        </div>
      </CardContainer>

      <Footer>
        <NavigationButton>Коллекция</NavigationButton>
        <InviteHint>Пригласи друга и получи бесплатное открытие!</InviteHint>
      </Footer>
    </Screen>
  )
}
