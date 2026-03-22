import { useState } from "react";
import { User } from "@/pages/Index";
import { AVATARS } from "@/data/mockData";
import Icon from "@/components/ui/icon";

type Props = { onAuth: (user: User) => void };
type Step = "phone" | "code" | "register";

const AuthScreen = ({ onAuth }: Props) => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦁");
  const [isNew, setIsNew] = useState(true);
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", ""]);

  const handlePhone = () => {
    if (phone.replace(/\D/g, "").length >= 10) {
      setStep("code");
    }
  };

  const handleCode = () => {
    const fullCode = codeDigits.join("");
    if (fullCode.length === 5) {
      if (isNew) setStep("register");
      else finishAuth();
    }
  };

  const handleCodeDigit = (val: string, idx: number) => {
    const digits = [...codeDigits];
    digits[idx] = val.slice(-1);
    setCodeDigits(digits);
    if (val && idx < 4) {
      const next = document.getElementById(`code-${idx + 1}`);
      next?.focus();
    }
    if (digits.every(d => d !== "") && digits.join("").length === 5) {
      setTimeout(() => {
        if (isNew) setStep("register");
        else finishAuth(digits.join(""));
      }, 200);
    }
  };

  const finishAuth = (_code?: string) => {
    onAuth({
      id: "me",
      name: name || "Пользователь",
      username: username || "user_" + Math.floor(Math.random() * 9999),
      avatar: selectedAvatar,
      phone,
      bio,
      online: true,
    });
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-nm-bg">
      <div className="w-full max-w-[390px] h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-nm-accent/10 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center animate-fade-in">
          <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-nm-accent to-nm-accent2 flex items-center justify-center text-4xl shadow-lg shadow-nm-accent/30 mb-4">
            💬
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Не MAX</h1>
          <p className="text-nm-muted text-sm mt-1">Мессенджер нового поколения</p>
        </div>

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
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="existing"
                checked={!isNew}
                onChange={e => setIsNew(!e.target.checked)}
                className="accent-nm-accent w-4 h-4"
              />
              <label htmlFor="existing" className="text-nm-muted text-sm">У меня уже есть аккаунт</label>
            </div>
            <button
              onClick={handlePhone}
              className="w-full mt-4 bg-nm-accent hover:bg-nm-accent/90 text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-95"
            >
              Продолжить
            </button>
          </div>
        )}

        {/* Code step */}
        {step === "code" && (
          <div className="w-full animate-fade-in">
            <button onClick={() => setStep("phone")} className="flex items-center gap-1 text-nm-accent text-sm mb-6">
              <Icon name="ChevronLeft" size={16} /> Назад
            </button>
            <h2 className="text-white text-xl font-semibold text-center mb-2">Код подтверждения</h2>
            <p className="text-nm-muted text-sm text-center mb-6">Отправили SMS на {phone}</p>
            <div className="flex gap-3 justify-center mb-6">
              {codeDigits.map((d, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleCodeDigit(e.target.value, i)}
                  className="w-12 h-14 bg-nm-surface border border-nm-border rounded-xl text-white text-xl font-bold text-center focus:outline-none focus:border-nm-accent transition-colors"
                />
              ))}
            </div>
            <button
              onClick={handleCode}
              className="w-full bg-nm-accent hover:bg-nm-accent/90 text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-95"
            >
              Подтвердить
            </button>
          </div>
        )}

        {/* Register step */}
        {step === "register" && (
          <div className="w-full animate-fade-in">
            <h2 className="text-white text-xl font-semibold text-center mb-2">Создать профиль</h2>
            <p className="text-nm-muted text-sm text-center mb-6">Выберите аватар и заполните данные</p>

            {/* Avatar picker */}
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
              onClick={finishAuth}
              disabled={!name.trim()}
              className="w-full mt-4 bg-nm-accent hover:bg-nm-accent/90 disabled:opacity-40 text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-95"
            >
              Войти в Не MAX 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
