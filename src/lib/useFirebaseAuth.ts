import { useState, useRef } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, db } from "./firebase";
import { User } from "@/pages/Index";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export const useFirebaseAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  const clearVerifier = () => {
    if (verifierRef.current) {
      verifierRef.current.clear();
      verifierRef.current = null;
    }
    window.recaptchaVerifier = undefined;
  };

  const getVerifier = (containerId: string): RecaptchaVerifier => {
    clearVerifier();
    const v = new RecaptchaVerifier(auth, containerId, {
      size: "normal",
      theme: "dark",
      callback: () => {},
      "expired-callback": () => {
        setError("reCAPTCHA устарела — нажмите ещё раз");
      },
    });
    verifierRef.current = v;
    window.recaptchaVerifier = v;
    return v;
  };

  const sendCode = async (phone: string, containerId: string): Promise<boolean> => {
    setError("");
    setLoading(true);
    try {
      const verifier = getVerifier(containerId);
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      window.confirmationResult = result;
      return true;
    } catch (e) {
      clearVerifier();
      const code = (e as { code?: string }).code ?? "";
      if (code === "auth/invalid-phone-number") {
        setError("Неверный формат номера. Пример: +7 999 123 45 67");
      } else if (code === "auth/too-many-requests") {
        setError("Слишком много попыток. Попробуйте через несколько минут");
      } else if (code === "auth/captcha-check-failed") {
        setError("Ошибка reCAPTCHA. Обновите страницу и попробуйте снова");
      } else if (code === "auth/unauthorized-domain") {
        setError("Домен не авторизован в Firebase. Добавьте его в Firebase Console → Authentication → Settings → Authorized domains");
      } else {
        setError(`Ошибка отправки SMS (${code || "неизвестная"}). Проверьте настройки Firebase`);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (code: string): Promise<{ isNew: boolean; uid: string } | null> => {
    setError("");
    setLoading(true);
    try {
      if (!window.confirmationResult) {
        setError("Сессия истекла. Вернитесь и запросите код снова");
        return null;
      }
      const result = await window.confirmationResult.confirm(code);
      const uid = result.user.uid;
      const snap = await get(ref(db, `users/${uid}`));
      return { isNew: !snap.exists(), uid };
    } catch (e) {
      const errCode = (e as { code?: string }).code ?? "";
      if (errCode === "auth/invalid-verification-code") {
        setError("Неверный код. Проверьте SMS и попробуйте снова");
      } else if (errCode === "auth/code-expired") {
        setError("Срок кода истёк. Вернитесь и запросите новый");
      } else if (errCode === "auth/missing-verification-code") {
        setError("Введите все 6 цифр кода");
      } else {
        setError("Ошибка подтверждения. Попробуйте ещё раз");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (
    uid: string,
    data: { name: string; username: string; avatar: string; bio: string; phone: string }
  ): Promise<User> => {
    setLoading(true);
    const user: User = { id: uid, online: true, ...data };
    await set(ref(db, `users/${uid}`), user);
    setLoading(false);
    return user;
  };

  const loadProfile = async (uid: string): Promise<User | null> => {
    setLoading(true);
    try {
      const snap = await get(ref(db, `users/${uid}`));
      if (snap.exists()) return snap.val() as User;
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async (phone: string, containerId: string): Promise<boolean> => {
    return sendCode(phone, containerId);
  };

  return { sendCode, verifyCode, saveProfile, loadProfile, resendCode, loading, error, setError, clearVerifier };
};
