import os
from dotenv import load_dotenv
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CommandHandler, ContextTypes

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
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


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
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


def main() -> None:
    if not BOT_TOKEN:
        raise RuntimeError("BOT_TOKEN is required in environment variables")

    application = Application.builder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.run_polling()


if __name__ == "__main__":
    main()
