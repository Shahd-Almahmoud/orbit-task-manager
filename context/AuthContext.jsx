"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ✅ رابط الـ API الموحد من متغير البيئة
  const API_URL = process.env.NEXT_PUBLIC_LOCAL_API_URL;

  // قراءة الجلسة من الكوكيز
  useEffect(() => {
    const initializeAuth = () => {
      const token = Cookies.get("access_token") || Cookies.get("token");
      const userData = Cookies.get("user");

      if (token && userData && userData !== "undefined") {
        try {
          setAccessToken(token);
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Corrupted session caught:", e);
          Cookies.remove("user");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log("Login response:", result);

      if (response.ok) {
        const token = result.token;

        if (!token) {
          console.error("No token found in response:", result);
          return { success: false, error: "Invalid response format" };
        }

        const meRes = await fetch(`${API_URL}/me`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const meData = await meRes.json();
        console.log("Me response:", meData);

        const userData = meData.data || meData;

        Cookies.set("token", token, { expires: 7 });
        Cookies.set("user", JSON.stringify(userData), { expires: 7 });

        setAccessToken(token);
        setUser(userData);

        return { success: true, user: userData };
      } else {
        return {
          success: false,
          error: result.message || "Invalid email or password",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  };
  const register = async (name, email, password, password_confirmation) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, password_confirmation }),
      });

      const result = await response.json();
      console.log("Register response:", result);

      if (response.ok) {
        return { success: true, user: result.user || result };
      } else {
        return {
          success: false,
          error:
            result.message ||
            result.errors?.email?.[0] ||
            "Registration failed",
        };
      }
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  };

  // ✅ تسجيل الخروج
  const logout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      Cookies.remove("access_token", { path: "/" });
      Cookies.remove("user", { path: "/" });

      setAccessToken(null);
      setUser(null);

      router.push("/login");
      toast.info("You have been logged out");
    }
  };

  // ✅ تحديث المستخدم
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    Cookies.set("user", JSON.stringify(updatedUser), {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  };

  // ✅ جلب الـ Headers
  const getAuthHeaders = () => {
    const token = Cookies.get("access_token") || Cookies.get("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  };

  const value = {
    user,
    accessToken,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    getAuthHeaders,
    isAuthenticated: !!accessToken && !!user,
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
