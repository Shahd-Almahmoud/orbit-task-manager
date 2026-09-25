"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  LEGACY_TOKEN_COOKIE,
  SESSION_COOKIE_OPTIONS,
  TOKEN_COOKIE,
  USER_COOKIE,
  clearSessionCookies,
  getStoredToken,
  getStoredUser,
} from "@/lib/config";
import { getReq, postReq } from "@/lib/api";

const AuthContext = createContext({});

// المسارات المحتملة للتوكن في استجابة الـ API (Laravel / Sanctum / Passport)
const TOKEN_PATHS = [
  ["token"],
  ["access_token"],
  ["auth_token"],
  ["api_token"],
  ["data", "token"],
  ["data", "access_token"],
  ["data", "auth_token"],
  ["token", "access_token"],
];

function extractToken(payload) {
  if (!payload || typeof payload !== "object") return null;

  for (const path of TOKEN_PATHS) {
    let value = payload;
    for (const key of path) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return null;
}

function looksLikeUser(value) {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    ("id" in value || "email" in value || "name" in value)
  );
}

function extractUser(payload) {
  if (!payload || typeof payload !== "object") return null;

  const candidates = [payload.user, payload.data?.user, payload.data, payload];
  return candidates.find(looksLikeUser) || null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // قراءة الجلسة من الكوكيز عند أول تحميل
  useEffect(() => {
    const token = getStoredToken();
    const userData = getStoredUser();

    if (token) setAccessToken(token);
    if (userData) setUser(userData);
    if (!token && userData) Cookies.remove(USER_COOKIE, { path: "/" });

    setIsLoading(false);
  }, []);

  // ✅ جلب بيانات المستخدم الحالي (POST ثم GET حسب توجيه الباك إند)
  const fetchCurrentUser = async () => {
    try {
      const payload = await postReq("/me", undefined, {
        redirectOn401: false,
      }).catch((error) => {
        // بعض السيرفرات تعرّف /me كـ GET فقط
        if (error?.status === 404 || error?.status === 405) {
          return getReq("/me", { redirectOn401: false });
        }
        throw error;
      });

      return extractUser(payload);
    } catch (error) {
      console.error("Fetch current user error:", error);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      // redirectOn401=false حتى لا يتسبب خطأ بيانات الدخول بإعادة توجيه
      const result = await postReq(
        "/login",
        { email, password },
        { auth: false, redirectOn401: false },
      );

      const token = extractToken(result);
      if (!token) {
        console.error("No token found in login response:", result);
        return {
          success: false,
          error: "Login response did not include an access token.",
        };
      }

      // نحفظ التوكن أولاً حتى تكون الجلسة متاحة لصفحات الداشبورد مباشرة
      Cookies.set(TOKEN_COOKIE, token, SESSION_COOKIE_OPTIONS);

      const userData =
        (await fetchCurrentUser()) || extractUser(result) || { email };

      Cookies.set(USER_COOKIE, JSON.stringify(userData), SESSION_COOKIE_OPTIONS);

      setAccessToken(token);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login failed:", error);

      const message =
        error?.status === 401 || error?.status === 403
          ? "Invalid email or password"
          : error?.message || "Login failed. Please try again.";

      return { success: false, error: message };
    }
  };


  const register = async (name, email, password, password_confirmation) => {
    try {
      const result = await postReq(
        "/register",
        { name, email, password, password_confirmation },
        { auth: false, redirectOn401: false },
      );

      return { success: true, user: extractUser(result) || result };
    } catch (error) {
      console.error("Register failed:", error);

      return {
        success: false,
        error: error?.message || "Registration failed. Please try again.",
      };
    }
  };

  // ✅ تسجيل الخروج
  const logout = async () => {
    const token = accessToken || getStoredToken();

    try {
      if (token) {
        await postReq("/logout", undefined, { redirectOn401: false });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      Cookies.remove(TOKEN_COOKIE, { path: "/" });
      Cookies.remove(LEGACY_TOKEN_COOKIE, { path: "/" });
      Cookies.remove(USER_COOKIE, { path: "/" });
      clearSessionCookies();

      setAccessToken(null);
      setUser(null);

      toast.info("You have been logged out");
      router.push("/login");
    }
  };

  // ✅ تحديث المستخدم
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    Cookies.set(USER_COOKIE, JSON.stringify(updatedUser), {
      ...SESSION_COOKIE_OPTIONS,
      secure: process.env.NODE_ENV === "production",
    });
  };

  const value = {
    user,
    accessToken,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}

