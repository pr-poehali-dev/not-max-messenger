"""
Отправляет код подтверждения пользователю в Telegram.
Пользователь должен сначала написать /start боту, чтобы получить свой telegram_id.
"""
import json
import os
import random
import string
import urllib.request
import urllib.parse
import psycopg2
from datetime import datetime, timedelta, timezone


def handler(event: dict, context) -> dict:
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
        telegram_id = body.get("telegram_id")

        if not telegram_id:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "Укажите telegram_id"}),
            }

        telegram_id = int(telegram_id)

        # Генерируем 6-значный код
        code = "".join(random.choices(string.digits, k=6))
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

        # Сохраняем в БД
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        schema = "t_p82205670_not_max_messenger"

        # Инвалидируем старые коды
        cur.execute(
            f"UPDATE {schema}.auth_codes SET used = true WHERE telegram_id = %s AND used = false",
            (telegram_id,)
        )

        # Создаём новый код
        cur.execute(
            f"INSERT INTO {schema}.auth_codes (telegram_id, code, expires_at) VALUES (%s, %s, %s)",
            (telegram_id, code, expires_at)
        )
        conn.commit()
        cur.close()
        conn.close()

        # Отправляем через Telegram Bot API
        bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
        message = (
            f"🔐 Ваш код для входа в Не MAX:\n\n"
            f"<b>{code}</b>\n\n"
            f"Код действует 10 минут. Никому не сообщайте его."
        )

        tg_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        tg_data = urllib.parse.urlencode({
            "chat_id": telegram_id,
            "text": message,
            "parse_mode": "HTML",
        }).encode()

        req = urllib.request.Request(tg_url, data=tg_data, method="POST")
        with urllib.request.urlopen(req, timeout=10) as resp:
            tg_result = json.loads(resp.read())

        if not tg_result.get("ok"):
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({
                    "error": "Не удалось отправить сообщение. Убедитесь что вы написали /start боту."
                }),
            }

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"success": True, "message": "Код отправлен в Telegram"}),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)}),
        }
