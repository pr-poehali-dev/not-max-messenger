import { useState } from "react";
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
    recaptchaWidgetId?: number;
    confirmationResult?: ConfirmationResult;
    grecaptcha?: { reset: (id?: number) => void; getResponse: (id?: number) => string };
  }
}

const resetRecaptcha = () => {
  if (window.grecaptcha && window.recaptchaWidgetId !== undefined) {
    window.grecaptcha.reset(window.recaptchaWidgetId);
  }
  window.recaptchaVerifier = undefined;
};

export const useFirebaseAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setupRecaptcha = (buttonId: string) => {
    if (window.recaptchaVerifier) return;

    window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => {
        resetRecaptcha();
        setError("reCAPTCHA устарела. Попробуйте ещё раз.");
      },
    });

    window.recaptchaVerifier.render().then((widgetId: number) => {
      window.recaptchaWidgetId = widgetId;
    });
  };

  const sendCode = async (phone: string, buttonId: string): Promise<boolean> => {
    setError("");
    setLoading(true);
    try {
      setupRecaptcha(buttonId);
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier!);
      window.confirmationResult = result;
      return true;
    } catch (e) {
      resetRecaptcha();
      const msg = (e as { code?: string; message?: string }).code;
      if (msg === "auth/invalid-phone-number") {
        setError("Неверный формат номера телефона");
      } else if (msg === "auth/too-many-requests") {
        setError("Слишком много попыток. Попробуйте позже");
      } else {
        setError("Не удалось отправить SMS. Проверьте номер и попробуйте снова");
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
      const result = await window.confirmationResult!.confirm(code);
      const uid = result.user.uid;
      const snap = await get(ref(db, `users/${uid}`));
      return { isNew: !snap.exists(), uid };
    } catch (e) {
      const msg = (e as { code?: string }).code;
      if (msg === "auth/invalid-verification-code") {
        setError("Неверный код. Проверьте SMS и попробуйте снова");
      } else if (msg === "auth/code-expired") {
        setError("Срок действия кода истёк. Запросите новый");
        resetRecaptcha();
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

  const resendCode = async (phone: string, buttonId: string): Promise<boolean> => {
    resetRecaptcha();
    return sendCode(phone, buttonId);
  };

  return { sendCode, verifyCode, saveProfile, loadProfile, resendCode, loading, error, setError };
};
