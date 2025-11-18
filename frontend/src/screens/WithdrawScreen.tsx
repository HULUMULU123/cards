import { FormEvent, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import useAuthStore from '../store/useAuthStore'

import star from '../assets/icons/star.svg'
const Screen = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`;

const Heading = styled.h1`
  font-size: 45px;
  margin: 0;
`;

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  background: #150320;
  background: linear-gradient(
    68deg,
    rgba(21, 3, 32, 1) 37%,
    rgba(88, 36, 117, 1) 100%
  );
  border: 1px solid #3a3342;
  border-radius: ${(props) => props.theme.radii.xl};
  padding: 28px 24px;
  box-shadow: 0 32px 48px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  text-align: center;
`;

const Balance = styled.div`
  display: flex;
  align-items: center;

  font-size: 44px;
  font-weight: 600;
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: #fff;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
`;

const Label = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 22px;
`;

const Input = styled.input`
  background: #150320;
  background: linear-gradient(
    68deg,
    rgba(21, 3, 32, 1) 57%,
    rgba(88, 36, 117, 0.3) 100%
  );
  border: 1px solid #3a3342;

  border-radius: 12px;
  padding: 18px 16px;
  color: #fff;
  font-size: 16px;
`;

const CountInput = styled.input`
  background: transparent;
  border: none;
  color: #fff;
  font-size: 16px;
`;

const InputDiv = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  background: #150320;
  background: linear-gradient(
    68deg,
    rgba(21, 3, 32, 1) 57%,
    rgba(88, 36, 117, 0.3) 100%
  );
  border: 1px solid #3a3342;

  border-radius: 12px;
  padding: 18px 16px;`

const QuickButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
`;

const QuickButton = styled.button`
  background: #150320;
  background: linear-gradient(
    68deg,
    rgba(21, 3, 32, 1) 57%,
    rgba(88, 36, 117, 0.3) 100%
  );
  border: 1px solid #3a3342;
  border-radius: 12px;
  color: #fff;
  padding: 12px;
  font-weight: 400;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const SubmitButton = styled.button`
  margin: auto;
  width: 50%;
  background: linear-gradient(90deg, #ffdb4d, #ff8800);
  color: #32043e;
  border: none;
  border-radius: 16px;
  padding: 16px;
  font-size: 28px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 18px 40px rgba(255, 157, 0, 0.35);
`;

const History = styled.div`
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: ${(props) => props.theme.radii.lg};
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
`;

const ErrorText = styled.span`
  color: #ff96a5;
  font-size: 14px;
`;

const StarsButton = styled.button`
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.05)
  );
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffe889;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
`;

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
    void fetchWithdrawHistory()
  }, [fetchWithdrawHistory])

  const handleQuickSelect = (value: number | 'all') => {
    if (value === 'all') {
      setAmount(String(balanceText))
    } else {
      setAmount(String((Number(amount) || 0) + value))
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      <>
        <Card>
          <Balance>
            {balanceText}
            <span
              style={{
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
              }}
            >
              <img src={star} style={{width:'20px', height:'20px'}}/>
            </span>
          </Balance>
          <span style={{ color: '#b1a1be', fontWeight: '500' }}>
            доступно к выводу
          </span>
        </Card>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Сколько вывести</Label>
            <InputDiv style={{width:'100%', }}>
              <img src={star} style={{width:'20px', height:'20px'}}/>
              <span style={{height: '35px', width:'2px', borderRadius:'5px', background: '#3a3342'}}></span>
            <CountInput
              type="number"
              placeholder="Введите количество"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              min={1}
            />
            </InputDiv>
            <QuickButtons>
              {[50, 100, 500].map((value) => (
                <QuickButton
                  type="button"
                  key={value}
                  onClick={() => handleQuickSelect(value)}
                >
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
            {loading ? 'Отправка…' : 'Выввод'}
          </SubmitButton>
        </Form>
      </>

      <History>
        <h3 style={{ margin: 0 }}>История выводов</h3>
        {withdrawHistory.map((item) => (
          <HistoryItem key={item.id}>
            <span> @{item.recipient_username}</span>
            <span>{item.stars_amount} <img src={star} style={{width: '20px', height: '20px'}}/></span>
          </HistoryItem>
        ))}
        {withdrawHistory.length === 0 && (
          <span style={{ color: '#b79cff' }}>История пока пуста</span>
        )}
      </History>

      {/* <StarsButton type="button" onClick={handleBuyStars}>
        Купить звёзды через Telegram
      </StarsButton> */}
    </Screen>
  )
}
