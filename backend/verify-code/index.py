"""
Проверяет код подтверждения и возвращает данные пользователя.
Если пользователь новый — возвращает isNew: true.
"""
import json
import os
import secrets
import psycopg2
from datetime import datetime, timezone


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
        code = body.get("code", "").strip()

        if not telegram_id or not code:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "Укажите telegram_id и code"}),
            }

        telegram_id = int(telegram_id)

        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        schema = "t_p82205670_not_max_messenger"

        # Проверяем код
        cur.execute(
            f"""SELECT id, expires_at FROM {schema}.auth_codes
                WHERE telegram_id = %s AND code = %s AND used = false
                ORDER BY created_at DESC LIMIT 1""",
            (telegram_id, code)
        )
        row = cur.fetchone()

        if not row:
            cur.close()
            conn.close()
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "Неверный код. Попробуйте ещё раз."}),
            }

        code_id, expires_at = row
        if datetime.now(timezone.utc) > expires_at:
            cur.close()
            conn.close()
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "Срок действия кода истёк. Запросите новый."}),
            }

        # Помечаем код как использованный
        cur.execute(f"UPDATE {schema}.auth_codes SET used = true WHERE id = %s", (code_id,))

        # Проверяем — есть ли уже пользователь
        cur.execute(
            f"SELECT id, name, username, avatar, phone, bio, online FROM {schema}.users WHERE telegram_id = %s",
            (telegram_id,)
        )
        user_row = cur.fetchone()

        if user_row:
            user = {
                "id": user_row[0],
                "name": user_row[1],
                "username": user_row[2],
                "avatar": user_row[3],
                "phone": user_row[4] or "",
                "bio": user_row[5] or "",
                "online": True,
            }
            # Ставим онлайн
            cur.execute(f"UPDATE {schema}.users SET online = true WHERE id = %s", (user["id"],))
            conn.commit()
            cur.close()
            conn.close()
            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"success": True, "isNew": False, "user": user}),
            }
        else:
            conn.commit()
            cur.close()
            conn.close()
            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"success": True, "isNew": True}),
            }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)}),
        }
