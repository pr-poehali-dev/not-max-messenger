CREATE TABLE t_p82205670_not_max_messenger.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar TEXT DEFAULT '🦁',
    phone TEXT,
    bio TEXT DEFAULT '',
    online BOOLEAN DEFAULT false,
    telegram_id BIGINT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p82205670_not_max_messenger.auth_codes (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_codes_telegram_id ON t_p82205670_not_max_messenger.auth_codes(telegram_id);
