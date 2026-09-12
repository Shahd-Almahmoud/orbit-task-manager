'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie' 
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // ✅ رابط الـ API الموحد من متغير البيئة
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taskback.orbit-eng.net/api'

  // قراءة الجلسة من الكوكيز
  useEffect(() => {
    const initializeAuth = () => {
      const token = Cookies.get('access_token') || Cookies.get('token');
      const userData = Cookies.get('user');
      
      if (token && userData && userData !== "undefined") {
        try {
          setAccessToken(token);
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Corrupted session caught:", e);
        }
      }
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

  // ✅ تسجيل الدخول
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email: username, 
          password: password 
        }),
      })

      const result = await response.json()
      console.log("Login response:", result)

      if (response.ok) {
        const token = result.token || result.access_token
        
        if (!token) {
          return { 
            success: false, 
            error: 'No token received from server' 
          }
        }

        const expiration = result.expires_in ? result.expires_in / 86400 : 7

        Cookies.set('access_token', token, {
          expires: expiration, 
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/'
        })
        
        const userData = result.user || { 
          name: username.split('@')[0], 
          email: username,
          role: 'admin'
        }
        
        Cookies.set('user', JSON.stringify(userData), {
          expires: expiration,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/'
        })
        
        setAccessToken(token)
        setUser(userData)
        
        return { success: true, user: userData }
      } else {
        return { 
          success: false, 
          error: result.message || result.error || 'Invalid email or password' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Network error. Please check your connection.' 
      }
    }
  }

  // ✅ تسجيل الخروج
  const logout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      })
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      Cookies.remove('access_token', { path: '/' })
      Cookies.remove('user', { path: '/' })
      
      setAccessToken(null)
      setUser(null)
      
      router.push('/login')
      toast.info('You have been logged out')
    }
  }

  // ✅ تحديث المستخدم
  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    Cookies.set('user', JSON.stringify(updatedUser), {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })
  }

  // ✅ جلب الـ Headers
  const getAuthHeaders = () => {
    const token = Cookies.get('access_token') || Cookies.get('token');
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  const value = {
    user,
    accessToken,
    isLoading,
    login,
    logout,
    updateUser,
    getAuthHeaders,
    isAuthenticated: !!accessToken && !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider')
  }
  return context
}