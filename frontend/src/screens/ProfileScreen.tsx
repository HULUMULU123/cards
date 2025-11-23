import { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import useAuthStore from '../store/useAuthStore'

import star from '../assets/icons/star.svg';
import reffreal from '../assets/icons/link.svg'
const Screen = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  text-align: center;
`

const Card = styled.div<{ $group?: string }>`
  width: 100%;
  max-width: 480px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.18), rgba(86, 0, 212, 0.45));
  border-radius: ${(props) => props.theme.radii.lg};
  padding: 10px;
  backdrop-filter: blur(12px);
  grid-area: ${(props) => props.$group || 'auto'};
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1.2px solid #5f5867;

  
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
  font-size: 50px;
  margin: 0 0 12px;
  font-weight: 600;
  letter-spacing: 1px;
`

const Username = styled.div`
  font-size: 16px;
  color: rgb(204,	186,	207);
  font-weight: 300;
`

const ReferralBlock = styled.div`
  width: 100%;
  padding: 10px 20px;
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
  border: 1.2px solid #5f5867;
`

const CopyButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
 
  border-radius: 12px;
  font-weight: 500;
  padding: 3px 15px;
  cursor: pointer;
  font-size: 12px;
  margin-left: auto;
`

const SecondaryText = styled.p`
  color: rgb(204,	186,	207);
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

const ProgressWrapper = styled.div`
  width: 80%;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  margin-top: 6px;
  overflow: hidden;
`

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  background: linear-gradient(90deg, #ffdb4d, #ff8a00);
  width: ${(props) => props.$percent}%;
  transition: width 0.4s ease;
  border-radius: 8px;
`

export default function ProfileScreen() {
  const profile = useAuthStore((state) => state.profile)
  const fetchProfile = useAuthStore((state) => state.fetchProfile)


  

  const balanceText = useMemo(() => profile?.stars_withdrawable ?? 0, [profile])
  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const formattedName = useMemo(() => {
    if (!profile) return 'Профиль'
    const { first_name: firstName, last_name: lastName } = profile.user || {}
    return `${firstName || ''} ${lastName || ''}`.trim() || 'Профиль'
  }, [profile])

  const handleCopy = () => {
    if (!profile?.referral_link) return
    void navigator.clipboard.writeText(profile.referral_link)
  }

  const opened = profile?.cards_opened ?? 0
  const total = profile?.cards_total ?? 0
  const percent = total > 0 ? Math.min(100, Math.round((opened / total) * 100)) : 0

  return (
    <Screen>
      <Heading>Профиль</Heading>

      <ProfileGrid>
        <Card $group="a">
          <Avatar ><img src={profile?.user?.photo_url} /></Avatar>
          <h2 style={{ margin: '0 0 0', fontSize: '24px', fontWeight: '600' }}>{formattedName}</h2>
          <Username>@{profile?.user?.username || 'tg_demo'}</Username>
        </Card>

        <Card $group="b">
          <p
            style={{
              fontSize: '38px',
              margin: '0',
              padding: '0',
              fontWeight: '600',
            }}
          >
            {opened}/{total}
          </p>
          <span style={{ fontSize: '12px', color: 'rgb(204,	186,	207)' }}>
            Собрано карт
          </span>

          <ProgressWrapper>
            <ProgressFill $percent={percent} />
          </ProgressWrapper>
        </Card>

        <Card $group="c">
          <span
            style={{
              fontSize: '38px',
              margin: '0',
              padding: '0',
              fontWeight: '600',
            }}
          >
            {profile?.cards_total ?? 0}
          </span>
          <span style={{ fontSize: '12px', color: 'rgb(204,	186,	207)', }}>
            В коллекции
          </span>
        </Card>
      </ProfileGrid>

      <BalanceBlock>
        <p style={{ margin: 'auto', fontSize: '30px', fontWeight: '500' }}>Можно вывести - {balanceText}  <img style={{width: '25px', height: '25px'}}src={star}/></p>
      </BalanceBlock>

      <Card>
        <ReferralBlock>
          <div style={{ display: 'flex' }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
              <img src={reffreal} style={{width:'15px', height: '15px', filter: 'brightness(0) invert(1)'}}/>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>REFERRAL LINK</h3>
            </div>
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
