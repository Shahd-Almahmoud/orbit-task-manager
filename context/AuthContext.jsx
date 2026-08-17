'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie' // js-cookie
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth from cookies on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = Cookies.get('access_token')
      const userData = Cookies.get('user')
      
      if (token && userData) {
        setAccessToken(token)
        setUser(JSON.parse(userData))
      }
      setIsLoading(false)
    }
    
    initializeAuth()
  }, [])

  const login = async (username, password) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()

      if (response.ok) {
        // Store in cookies
        Cookies.set('access_token', result.access_token, {
          expires: result.expires_in / 86400, // Convert seconds to days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/'
        })
        
        Cookies.set('user', JSON.stringify(result.user), {
          expires: result.expires_in / 86400,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/'
        })
        
        // Store in state
        setAccessToken(result.access_token)
        setUser(result.user)
        
        return { success: true, user: result.user }
      } else {
        return { 
          success: false, 
          error: result.message || result.error || 'Invalid username or password' 
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

  const logout = async () => {
    try {
      // Call logout API if needed
      const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Remove cookies
      Cookies.remove('access_token', { path: '/' })
      Cookies.remove('user', { path: '/' })
      
      // Clear state
      setAccessToken(null)
      setUser(null)
      
      // Redirect to login
      router.push('/login')
      toast.info('You have been logged out')
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    Cookies.set('user', JSON.stringify(updatedUser), {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })
  }

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
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
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}