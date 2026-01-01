import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Settings, WifiOff } from 'lucide-react'
import { storage } from '../services/storage'

export default function Layout({ children }) {
    const location = useLocation()
    const clinicInfo = storage.getClinicInfo()
    const isOnline = navigator.onLine

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
        return (
            <Link
                to={to}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    color: isActive ? 'var(--primary)' : 'var(--text-light)',
                    position: 'relative',
                    padding: '8px 16px'
                }}
            >
                <div style={{
                    padding: '8px',
                    borderRadius: '20px',
                    background: isActive ? 'var(--primary-soft)' : 'transparent',
                    transition: 'all 0.3s ease'
                }}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {!isActive && <span style={{ fontSize: '0.65rem', fontWeight: 500, marginTop: '2px' }}>{label}</span>}
            </Link>
        )
    }

    return (
        <div className="container" style={{ position: 'relative' }}>
            {/* Glass Header */}
            <div className="glass" style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 40,
                borderRadius: '0 0 24px 24px' /* Rounded header bottom */
            }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Clinic</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', lineHeight: 1 }}>{clinicInfo.name}</div>
                </div>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isOnline ? '#D1FAE5' : '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isOnline ? 'var(--secondary)' : 'var(--text-light)' }} />
                </div>
            </div>

            {!isOnline && (
                <div style={{ background: '#334155', color: 'white', textAlign: 'center', padding: '6px', fontSize: '0.8rem', fontWeight: 500 }}>
                    <WifiOff size={12} style={{ display: 'inline', marginRight: '6px' }} />
                    Offline Mode - Changes saved locally
                </div>
            )}

            {/* Main Content */}
            <div className="animate-fade-in" style={{ padding: '20px' }}>
                {children}
            </div>

            {/* Floating Island Bottom Nav */}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '400px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 24px',
                zIndex: 50,
                border: '1px solid rgba(255, 255, 255, 0.5)'
            }}>
                <NavItem to="/dashboard" icon={Home} label="Home" />
                <NavItem to="/patients" icon={Users} label="Patients" />
                <NavItem to="/settings" icon={Settings} label="Settings" />
            </div>
        </div>
    )
}
