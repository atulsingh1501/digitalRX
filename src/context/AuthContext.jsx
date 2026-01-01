import React, { createContext, useContext, useState, useEffect } from 'react'
import { storage } from '../services/storage'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [hasPin, setHasPin] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user has a PIN setup
        const pinExists = storage.hasPin()
        setHasPin(pinExists)
        setLoading(false)
    }, [])

    const login = (pin) => {
        if (storage.verifyPin(pin)) {
            setIsAuthenticated(true)
            return true
        }
        return false
    }

    const signup = (pin) => {
        storage.setPin(pin)
        setHasPin(true)
        setIsAuthenticated(true)
    }

    const logout = () => {
        setIsAuthenticated(false)
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, hasPin, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
