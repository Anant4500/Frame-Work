import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fw_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('fw_user', JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('fw_user')
  }, [])

  const register = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('fw_user', JSON.stringify(userData))
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
