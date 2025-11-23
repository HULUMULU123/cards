import styled from 'styled-components'
import linkIcon from '../assets/icons/link.svg'

const ReferralButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgb(66, 24, 100);
  color: ${(props) => props.theme.colors.textPrimary};
  border: none;
  border-radius: ${(props) => props.theme.radii.sm};
  font-weight: 500;
  letter-spacing: 0.05em;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  border: 1.2px solid #5f5867;
`

const LinkIcon = styled.img`
  width: 13px;
  height: 13px;
  filter: brightness(0) invert(1);
`

interface ReferralBadgeProps {
  link?: string
  onCopy?: () => void
}

export default function ReferralBadge({ link, onCopy }: ReferralBadgeProps) {
  return (
    <ReferralButton onClick={onCopy} disabled={!link}>
      <LinkIcon src={linkIcon} alt="link" />
      {link || 'Ссылка недоступна'}
    </ReferralButton>
  )
}
