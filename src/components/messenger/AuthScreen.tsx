import { useState } from "react";
import { User } from "@/pages/Index";
import { AVATARS } from "@/data/mockData";
import { api } from "@/lib/api";
import Icon from "@/components/ui/icon";

type Props = { onAuth: (user: User) => void };
type Step = "telegram_id" | "code" | "register";

const BOT_USERNAME = "ne_max_auth_bot";

const AuthScreen = ({ onAuth }: Props) => {
  const [step, setStep] = useState<Step>("telegram_id");
  const [telegramId, setTelegramId] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦁");
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    const id = telegramId.trim();
    if (!id || isNaN(Number(id))) {
      setError("Введите корректный Telegram ID (только цифры)");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.sendCode(Number(id));
      if (res.error) { setError(res.error); return; }
      setStep("code");
      startResendTimer();
    } finally {
      setLoading(false);
    }
  };

  const handleCodeDigit = (val: string, idx: number) => {
    const digits = [...codeDigits];
    digits[idx] = val.replace(/\D/g, "").slice(-1);
    setCodeDigits(digits);
    if (val && idx < 5) document.getElementById(`code-${idx + 1}`)?.focus();
    if (digits.every(d => d !== "")) setTimeout(() => handleVerify(digits.join("")), 100);
  };

  const handleVerify = async (code: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await api.verifyCode(Number(telegramId), code);
      if (res.error) {
        setError(res.error);
        setCodeDigits(["", "", "", "", "", ""]);
        document.getElementById("code-0")?.focus();
        return;
      }
      if (!res.isNew) {
        onAuth(res.user as User);
      } else {
        setStep("register");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await api.saveProfile({
        telegram_id: Number(telegramId),
        name: name.trim(),
        username: username.trim(),
        avatar: selectedAvatar,
        bio: bio.trim(),
        phone: "",
      });
      if (res.error) { setError(res.error); return; }
      onAuth(res.user as User);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-nm-bg overflow-y-auto">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col items-center justify-center px-6 py-10 relative">
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[360px] h-[360px] rounded-full bg-nm-accent/10 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="mb-7 flex flex-col items-center animate-fade-in">
          <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-nm-accent to-nm-accent2 flex items-center justify-center text-4xl shadow-lg shadow-nm-accent/30 mb-3">
            💬
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Не MAX</h1>
          <p className="text-nm-muted text-sm mt-1">Мессенджер нового поколения</p>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl animate-fade-in">
            <p className="text-red-400 text-sm text-center leading-relaxed">{error}</p>
          </div>
        )}

        {/* ── ШАГ 1: TELEGRAM ID ── */}
        {step === "telegram_id" && (
          <div className="w-full animate-fade-in">
            <h2 className="text-white text-xl font-semibold text-center mb-1">Войти через Telegram</h2>
            <p className="text-nm-muted text-sm text-center mb-5 leading-relaxed">
              Код подтверждения придёт в Telegram бесплатно
            </p>

            {/* Инструкция */}
            <div className="bg-nm-surface border border-nm-border/40 rounded-2xl p-4 mb-5">
              <p className="text-white text-sm font-semibold mb-3">Шаг 1 — получите ваш Telegram ID:</p>
              <a
                href={`https://t.me/${BOT_USERNAME}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#2481cc] hover:bg-[#2481cc]/90 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 mb-3"
              >
                <span className="text-lg">✈️</span>
                Открыть @{BOT_USERNAME}
              </a>
              <p className="text-nm-muted text-xs text-center leading-relaxed">
                Нажмите <span className="text-white font-medium">Start</span> — бот пришлёт ваш ID
              </p>
            </div>

            <p className="text-white text-sm font-semibold mb-2">Шаг 2 — вставьте ID сюда:</p>
            <input
              type="text"
              inputMode="numeric"
              value={telegramId}
              onChange={e => { setTelegramId(e.target.value.replace(/\D/g, "")); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSendCode()}
              placeholder="123456789"
              className="w-full bg-nm-surface border border-nm-border rounded-2xl px-4 py-3.5 text-white text-center text-lg placeholder:text-nm-muted focus:outline-none focus:border-nm-accent transition-colors"
              autoFocus
            />

            <button
              onClick={handleSendCode}
              disabled={loading || !telegramId.trim()}
              className="w-full mt-4 bg-nm-accent hover:bg-nm-accent/90 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading
                ? <><Icon name="Loader2" size={18} className="animate-spin" /> Отправляем код...</>
                : "Получить код в Telegram ✈️"}
            </button>
          </div>
        )}

        {/* ── ШАГ 2: КОД ── */}
        {step === "code" && (
          <div className="w-full animate-fade-in">
            <button
              onClick={() => { setStep("telegram_id"); setCodeDigits(["", "", "", "", "", ""]); setError(""); }}
              className="flex items-center gap-1 text-nm-accent text-sm mb-5"
            >
              <Icon name="ChevronLeft" size={16} /> Назад
            </button>

            <h2 className="text-white text-xl font-semibold text-center mb-1">Код из Telegram</h2>
            <p className="text-nm-muted text-sm text-center mb-1 leading-relaxed">
              Бот <span className="text-nm-accent font-medium">@{BOT_USERNAME}</span> прислал 6-значный код
            </p>
            <p className="text-nm-muted text-xs text-center mb-6 opacity-60">Код действует 10 минут</p>

            <div className="flex gap-2 justify-center mb-5">
              {codeDigits.map((d, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  autoFocus={i === 0}
                  onChange={e => handleCodeDigit(e.target.value, i)}
                  onKeyDown={e => {
                    if (e.key === "Backspace" && !d && i > 0) {
                      const prev = document.getElementById(`code-${i - 1}`);
                      prev?.focus();
                      const nd = [...codeDigits];
                      nd[i - 1] = "";
                      setCodeDigits(nd);
                    }
                  }}
                  onPaste={e => {
                    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    if (paste.length === 6) {
                      e.preventDefault();
                      setCodeDigits(paste.split(""));
                      setTimeout(() => handleVerify(paste), 100);
                    }
                  }}
                  className="w-11 h-14 bg-nm-surface border border-nm-border rounded-xl text-white text-2xl font-bold text-center focus:outline-none focus:border-nm-accent transition-colors"
                />
              ))}
            </div>

            {loading && (
              <div className="flex justify-center items-center gap-2 text-nm-muted text-sm mb-3">
                <Icon name="Loader2" size={16} className="animate-spin" /> Проверяем код...
              </div>
            )}

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-nm-muted text-sm">
                  Отправить повторно через <span className="text-white font-medium">{resendTimer}</span> сек
                </p>
              ) : (
                <button
                  onClick={async () => {
                    setCodeDigits(["", "", "", "", "", ""]);
                    setError("");
                    setLoading(true);
                    try {
                      const res = await api.sendCode(Number(telegramId));
                      if (res.error) { setError(res.error); return; }
                      startResendTimer();
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="text-nm-accent text-sm font-medium hover:underline disabled:opacity-50"
                >
                  Отправить код повторно
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── ШАГ 3: ПРОФИЛЬ ── */}
        {step === "register" && (
          <div className="w-full animate-fade-in">
            <h2 className="text-white text-xl font-semibold text-center mb-1">Создать профиль</h2>
            <p className="text-nm-muted text-sm text-center mb-5">Выберите аватар и заполните данные</p>

            <div className="flex flex-wrap gap-2 justify-center mb-5">
              {AVATARS.map(av => (
                <button
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedAvatar === av
                      ? "bg-nm-accent scale-110 shadow-lg shadow-nm-accent/40"
                      : "bg-nm-surface hover:bg-nm-border"
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ваше имя *"
                autoFocus
                className="w-full bg-nm-surface border border-nm-border rounded-2xl px-4 py-3 text-white placeholder:text-nm-muted focus:outline-none focus:border-nm-accent transition-colors"
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nm-muted text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_]/g, "").toLowerCase())}
                  placeholder="username"
                  className="w-full bg-nm-surface border border-nm-border rounded-2xl pl-8 pr-4 py-3 text-white placeholder:text-nm-muted focus:outline-none focus:border-nm-accent transition-colors"
                />
              </div>
              <input
                type="text"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="О себе (необязательно)"
                className="w-full bg-nm-surface border border-nm-border rounded-2xl px-4 py-3 text-white placeholder:text-nm-muted focus:outline-none focus:border-nm-accent transition-colors"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={!name.trim() || loading}
              className="w-full mt-4 bg-nm-accent hover:bg-nm-accent/90 disabled:opacity-40 text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading
                ? <><Icon name="Loader2" size={18} className="animate-spin" /> Сохраняем...</>
                : "Войти в Не MAX 🚀"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
