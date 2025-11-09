import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import useAuthStore from '../store/useAuthStore'

const Screen = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`

const Heading = styled.h1`
  font-size: 32px;
  margin: 0;
`

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  background: linear-gradient(155deg, rgba(91, 12, 220, 0.8), rgba(30, 0, 60, 0.65));
  border-radius: ${(props) => props.theme.radii.xl};
  padding: 28px 24px;
  box-shadow: 0 32px 48px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  text-align: center;
`

const Balance = styled.div`
  font-size: 44px;
  font-weight: 800;
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: #ffe889;
`

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const InputGroup = styled.div`
  background: rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
`

const Label = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 14px;
`

const Input = styled.input`
  background: rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  color: #fff;
  font-size: 16px;
`

const QuickButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
`

const QuickButton = styled.button`
  background: rgba(255, 255, 255, 0.14);
  border: none;
  border-radius: 12px;
  color: #fff;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #ffdb4d, #ff8a00);
  color: #32043e;
  border: none;
  border-radius: 16px;
  padding: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 18px 40px rgba(255, 157, 0, 0.35);
`

const History = styled.div`
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: ${(props) => props.theme.radii.lg};
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
`

const ErrorText = styled.span`
  color: #ff96a5;
  font-size: 14px;
`

const StarsButton = styled.button`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffe889;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
`

export default function WithdrawScreen() {
  const profile = useAuthStore((state) => state.profile)
  const loading = useAuthStore((state) => state.loading)
  const error = useAuthStore((state) => state.error)
  const submitWithdraw = useAuthStore((state) => state.submitWithdraw)
  const openStarsInvoice = useAuthStore((state) => state.openStarsInvoice)
  const withdrawHistory = useAuthStore((state) => state.withdrawHistory)
  const fetchWithdrawHistory = useAuthStore((state) => state.fetchWithdrawHistory)

  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  const balanceText = useMemo(() => profile?.stars_withdrawable ?? 0, [profile])

  useEffect(() => {
    fetchWithdrawHistory()
  }, [fetchWithdrawHistory])

  const handleQuickSelect = (value) => {
    if (value === 'all') {
      setAmount(String(balanceText))
    } else {
      setAmount(String((Number(amount) || 0) + value))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!amount || Number(amount) <= 0) {
      return
    }
    try {
      await submitWithdraw({
        stars_amount: Number(amount),
        recipient_username: recipient.replace('@', ''),
      })
      setAmount('')
      setRecipient('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleBuyStars = async () => {
    try {
      await openStarsInvoice(100)
    } catch (err) {
      console.error('Не удалось открыть платёж', err)
    }
  }

  return (
    <Screen>
      <Heading>Вывести</Heading>
      <Card>
        <Balance>
          {balanceText}
          <span style={{ fontSize: '20px' }}>⭐</span>
        </Balance>
        <span style={{ color: '#d5b8ff' }}>доступно к выводу</span>

        <StarsButton type="button" onClick={handleBuyStars}>
          Купить звёзды
        </StarsButton>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Сколько вывести</Label>
            <Input
              type="number"
              placeholder="Введите количество"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              min={1}
            />
            <QuickButtons>
              {[50, 100, 500].map((value) => (
                <QuickButton type="button" key={value} onClick={() => handleQuickSelect(value)}>
                  +{value}
                </QuickButton>
              ))}
              <QuickButton type="button" onClick={() => handleQuickSelect('all')}>
                Всё
              </QuickButton>
            </QuickButtons>
          </InputGroup>

          <InputGroup>
            <Label>Кому</Label>
            <Input
              placeholder="@username получателя"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              required
            />
          </InputGroup>

          {error && <ErrorText>{error}</ErrorText>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Отправка…' : 'Вывести'}
          </SubmitButton>
        </Form>
      </Card>

      <History>
        <h3 style={{ margin: 0 }}>История выводов</h3>
        {withdrawHistory.map((item) => (
          <HistoryItem key={item.id}>
            <span> @{item.recipient_username}</span>
            <span>{item.stars_amount} ⭐</span>
          </HistoryItem>
        ))}
        {withdrawHistory.length === 0 && <span style={{ color: '#b79cff' }}>История пока пуста</span>}
      </History>
    </Screen>
  )
}
