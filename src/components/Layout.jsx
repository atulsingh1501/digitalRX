import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, UserPlus, ClipboardList, Settings } from 'lucide-react'
import { storage } from '../services/storage'

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/patients/new', icon: UserPlus, label: 'Add Patient' },
    { to: '/new-rx', icon: ClipboardList, label: 'New Rx' },
    { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout({ children }) {
    const location = useLocation()
    const clinic = storage.getClinicInfo()
    const isOnline = navigator.onLine

    const isActive = (to) => {
        if (to === '/dashboard') return location.pathname === '/dashboard'
        if (to === '/patients/new') return location.pathname === '/patients/new'
        if (to === '/patients') return location.pathname === '/patients' || (location.pathname.startsWith('/patients/') && location.pathname !== '/patients/new')
        return location.pathname === to || location.pathname.startsWith(to + '/')
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Sidebar */}
            <aside style={{
                width: '168px', background: 'white', borderRight: '1px solid #E8EDF2',
                display: 'flex', flexDirection: 'column',
                position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
                padding: '0 10px', boxShadow: '2px 0 8px rgba(0,0,0,0.04)'
            }}>
                {/* Logo */}
                <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '18px 6px 14px', borderBottom: '1px solid #F1F5F9', marginBottom: '10px' }}>
                    <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>Rx</div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>Digital Rx</span>
                </Link>

                {/* Nav */}
                <nav style={{ flex: 1 }}>
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                        const active = isActive(to)
                        return (
                            <Link key={to} to={to} style={{
                                display: 'flex', alignItems: 'center', gap: '9px',
                                padding: '9px 10px', borderRadius: '8px', textDecoration: 'none',
                                color: active ? '#2563EB' : '#64748B',
                                background: active ? '#EFF6FF' : 'transparent',
                                fontWeight: active ? 600 : 400, fontSize: '0.875rem',
                                marginBottom: '3px', transition: 'all 0.15s ease'
                            }}>
                                <Icon size={17} strokeWidth={active ? 2.5 : 2} />
                                {label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div style={{ padding: '12px 6px 18px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Logged in as</div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1E293B' }}>{clinic.doctor || 'Doctor'}</div>
                </div>
            </aside>

            {/* Main */}
            <div style={{ marginLeft: '168px', flex: 1, background: '#F1F5F9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* Top bar */}
                <div style={{ background: 'white', borderBottom: '1px solid #E8EDF2', padding: '8px 28px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: isOnline ? '#22C55E' : '#94A3B8' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#22C55E' : '#94A3B8' }} />
                        {isOnline ? 'Online' : 'Offline'}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '28px 32px' }}>
                    {children}
                </div>
            </div>
        </div>
    )
}
