import { useMemo } from 'react'
import styled from 'styled-components'

import useAuthStore from '../store/useAuthStore'

const Screen = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  text-align: center;
`

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.18), rgba(86, 0, 212, 0.45));
  border-radius: ${(props) => props.theme.radii.xl};
  padding: 24px;
  box-shadow: 0 28px 48px rgba(35, 0, 63, 0.45);
  backdrop-filter: blur(12px);
`

const Avatar = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 32px;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.45);
  margin: 0 auto 12px;
  background: url('https://placehold.co/200x200/ff00aa/ffffff?text=Avatar') center/cover;
`

const Heading = styled.h1`
  font-size: 32px;
  margin: 0 0 12px;
  font-weight: 800;
  letter-spacing: 1px;
`

const Username = styled.div`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 16px;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
`

const StarsHighlight = styled.div`
  background: rgba(243, 201, 63, 0.1);
  border-radius: 24px;
  padding: 16px;
  font-size: 18px;
  font-weight: 700;
  color: #ffe889;
`

const ReferralBlock = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ReferralLink = styled.div`
  background: rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 12px 16px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  word-break: break-all;
`

const CopyButton = styled.button`
  background: linear-gradient(135deg, #ffdb4d, #ff8a00);
  color: #32043e;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  padding: 10px 14px;
  cursor: pointer;
`

const SecondaryText = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
  font-size: 14px;
`

export default function ProfileScreen() {
  const profile = useAuthStore((state) => state.profile)

  const formattedName = useMemo(() => {
    if (!profile) return 'Профиль'
    const { first_name: firstName, last_name: lastName } = profile.user || {}
    return `${firstName || ''} ${lastName || ''}`.trim() || 'Профиль'
  }, [profile])

  const handleCopy = () => {
    if (!profile?.referral_link) return
    navigator.clipboard.writeText(profile.referral_link)
  }

  return (
    <Screen>
      <Heading>Профиль</Heading>
      <Card>
        <Avatar />
        <Username>@{profile?.user?.username || 'tg_demo'}</Username>
        <h2 style={{ margin: '0 0 12px', fontSize: '24px' }}>{formattedName}</h2>
        <StatsGrid>
          <StatCard>
            <span>Собрано карт</span>
            <span style={{ fontSize: '28px' }}>{profile?.cards_opened ?? 0}</span>
          </StatCard>
          <StatCard>
            <span>В коллекции</span>
            <span style={{ fontSize: '28px' }}>{profile?.cards_total ?? 0}</span>
          </StatCard>
          <StatCard>
            <span>Приглашено</span>
            <span style={{ fontSize: '28px' }}>{profile?.referrals_count ?? 0}</span>
          </StatCard>
        </StatsGrid>
        <StarsHighlight>
          Можно вывести — {profile?.stars_withdrawable ?? 0} ⭐
        </StarsHighlight>
      </Card>

      <ReferralBlock>
        <h3 style={{ margin: 0 }}>Referral Link</h3>
        <ReferralLink>
          <span>{profile?.referral_link || 'https://t.me/example?start=ref'}</span>
          <CopyButton onClick={handleCopy}>COPY</CopyButton>
        </ReferralLink>
        <SecondaryText>
          Приглашай друзей по этой ссылке и получай бесплатные открытия!
        </SecondaryText>
      </ReferralBlock>
    </Screen>
  )
}
