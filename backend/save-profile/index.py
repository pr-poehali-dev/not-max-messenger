"""
Сохраняет профиль нового пользователя после успешной верификации кода.
"""
import json
import os
import uuid
import psycopg2


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
        name = (body.get("name") or "").strip()
        username = (body.get("username") or "").strip().lower()
        avatar = body.get("avatar") or "🦁"
        bio = (body.get("bio") or "").strip()
        phone = (body.get("phone") or "").strip()

        if not telegram_id or not name:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "Укажите telegram_id и name"}),
            }

        telegram_id = int(telegram_id)

        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        schema = "t_p82205670_not_max_messenger"

        # Генерируем уникальный username если не задан
        if not username:
            username = "user_" + str(telegram_id)[-6:]

        # Проверяем уникальность username
        cur.execute(f"SELECT id FROM {schema}.users WHERE username = %s", (username,))
        if cur.fetchone():
            username = username + "_" + str(telegram_id)[-4:]

        user_id = str(uuid.uuid4())

        cur.execute(
            f"""INSERT INTO {schema}.users (id, name, username, avatar, phone, bio, online, telegram_id)
                VALUES (%s, %s, %s, %s, %s, %s, true, %s)
                ON CONFLICT (telegram_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    username = EXCLUDED.username,
                    avatar = EXCLUDED.avatar,
                    phone = EXCLUDED.phone,
                    bio = EXCLUDED.bio,
                    online = true
                RETURNING id, name, username, avatar, phone, bio, online""",
            (user_id, name, username, avatar, phone, bio, telegram_id)
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        user = {
            "id": row[0],
            "name": row[1],
            "username": row[2],
            "avatar": row[3],
            "phone": row[4] or "",
            "bio": row[5] or "",
            "online": True,
        }

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"success": True, "user": user}),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)}),
        }
