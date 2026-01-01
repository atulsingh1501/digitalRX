import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import { Wifi, WifiOff, Activity } from 'lucide-react'

export default function Login() {
    const { login, signup, hasPin, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const [pin, setPin] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard')
        }
    }, [isAuthenticated, navigate])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (pin.length < 4) return

        if (!hasPin) {
            signup(pin)
            navigate('/dashboard')
        } else {
            const success = login(pin)
            if (!success) {
                setError('Incorrect PIN')
                setPin('')

                // Shake animation logic could go here
                const input = document.getElementById('pin-input')
                if (input) {
                    input.style.transform = 'translateX(10px)'
                    setTimeout(() => input.style.transform = 'translateX(0)', 100)
                    setTimeout(() => input.style.transform = 'translateX(-10px)', 200)
                    setTimeout(() => input.style.transform = 'translateX(0)', 300)
                }
            } else {
                navigate('/dashboard')
            }
        }
    }

    const handlePinChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4)
        setPin(val)
        setError('')
    }

    return (
        <div className="container animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'white',
            backgroundImage: 'radial-gradient(circle at top right, #EFF6FF 0%, transparent 40%), radial-gradient(circle at bottom left, #F0FDF4 0%, transparent 40%)'
        }}>

            <div className="animate-slide-up" style={{ width: '100%', maxWidth: '320px', textAlign: 'center' }}>

                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--primary-gradient)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)'
                }}>
                    <Activity size={40} color="white" />
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: '8px', background: 'linear-gradient(to right, var(--text-main), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Welcome Dr.
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
                    {hasPin ? 'Enter your access PIN' : 'Set a secure PIN to start'}
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative' }}>
                        <input
                            id="pin-input"
                            type="tel"
                            placeholder="• • • •"
                            value={pin}
                            onChange={handlePinChange}
                            maxLength={4}
                            autoFocus
                            style={{
                                textAlign: 'center',
                                fontSize: '2rem',
                                letterSpacing: '1rem',
                                height: '70px',
                                borderRadius: '20px',
                                background: '#F8FAFC',
                                border: '2px solid transparent',
                                paddingLeft: '1rem', /* Correction for visual centering with letter-spacing */
                                color: 'var(--text-main)',
                                fontWeight: 700
                            }}
                        />
                    </div>

                    {error && <div style={{ color: '#EF4444', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500 }}>{error}</div>}

                    <Button type="submit" disabled={pin.length !== 4} style={{ marginTop: '16px', height: '56px', fontSize: '1.1rem' }}>
                        {hasPin ? 'Unlock' : 'Get Started'}
                    </Button>
                </form>

                <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                    {navigator.onLine ?
                        <><Wifi size={14} /> <span>Secure Online Connection</span></> :
                        <><WifiOff size={14} /> <span>Offline Mode Active</span></>
                    }
                </div>
            </div>
        </div>
    )
}
