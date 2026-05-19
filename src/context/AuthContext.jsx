import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('hqm_token')
    if (!token) { setLoading(false); return }
    try {
      const data = await api.getMe()
      setUser(data.user)
    } catch {
      localStorage.removeItem('hqm_token')
      setUser(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { refreshUser() }, [refreshUser])

  const login = async (username, password) => {
    try {
      const data = await api.login({ username, password })
      localStorage.setItem('hqm_token', data.token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const register = async (username, email, password) => {
    try {
      const data = await api.register({ username, email, password })
      localStorage.setItem('hqm_token', data.token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('hqm_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
