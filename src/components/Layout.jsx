import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, UserPlus, ClipboardList, Settings, Menu, X } from 'lucide-react'
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
    const [menuOpen, setMenuOpen] = useState(false)

    // Close sidebar when route changes on mobile
    useEffect(() => { setMenuOpen(false) }, [location.pathname])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [menuOpen])

    const isActive = (to) => {
        if (to === '/dashboard') return location.pathname === '/dashboard'
        if (to === '/patients/new') return location.pathname === '/patients/new'
        if (to === '/patients') return location.pathname === '/patients' || (location.pathname.startsWith('/patients/') && location.pathname !== '/patients/new')
        return location.pathname === to || location.pathname.startsWith(to + '/')
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

            {/* ── Mobile Overlay ── */}
            {menuOpen && (
                <div
                    onClick={() => setMenuOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                        zIndex: 99, display: 'none'
                    }}
                    className="mobile-overlay"
                />
            )}

            {/* ── Sidebar ── */}
            <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
                {/* Logo */}
                <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '18px 6px 14px', borderBottom: '1px solid #F1F5F9', marginBottom: '10px' }}>
                    <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>Rx</div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>Digital Rx</span>
                    {/* Close button on mobile */}
                    <button onClick={(e) => { e.preventDefault(); setMenuOpen(false) }} className="sidebar-close-btn">
                        <X size={20} color="#64748B" />
                    </button>
                </Link>

                {/* Nav */}
                <nav style={{ flex: 1 }}>
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                        const active = isActive(to)
                        return (
                            <Link key={to} to={to} style={{
                                display: 'flex', alignItems: 'center', gap: '9px',
                                padding: '11px 10px', borderRadius: '8px', textDecoration: 'none',
                                color: active ? '#2563EB' : '#64748B',
                                background: active ? '#EFF6FF' : 'transparent',
                                fontWeight: active ? 600 : 400, fontSize: '0.9rem',
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

            {/* ── Main Content ── */}
            <div className="main-content">
                {/* Top bar */}
                <div style={{ background: 'white', borderBottom: '1px solid #E8EDF2', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
                    {/* Hamburger (mobile only) */}
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="hamburger-btn"
                        aria-label="Open menu"
                    >
                        <Menu size={22} color="#374151" />
                    </button>

                    {/* Brand name on mobile */}
                    <span className="mobile-brand">Digital Rx</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: isOnline ? '#22C55E' : '#94A3B8' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#22C55E' : '#94A3B8' }} />
                        {isOnline ? 'Online' : 'Offline'}
                    </div>
                </div>

                {/* Page Content */}
                <div className="page-content">
                    {children}
                </div>
            </div>

            <style>{`
                /* ── Sidebar ── */
                .sidebar {
                    width: 168px;
                    background: white;
                    border-right: 1px solid #E8EDF2;
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top: 0; left: 0; bottom: 0;
                    z-index: 100;
                    padding: 0 10px;
                    box-shadow: 2px 0 8px rgba(0,0,0,0.04);
                    transition: transform 0.25s ease;
                }

                /* ── Main ── */
                .main-content {
                    margin-left: 168px;
                    flex: 1;
                    background: #F1F5F9;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .page-content {
                    flex: 1;
                    padding: 24px 28px;
                }

                /* Hide hamburger + mobile brand on desktop */
                .hamburger-btn { display: none; background: none; border: none; cursor: pointer; padding: 4px; border-radius: 8px; }
                .mobile-brand { display: none; font-weight: 700; font-size: 1rem; color: #1E293B; }
                .sidebar-close-btn { display: none; background: none; border: none; cursor: pointer; margin-left: auto; padding: 2px; }

                /* ── MOBILE ── */
                @media (max-width: 768px) {
                    .sidebar {
                        transform: translateX(-100%);
                        width: 220px;
                    }
                    .sidebar-open {
                        transform: translateX(0);
                    }
                    .sidebar-close-btn { display: flex; }
                    .mobile-overlay { display: block !important; }
                    .hamburger-btn { display: flex; align-items: center; justify-content: center; }
                    .mobile-brand { display: block; }
                    .main-content { margin-left: 0; }
                    .page-content { padding: 16px 14px; }
                }
            `}</style>
        </div>
    )
}
