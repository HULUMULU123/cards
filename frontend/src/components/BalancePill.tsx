import styled from 'styled-components'
import starIcon from '../assets/icons/star.svg'

const BalanceWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: ${(props) => props.theme.radii.sm};
  background: rgb(79, 29, 119);
  color: #fff;
  font-weight: 800;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
  border: 1.2px solid #5f5867;
`

const StarIcon = styled.img`
  width: 18px;
  height: 18px;
`

interface BalancePillProps {
  value?: number
  label?: string
}

export default function BalancePill({ value = 0, label = 'звёзд' }: BalancePillProps) {
  return (
    <BalanceWrapper>
      <StarIcon src={starIcon} alt="star" />
      {value} {label}
    </BalanceWrapper>
  )
}
