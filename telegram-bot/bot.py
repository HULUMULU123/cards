import asyncio
import json
import logging
import os
from typing import Any
from urllib import error, request

from dotenv import load_dotenv
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CommandHandler, ContextTypes

load_dotenv()

logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("BOT_TOKEN")
BOT_USERNAME = os.getenv("BOT_USERNAME", "Pizza123421_bot")
FREE_OPEN_URL = os.getenv(
    "FREE_OPEN_URL",
    "https://t.me/Pizza123421_bot?startapp=open_pack",
)
ARTICLE_URL = "https://telegra.ph/Kak-zarabotat-zvezdy-v-igre-Gift-Cards-01-14-3"
SUPPORT_URL = "https://t.me/AlekseyfrolovDm"
START_MESSAGE = (
    "Добро пожаловать в Gift Cards!\n\n"
    "✨ Открывай карточки, собирай коллекции и получай награды.\n"
    "🎁 Бесплатное открытие доступно в приложении.\n\n"
    "Если нужна помощь или инструкция — используй кнопки ниже."
)
REFERRAL_API_BASE_URL = os.getenv(
    "REFERRAL_API_BASE_URL",
    "https://giftcardstg.ru/",
)
REFERRAL_API_KEY = os.getenv("REFERRAL_API_KEY", os.getenv("BALANCE_API_KEY", "super_secret_key"))
DEFAULT_REFERRAL_REWARD = int(os.getenv("DEFAULT_REFERRAL_REWARD", "10"))


def _http_get_json_or_text(url: str) -> Any | None:
    headers = {"Accept": "application/json"}
    if REFERRAL_API_KEY:
        headers["X-API-Key"] = REFERRAL_API_KEY

    req = request.Request(
        url,
        headers=headers,
        method="GET",
    )
    try:
        with request.urlopen(req, timeout=5) as response:
            if response.status != 200:
                return None
            raw = response.read().decode("utf-8").strip()
    except (error.URLError, TimeoutError, ValueError) as exc:
        logger.warning("Failed GET %s: %s", url, exc)
        return None

    if not raw:
        return None

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def _extract_str(payload: Any, *keys: str) -> str | None:
    if isinstance(payload, str):
        return payload.strip() or None
    if isinstance(payload, dict):
        for key in keys:
            value = payload.get(key)
            if value is not None and str(value).strip():
                return str(value).strip()
    return None


def _extract_int(payload: Any, *keys: str) -> int | None:
    if isinstance(payload, int):
        return payload
    if isinstance(payload, str):
        try:
            return int(payload.strip())
        except (ValueError, TypeError):
            return None
    if isinstance(payload, dict):
        for key in keys:
            try:
                value = payload.get(key)
                if value is not None:
                    return int(value)
            except (ValueError, TypeError):
                continue
    return None


def _fetch_referral_data_sync(user_id: int) -> dict[str, Any] | None:
    if not REFERRAL_API_BASE_URL or not user_id:
        return None

    base = REFERRAL_API_BASE_URL.rstrip("/")
    payload = _http_get_json_or_text(f"{base}/referrals/user/{user_id}")
    if not isinstance(payload, dict):
        return None

    referral_link = _extract_str(payload, "referral_link", "link", "url")
    referrals_count = _extract_int(payload, "referral_count", "referrals_count", "count")
    reward = payload.get("reward") if isinstance(payload.get("reward"), dict) else {}
    reward_amount = reward.get("amount")
    reward_currency = str(reward.get("currency") or "").strip().lower()

    try:
        reward_amount_value = float(reward_amount) if reward_amount is not None else None
    except (ValueError, TypeError):
        reward_amount_value = None

    return {
        "referral_link": (referral_link or "").strip(),
        "referrals_count": referrals_count if referrals_count is not None else 0,
        "reward_amount": reward_amount_value,
        "reward_currency": reward_currency,
    }


async def fetch_referral_data(user_id: int) -> dict[str, Any] | None:
    return await asyncio.to_thread(_fetch_referral_data_sync, user_id)


def build_start_message(user_id: int, referral_data: dict[str, Any] | None) -> str:
    reward_amount: float | int = DEFAULT_REFERRAL_REWARD
    reward_currency = "stars"
    referrals_count = 0
    referral_link = ""

    if referral_data:
        reward_amount = referral_data.get("reward_amount", reward_amount)
        reward_currency = (referral_data.get("reward_currency") or reward_currency).lower()
        referrals_count = referral_data.get("referrals_count", referrals_count)
        referral_link = referral_data.get("referral_link") or referral_link

    if isinstance(reward_amount, float) and reward_amount.is_integer():
        reward_amount_text = str(int(reward_amount))
    else:
        reward_amount_text = str(reward_amount)

    if reward_currency == "rub":
        reward_line = f"Получай +{reward_amount_text} ₽ за каждого приглашенного друга!"
    else:
        reward_line = f"Получай +{reward_amount_text} ⭐️ за каждого приглашенного друга!"

    referral_link_text = referral_link or "Не удалось получить реферальную ссылку. Попробуйте позже."

    return (
        f"{reward_line}\n\n"
        "📎 Твоя реферальная ссылка:\n"
        f"{referral_link_text}\n\n"
        "🎉 Приглашай по этой ссылке своих друзей, отправляй её во все чаты и "
        "зарабатывай Звёзды для открытия карточек в Gift Cards!\n\n"
        f"👤 Количество ваших рефералов: {referrals_count}"
    )


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    user_id = user.id if user else 0
    referral_data = await fetch_referral_data(user_id) if user_id else None

    keyboard = [
        [
            InlineKeyboardButton(
                "Как заработать звезды в игре Gift Cards?",
                url=ARTICLE_URL,
            )
        ],
        [InlineKeyboardButton("Поддержка (@AlekseyfrolovDm)", url=SUPPORT_URL)],
        [InlineKeyboardButton("Бесплатное открытие", url=FREE_OPEN_URL)],
    ]
    await update.message.reply_text(
        START_MESSAGE,
        reply_markup=InlineKeyboardMarkup(keyboard),
    )
    await update.message.reply_text(build_start_message(user_id, referral_data))


def main() -> None:
    if not BOT_TOKEN:
        raise RuntimeError("BOT_TOKEN is required in environment variables")

    application = Application.builder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.run_polling()


if __name__ == "__main__":
    main()
