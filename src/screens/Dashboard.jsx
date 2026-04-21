import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, CalendarClock, FileText, TrendingUp, TrendingDown, Plus, MessageCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { storage } from '../services/storage'
import { API_URL } from '../config'

export default function Dashboard() {
    const navigate = useNavigate()
    const patients = storage.getPatients()
    const allConsults = storage.getConsultations()
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const todayEnd = todayStart + 86400000
    const todayCount = allConsults.filter(c => c.date >= todayStart && c.date < todayEnd).length

    const pendingFU = allConsults.filter(c => {
        if (!c.followUp) return false
        const fu = new Date(c.followUp).setHours(0, 0, 0, 0)
        return fu >= todayStart
    })

    const curMonth = today.getMonth()
    const curYear = today.getFullYear()
    const prevMonth = curMonth === 0 ? 11 : curMonth - 1
    const prevYear = curMonth === 0 ? curYear - 1 : curYear

    const thisMonthRx = allConsults.filter(c => { const d = new Date(c.date); return d.getMonth() === curMonth && d.getFullYear() === curYear }).length
    const lastMonthRx = allConsults.filter(c => { const d = new Date(c.date); return d.getMonth() === prevMonth && d.getFullYear() === prevYear }).length
    const growth = lastMonthRx === 0 ? (thisMonthRx > 0 ? 100 : 0) : Math.round(((thisMonthRx - lastMonthRx) / lastMonthRx) * 100)

    const recent = [...allConsults].sort((a, b) => b.date - a.date).slice(0, 5)
    // Sort upcoming to show earliest pending follow-ups first
    const upcoming = [...pendingFU].sort((a, b) => new Date(a.followUp) - new Date(b.followUp)).slice(0, 5)

    const sendReminder = async (patient, consult) => {
        if (!patient.phone) {
            alert('No phone number found for this patient.')
            return
        }
        try {
            const clinic = storage.getClinicInfo()
            const msgDate = new Date(consult.followUp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
            const message = `Hello ${patient.name},\n\nThis is a gentle reminder from ${clinic.name || 'our clinic'} regarding your pending follow-up visit scheduled for ${msgDate}.\n\nPlease visit the clinic or reply to this message to reschedule.\n\n- ${clinic.doctor || 'Your Doctor'}`
            
            const res = await fetch(`${API_URL}/api/whatsapp/send-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: patient.phone, message })
            })
            const data = await res.json()
            if (data.success) {
                alert('Reminder sent successfully via WhatsApp!')
            } else {
                alert('Failed to send reminder: ' + data.error)
            }
        } catch (err) {
            console.error(err)
            alert('Failed to connect to backend server. Make sure node server.js is running.')
        }
    }

    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

    const stats = [
        { label: "Today's Patients", value: todayCount, Icon: Users, bg: '#EFF6FF', color: '#2563EB' },
        { label: 'Pending Follow-ups', value: pendingFU.length, Icon: CalendarClock, bg: '#FFFBEB', color: '#F59E0B' },
        { label: 'Total Rx Issued', value: allConsults.length, Icon: FileText, bg: '#F0FDF4', color: '#22C55E' },
        {
            label: 'Monthly Growth', value: `${growth >= 0 ? '+' : ''}${growth}%`,
            Icon: growth >= 0 ? TrendingUp : TrendingDown,
            bg: growth >= 0 ? '#F0FDF4' : '#FFF1F2', color: growth >= 0 ? '#22C55E' : '#EF4444'
        },
    ]

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1E293B' }}>Dashboard</h1>
                <span style={{ color: '#64748B', fontSize: '0.875rem' }}>{dateStr}</span>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {stats.map(({ label, value, Icon, bg, color }) => (
                    <div key={label} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E8EDF2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ width: '40px', height: '40px', background: bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon size={20} color={color} />
                            </div>
                            <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Two-column panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Recent Patients */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E8EDF2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Recent Patients</h2>
                        <button onClick={() => navigate('/patients')} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, padding: 0 }}>View All</button>
                    </div>
                    {recent.length === 0 ? (
                        <div style={{ padding: '30px 0', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>No recent consultations</div>
                    ) : recent.map(c => {
                        const p = patients.find(x => x.id === c.patientId)
                        if (!p) return null
                        return (
                            <div key={c.id} onClick={() => navigate(`/prescription/${c.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F8FAFC', cursor: 'pointer' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', color: '#2563EB', flexShrink: 0 }}>
                                    {p.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 500, fontSize: '0.88rem', color: '#1E293B' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#22C55E', fontWeight: 500 }}>{c.diagnosis || 'General'}</div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{new Date(c.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'numeric', year: 'numeric' })}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Follow-ups */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E8EDF2', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600 }}>Upcoming Follow-ups</h2>
                    {upcoming.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', gap: '8px', padding: '20px 0' }}>
                            <CalendarClock size={32} style={{ opacity: 0.4 }} />
                            <span style={{ fontSize: '0.875rem' }}>No pending follow-ups</span>
                        </div>
                    ) : (
                        <div style={{ flex: 1 }}>
                            {upcoming.map(c => {
                                const p = patients.find(x => x.id === c.patientId)
                                return (
                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '0.88rem', color: '#1E293B' }}>{p?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: 500, marginTop: '2px' }}>Due: {new Date(c.followUp).toLocaleDateString('en-IN')}</div>
                                        </div>
                                        <button onClick={() => sendReminder(p, c)} title="Send WhatsApp Reminder" style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', color: '#16A34A', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <MessageCircle size={16} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <button onClick={() => navigate('/new-rx')} style={{ marginTop: '16px', padding: '11px', border: 'none', borderRadius: '8px', background: '#2563EB', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Plus size={15} /> Start New Consultation
                    </button>
                </div>
            </div>
        </Layout>
    )
}
