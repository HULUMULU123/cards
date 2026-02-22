# Telegram Bot

## Setup

1. Create `.env` based on `.env.example`.
2. Install deps:

```bash
pip install -r requirements.txt
```

3. Run:

```bash
python bot.py
```

## Notes
- `/start` sends a referral message and requests referral data (`link`, `count`, reward) from an external API.
- `FREE_OPEN_URL` should point to your Mini App deep link that opens a pack.
- Configure `REFERRAL_API_BASE_URL` and `REFERRAL_API_KEY` in `.env` for referral API access.
