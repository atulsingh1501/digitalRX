import React, { useState, useEffect } from 'react'
import { Save, Trash2, Database, Smartphone, Loader, CheckCircle, PowerOff } from 'lucide-react'
import Layout from '../components/Layout'
import { storage } from '../services/storage'

export default function Settings() {
    const [clinic, setClinic] = useState({
        doctor: '', qualification: '', regNumber: '', specialization: '',
        name: '', phone: '', address: '', email: '', whatsapp: ''
    })

    const [waStatus, setWaStatus] = useState('LOADING') // LOADING, DISCONNECTED, WAITING_FOR_SCAN, CONNECTED, ERROR
    const [waQr, setWaQr] = useState(null)
    const [waInfo, setWaInfo] = useState(null)

    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001'

    useEffect(() => {
        const info = storage.getClinicInfo()
        setClinic(prev => ({ ...prev, ...info }))
    }, [])

    useEffect(() => {
        const interval = setInterval(checkWaStatus, 3000)
        checkWaStatus()
        return () => clearInterval(interval)
    }, [])

    const checkWaStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/api/whatsapp/status`)
            const data = await res.json()
            setWaStatus(data.status)
            setWaQr(data.qr)
            setWaInfo(data.info)
        } catch (err) {
            setWaStatus('ERROR')
        }
    }

    const handleWaLogout = async () => {
        try {
            setWaStatus('LOADING')
            await fetch(`${API_URL}/api/whatsapp/logout`, { method: 'POST' })
            checkWaStatus()
        } catch (err) {
            console.error(err)
        }
    }

    const handleSave = () => {
        storage.saveClinicInfo(clinic)
        alert('Settings saved!')
    }

    const set = (k) => (e) => setClinic(prev => ({ ...prev, [k]: e.target.value }))

    const inp = { width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B', background: 'white', boxSizing: 'border-box', margin: 0 }
    const lbl = { display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 500, color: '#64748B' }
    const section = { background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF2', marginBottom: '20px' }

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1E293B' }}>Settings</h1>
                <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', background: '#2563EB', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    <Save size={16} /> Save Changes
                </button>
            </div>

            {/* Backend WhatsApp Setup */}
            <div style={{...section, border: '1px solid #22C55E', background: '#F0FDF4'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Smartphone size={18} /> Backend WhatsApp Connection
                        </h2>
                        <p style={{ margin: '0 0 20px', fontSize: '0.82rem', color: '#15803D' }}>
                            Scan this to enable sending prescriptions silently directly to your patients without opening WhatsApp.
                        </p>
                    </div>
                </div>
                
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {waStatus === 'LOADING' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.9rem', fontWeight: 500 }}>
                            <Loader size={18} className="animate-spin" /> Verifying backend connection...
                        </div>
                    )}
                    {waStatus === 'ERROR' && (
                        <div style={{ color: '#EF4444', fontSize: '0.9rem', fontWeight: 500 }}>
                            Could not connect to backend server. Make sure `node server.js` is running in the `backend/` folder!
                        </div>
                    )}
                    {(waStatus === 'STARTING' || waStatus === 'DISCONNECTED') && !waQr && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.9rem', fontWeight: 500 }}>
                            <Loader size={18} className="animate-spin" /> Starting WhatsApp Core... This can take up to 20 seconds.
                        </div>
                    )}
                    {waStatus === 'WAITING_FOR_SCAN' && waQr && (
                        <>
                            <div style={{ width: '160px', height: '160px', borderRadius: '8px', overflow: 'hidden', background: '#F8FAFC', padding: '10px', border: '1px solid #E2E8F0' }}>
                                <img src={waQr} alt="WhatsApp QR Code" style={{ width: '100%', height: '100%', display: 'block' }} />
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 600, color: '#1E293B' }}>Link your Doctor WhatsApp</h3>
                                <ol style={{ margin: 0, paddingLeft: '20px', color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6, fontWeight: 500 }}>
                                    <li>Open WhatsApp on your phone</li>
                                    <li>Tap Menu or Settings and select <b>Linked Devices</b></li>
                                    <li>Tap on <b>Link a Device</b></li>
                                    <li>Scan this QR code with your phone</li>
                                </ol>
                            </div>
                        </>
                    )}
                    {waStatus === 'CONNECTED' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E' }}>
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1E293B' }}>WhatsApp Connected Successfully</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>Account: {waInfo?.pushname || 'Doctor'} ({waInfo?.wid?.user})</div>
                                </div>
                            </div>
                            <button onClick={handleWaLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: '#FFF1F2', color: '#EF4444', border: '1px solid #FECACA', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                <PowerOff size={15} /> Disconnect
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Doctor Profile */}
            <div style={section}>
                <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600, color: '#1E293B' }}>Doctor Profile</h2>
                <p style={{ margin: '0 0 20px', fontSize: '0.82rem', color: '#64748B' }}>These details will appear on the prescription header</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div><label style={lbl}>Doctor Name</label><input value={clinic.doctor} onChange={set('doctor')} style={inp} /></div>
                    <div><label style={lbl}>Qualification</label><input value={clinic.qualification || ''} onChange={set('qualification')} placeholder="MBBS, MD (Medicine)" style={inp} /></div>
                    <div><label style={lbl}>Registration Number</label><input value={clinic.regNumber || ''} onChange={set('regNumber')} placeholder="REG-12345" style={inp} /></div>
                    <div><label style={lbl}>Specialization</label><input value={clinic.specialization || ''} onChange={set('specialization')} placeholder="General Physician" style={inp} /></div>
                </div>
            </div>

            {/* Clinic Details */}
            <div style={section}>
                <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600, color: '#1E293B' }}>Clinic Details</h2>
                <p style={{ margin: '0 0 20px', fontSize: '0.82rem', color: '#64748B' }}>Clinic information for the header</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div><label style={lbl}>Clinic Name</label><input value={clinic.name} onChange={set('name')} style={inp} /></div>
                    <div><label style={lbl}>Phone</label><input value={clinic.phone || ''} onChange={set('phone')} style={inp} /></div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={lbl}>Clinic Address</label>
                        <textarea value={clinic.address || ''} onChange={set('address')} rows={2} style={{ ...inp, resize: 'vertical' }} />
                    </div>
                    <div><label style={lbl}>Email</label><input type="email" value={clinic.email || ''} onChange={set('email')} placeholder="clinic@email.com" style={inp} /></div>
                    <div>
                        <label style={lbl}>Public WhatsApp Number (QR)</label>
                        <input value={clinic.whatsapp || ''} onChange={set('whatsapp')} placeholder="+919876543210" style={inp} />
                        <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#94A3B8' }}>Used to generate the QR code on the PDF footer</div>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div style={{ ...section, border: '1px solid #FECACA' }}>
                <h2 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={18} /> Data Management
                </h2>
                <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748B' }}>
                    Clear all stored patients and consultation history. This action permanently deletes data from this device and cannot be undone.
                </p>
                <button onClick={() => { if (window.confirm('Delete ALL data? This cannot be undone.')) { localStorage.clear(); window.location.href = '/' } }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '8px', background: '#FFF1F2', color: '#EF4444', border: '1px solid #FECACA', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    <Trash2 size={16} /> Reset App Data
                </button>
            </div>
        </Layout>
    )
}
