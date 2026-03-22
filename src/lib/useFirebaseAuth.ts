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
    confirmationResult?: ConfirmationResult;
  }
}

export const useFirebaseAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setupRecaptcha = (containerId: string) => {
    if (window.recaptchaVerifier) return;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {},
    });
  };

  const sendCode = async (phone: string, containerId: string): Promise<boolean> => {
    setError("");
    setLoading(true);
    try {
      setupRecaptcha(containerId);
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier!);
      window.confirmationResult = result;
      return true;
    } catch (e) {
      setError((e as Error).message || "Ошибка отправки кода");
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
    } catch {
      setError("Неверный код. Попробуйте ещё раз.");
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
    await set(ref(db, `users/${uid}`), { ...user, online: true });
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

  return { sendCode, verifyCode, saveProfile, loadProfile, loading, error, setError };
};
