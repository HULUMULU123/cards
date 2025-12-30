import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'

import giftPack from '../assets/img/card_pocket.png'
import starIcon from '../assets/icons/star.svg'
import CardOpenModal from '../components/CardOpenModal'
import BalancePill from '../components/BalancePill'
import ReferralBadge from '../components/ReferralBadge'
import useAuthStore from '../store/useAuthStore'
import { Card } from '../types/entities'

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
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 22px 12px;
  border-radius: 22px;
  width: 90%;
  border: 1.2px solid #6d5c82;
  background: rgb(47, 15, 76);
  overflow: hidden;
  isolation: isolate;
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    filter: blur(55px);
    opacity: 0.75;
    pointer-events: none;
  }
  &::before {
    top: -130px;
    right: -110px;
    background: rgba(155, 33, 255, 1);
  }
  &::after {
    bottom: -200px;
    left: -110px;
    background: rgba(155, 33, 255, 0.7);
  }
  & > * {
    z-index: 1;
    position: relative;
  }
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

const OpenButton = styled.button`
  min-width: 65%;
  max-width: 280px;
  padding: 10px;
  border: none;
  border-radius: 30px;
  background: linear-gradient(135deg, #ffdb4d 0%, #ff8a00 100%);
  color: #2d1f07;
  font-weight: 800;
  font-size: 22px;
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.35);
`

const SecondaryButton = styled.button`
  width: 48%;
  max-width: 280px;
  padding: 16px;
  border: none;
  border-radius: 20px;
  background: rgb(50, 16, 85);
  font-weight: 500;
  font-size: 18px;
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.35);
  color: #fff;
  border: 1.2px solid #5f5867;
`

const ActionsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  width: 100%;
  max-width: 420px;
`

const PriceToast = styled.div<{ $visible: boolean }>`
  position: fixed;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%) translateY(${({ $visible }) => ($visible ? '0' : '16px')});
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.35s ease, transform 0.35s ease;
  pointer-events: none;
  z-index: 1000;
`

const ToastBody = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(20, 11, 32, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  color: #fff;
`

const ToastText = styled.span`
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
`

const ToastPrice = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 219, 77, 0.25), rgba(255, 138, 0, 0.25));
  color: #ffe7b3;
  font-weight: 800;
  font-size: 14px;
`

export default function GiftCardsScreen() {
  const navigate = useNavigate()
  const { profile, openCardFromGroup, fetchProfile, error, setError } = useAuthStore()
  const [openedCard, setOpenedCard] = useState<Card | null>(null)
  const [opening, setOpening] = useState(false)
  const [showPriceHint, setShowPriceHint] = useState(false)
  const hintTimeoutRef = useRef<number | null>(null)

  const price = profile?.card_open_price ?? 0
  const balance = profile?.stars_balance ?? 0
  const tgBalance = profile?.telegram_stars_balance ?? balance
  const canAfford = balance >= price
  const buttonLabel = opening ? 'Открываем...' : price > 0 ? 'Открыть' : 'Открыть'

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (!showPriceHint) return
    if (hintTimeoutRef.current) {
      window.clearTimeout(hintTimeoutRef.current)
    }
    hintTimeoutRef.current = window.setTimeout(() => setShowPriceHint(false), 2400)
    return () => {
      if (hintTimeoutRef.current) {
        window.clearTimeout(hintTimeoutRef.current)
      }
    }
  }, [showPriceHint])

  const handleReferralClick = () => {
    navigate('/profile')
  }

  const handleOpenCard = async () => {
    if (opening) return
    if (!canAfford) {
      setError(null)
      setShowPriceHint(true)
      return
    }
    setError(null)
    setOpening(true)
    try {
      const card = await openCardFromGroup()
      if (card) {
        setOpenedCard(card)
      }
    } catch (openError) {
      const message = openError instanceof Error ? openError.message : 'Не удалось открыть карточку'
      setError(message)
      if (message.toLowerCase().includes('недостаточно') && price > 0) {
        setShowPriceHint(true)
      }
    } finally {
      setOpening(false)
    }
  }

  return (
    <Screen>
      <Header>
        <ReferralBadge link={profile?.referral_link} onCopy={handleReferralClick} />
        <BalancePill value={tgBalance}  />
      </Header>

      {error && <CardSubtitle style={{ color: '#ffbcbc' }}>{error}</CardSubtitle>}

      

      <CardContainer>
        <CardWrapper>
          <CardImage src={giftPack} alt="pack" />
          <CardTitle>Откройте набор карт</CardTitle>
          <CardSubtitle>Каждая группа имеет свой шанс выпадения</CardSubtitle>
          <OpenButton onClick={handleOpenCard} disabled={opening}>
            {canAfford ? buttonLabel : 'Недостаточно звёзд'}
          </OpenButton>
          {!canAfford && price > 0 && (
            <CardSubtitle>Пополните баланс, чтобы открыть карточку</CardSubtitle>
          )}
        </CardWrapper>
      </CardContainer>

      <ActionsRow>
        <SecondaryButton onClick={() => navigate('/collection')}>Коллекция</SecondaryButton>
        <SecondaryButton onClick={() => navigate('/withdraw')}>Вывод</SecondaryButton>
      </ActionsRow>

      {openedCard && <CardOpenModal card={openedCard} onClose={() => setOpenedCard(null)} />}

      <PriceToast $visible={showPriceHint} aria-hidden={!showPriceHint}>
        <ToastBody>
          <ToastText>Стоимость открытия</ToastText>
          <ToastPrice>
            {price}
            <img src={starIcon} alt="star" width={14} height={14} />
          </ToastPrice>
        </ToastBody>
      </PriceToast>
    </Screen>
  )
}
