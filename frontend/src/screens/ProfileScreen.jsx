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
  max-width: 480px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.18), rgba(86, 0, 212, 0.45));
  border-radius: ${(props) => props.theme.radii.xl};
  padding: 10px;
  backdrop-filter: blur(12px);
  grid-area: ${(props) => props.$group || 'auto'};
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Avatar = styled.div`
  width: 170px;
  height: 170px;
  border-radius: 40px;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.45);
  margin: 0 auto 10px;
  background: url('https://placehold.co/200x200/ff00aa/ffffff?text=Avatar') center/cover;
`

const Heading = styled.h1`
  font-size: 40px;
  margin: 0 0 12px;
  font-weight: 800;
  letter-spacing: 1px;
`

const Username = styled.div`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textSecondary};
`

const ReferralBlock = styled.div`
  
  width: 100%;
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
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: none;
  width: 50px;
  border-radius: 12px;
  font-weight: 700;
  padding: 5px 7px;
  cursor: pointer;
  font-size: 8px;
  margin-left: auto;
`

const SecondaryText = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
  font-size: 14px;
  width: 70%;
`

const ProfileGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-areas:
    'a a a b b'
    'a a a b b'
    'a a a c c'
    'a a a c c';
  gap: 10px;

  max-height: 60vh;
  overflow-y: auto;
  align-items: start;
  justify-content: center;
`

const BalanceBlock = styled.div`
  width: 100%;
  display: flex;
`

// ==== Прогресс бар ====
const ProgressWrapper = styled.div`
  width: 80%;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  margin-top: 6px;
  overflow: hidden;
`

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #ffdb4d, #ff8a00);
  width: ${(props) => props.$percent}%;
  transition: width 0.4s ease;
  border-radius: 8px;
`

// =======================

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

  // данные для прогресс-бара
  const opened = profile?.cards_opened ?? 0
  const total = 417
  const percent = Math.min(100, Math.round((opened / total) * 100))

  return (
    <Screen>
      <Heading>Профиль</Heading>

      <ProfileGrid>
        <Card $group="a">
          <Avatar />
          <h2 style={{ margin: '0 0 0', fontSize: '24px' }}>{formattedName}</h2>
          <Username>@{profile?.user?.username || 'tg_demo'}</Username>
        </Card>

        <Card $group="b">
          <p
            style={{
              fontSize: '32px',
              margin: '0',
              padding: '0',
              fontWeight: '700',
            }}
          >
            {opened}/{total}
          </p>
          <span style={{ fontSize: '12px', color: 'rgba(193,169,209)' }}>
            Собрано карт
          </span>

          <ProgressWrapper>
            <ProgressFill $percent={percent} />
          </ProgressWrapper>

          
        </Card>

        <Card $group="c">
          <span
            style={{
              fontSize: '32px',
              margin: '0',
              padding: '0',
              fontWeight: '700',
            }}
          >
            {profile?.cards_total ?? 0}
          </span>
          <span style={{ fontSize: '12px', color: 'rgba(193,169,209)' }}>
            В коллекции
          </span>
        </Card>
      </ProfileGrid>
      
      <BalanceBlock>
        <p style={{margin: 'auto', fontSize: '25px'}}>Можно вывести - 300  ⭐</p>
      </BalanceBlock>

      <Card>
        <ReferralBlock>
          <div style={{display: "flex"}}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '300' }}>REFERRAL LINK</h3>
          <CopyButton onClick={handleCopy}>COPY</CopyButton>
          </div>
          <ReferralLink>
            <span>{profile?.referral_link || 'https://t.me/example?start=ref'}</span>
            
          </ReferralLink>
        </ReferralBlock>
      </Card>
      <SecondaryText>
        Приглашай друзей по этой ссылке и получай бесплатные открытия!
      </SecondaryText>
    </Screen>
  )
}
