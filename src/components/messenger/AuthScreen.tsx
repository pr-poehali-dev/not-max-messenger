import { useState } from "react";
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

  const { sendCode, verifyCode, saveProfile, loadProfile, loading, error, setError } = useFirebaseAuth();

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits.startsWith("7") && !digits.startsWith("8")) return "+" + digits;
    return "+" + (digits.startsWith("8") ? "7" + digits.slice(1) : digits);
  };

  const handlePhone = async () => {
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Введите корректный номер телефона");
      return;
    }
    const formatted = formatPhone(phone);
    const ok = await sendCode(formatted, "recaptcha-container");
    if (ok) setStep("code");
  };

  const handleCodeDigit = (val: string, idx: number) => {
    const digits = [...codeDigits];
    digits[idx] = val.slice(-1);
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
    if (!res) return;
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
      name,
      username: username || "user_" + uid.slice(0, 6),
      avatar: selectedAvatar,
      bio,
      phone: formatPhone(phone),
    });
    onAuth(user);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-nm-bg">
      <div id="recaptcha-container" />

      <div className="w-full max-w-[390px] h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-nm-accent/10 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center animate-fade-in">
          <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-nm-accent to-nm-accent2 flex items-center justify-center text-4xl shadow-lg shadow-nm-accent/30 mb-4">
            💬
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Не MAX</h1>
          <p className="text-nm-muted text-sm mt-1">Мессенджер нового поколения</p>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl animate-fade-in">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Phone step */}
        {step === "phone" && (
          <div className="w-full animate-fade-in">
            <h2 className="text-white text-xl font-semibold text-center mb-2">Ваш номер</h2>
            <p className="text-nm-muted text-sm text-center mb-6">Введите номер телефона для входа или регистрации</p>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+7 999 000 00 00"
              className="w-full bg-nm-surface border border-nm-border rounded-2xl px-4 py-3.5 text-white text-center text-lg placeholder:text-nm-muted focus:outline-none focus:border-nm-accent transition-colors"
            />
            <button
              onClick={handlePhone}
              disabled={loading}
              className="w-full mt-4 bg-nm-accent hover:bg-nm-accent/90 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading
                ? <><Icon name="Loader2" size={18} className="animate-spin" /> Отправляем код...</>
                : "Получить код"}
            </button>
          </div>
        )}

        {/* Code step */}
        {step === "code" && (
          <div className="w-full animate-fade-in">
            <button onClick={() => setStep("phone")} className="flex items-center gap-1 text-nm-accent text-sm mb-6">
              <Icon name="ChevronLeft" size={16} /> Назад
            </button>
            <h2 className="text-white text-xl font-semibold text-center mb-2">Код из SMS</h2>
            <p className="text-nm-muted text-sm text-center mb-6">Отправили на {formatPhone(phone)}</p>
            <div className="flex gap-2 justify-center mb-6">
              {codeDigits.map((d, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleCodeDigit(e.target.value, i)}
                  onKeyDown={e => {
                    if (e.key === "Backspace" && !d && i > 0) {
                      document.getElementById(`code-${i - 1}`)?.focus();
                    }
                  }}
                  className="w-11 h-[52px] bg-nm-surface border border-nm-border rounded-xl text-white text-xl font-bold text-center focus:outline-none focus:border-nm-accent transition-colors"
                />
              ))}
            </div>
            {loading && (
              <div className="flex justify-center items-center gap-2 text-nm-muted text-sm">
                <Icon name="Loader2" size={16} className="animate-spin" /> Проверяем код...
              </div>
            )}
          </div>
        )}

        {/* Register step */}
        {step === "register" && (
          <div className="w-full animate-fade-in">
            <h2 className="text-white text-xl font-semibold text-center mb-2">Создать профиль</h2>
            <p className="text-nm-muted text-sm text-center mb-5">Выберите аватар и заполните данные</p>

            <div className="flex flex-wrap gap-2 justify-center mb-5">
              {AVATARS.map(av => (
                <button
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${selectedAvatar === av ? "bg-nm-accent scale-110 shadow-lg shadow-nm-accent/40" : "bg-nm-surface hover:bg-nm-border"}`}
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
                className="w-full bg-nm-surface border border-nm-border rounded-2xl px-4 py-3 text-white placeholder:text-nm-muted focus:outline-none focus:border-nm-accent transition-colors"
              />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                placeholder="@username"
                className="w-full bg-nm-surface border border-nm-border rounded-2xl px-4 py-3 text-white placeholder:text-nm-muted focus:outline-none focus:border-nm-accent transition-colors"
              />
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
