import { useState, useEffect } from "react";
import { User } from "@/pages/Index";
import { AVATARS } from "@/data/mockData";
import { useFirebaseAuth } from "@/lib/useFirebaseAuth";
import Icon from "@/components/ui/icon";

type Props = { onAuth: (user: User) => void };
type Step = "phone" | "code" | "register";

const AuthScreen = ({ onAuth }: Props) => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦁");
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const [uid, setUid] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const { sendCode, verifyCode, saveProfile, loadProfile, resendCode, clearVerifier, loading, error, setError } = useFirebaseAuth();

  useEffect(() => {
    return () => { clearVerifier(); };
  }, []);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("8")) return "+7" + digits.slice(1);
    if (digits.startsWith("7")) return "+" + digits;
    if (digits.length > 0) return "+" + digits;
    return raw;
  };

  const handlePhone = async () => {
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Введите корректный номер телефона");
      return;
    }
    const formatted = formatPhone(phone);
    const ok = await sendCode(formatted, "recaptcha-box");
    if (ok) { setStep("code"); startResendTimer(); }
  };

  const handleCodeDigit = (val: string, idx: number) => {
    const digits = [...codeDigits];
    digits[idx] = val.replace(/\D/g, "").slice(-1);
    setCodeDigits(digits);
    if (val && idx < 5) {
      document.getElementById(`code-${idx + 1}`)?.focus();
    }
    if (digits.every(d => d !== "")) {
      setTimeout(() => handleVerify(digits.join("")), 100);
    }
  };

  const handleVerify = async (code: string) => {
    const res = await verifyCode(code);
    if (!res) { setCodeDigits(["", "", "", "", "", ""]); return; }
    setUid(res.uid);
    if (res.isNew) {
      setStep("register");
    } else {
      const profile = await loadProfile(res.uid);
      if (profile) onAuth(profile);
      else setStep("register");
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) return;
    const user = await saveProfile(uid, {
      name: name.trim(),
      username: username.trim() || "user_" + uid.slice(0, 6),
      avatar: selectedAvatar,
      bio: bio.trim(),
      phone: formatPhone(phone),
    });
    onAuth(user);
  };

  const handleBack = () => {
    clearVerifier();
    setStep("phone");
    setCodeDigits(["", "", "", "", "", ""]);
    setError("");
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-nm-bg overflow-y-auto">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col items-center justify-center px-6 py-10 relative">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-nm-accent/10 blur-[80px] pointer-events-none" />

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

        {/* ── ШАГ 1: ТЕЛЕФОН ── */}
        {step === "phone" && (
          <div className="w-full animate-fade-in">
            <h2 className="text-white text-xl font-semibold text-center mb-1">Ваш номер</h2>
            <p className="text-nm-muted text-sm text-center mb-5">Введите номер — пришлём SMS с кодом</p>

            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handlePhone()}
              placeholder="+7 999 000 00 00"
              className="w-full bg-nm-surface border border-nm-border rounded-2xl px-4 py-3.5 text-white text-center text-lg placeholder:text-nm-muted focus:outline-none focus:border-nm-accent transition-colors mb-4"
              autoFocus
            />

            {/* reCAPTCHA виджет — появляется здесь */}
            <div
              id="recaptcha-box"
              className="flex justify-center mb-4 min-h-[78px] items-center"
            />

            <button
              onClick={handlePhone}
              disabled={loading}
              className="w-full bg-nm-accent hover:bg-nm-accent/90 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading
                ? <><Icon name="Loader2" size={18} className="animate-spin" /> Отправляем SMS...</>
                : "Получить код по SMS"}
            </button>
          </div>
        )}

        {/* ── ШАГ 2: КОД ── */}
        {step === "code" && (
          <div className="w-full animate-fade-in">
            <button onClick={handleBack} className="flex items-center gap-1 text-nm-accent text-sm mb-5">
              <Icon name="ChevronLeft" size={16} /> Изменить номер
            </button>

            <h2 className="text-white text-xl font-semibold text-center mb-1">Код из SMS</h2>
            <p className="text-nm-muted text-sm text-center mb-6">
              Отправили на <span className="text-white">{formatPhone(phone)}</span>
            </p>

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
                      const newDigits = [...codeDigits];
                      newDigits[i - 1] = "";
                      setCodeDigits(newDigits);
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
                <p className="text-nm-muted text-sm">Повторная отправка через <span className="text-white">{resendTimer}</span> сек</p>
              ) : (
                <button
                  id="resend-recaptcha-box"
                  onClick={async () => {
                    setCodeDigits(["", "", "", "", "", ""]);
                    setError("");
                    const ok = await resendCode(formatPhone(phone), "resend-recaptcha-box");
                    if (ok) startResendTimer();
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
