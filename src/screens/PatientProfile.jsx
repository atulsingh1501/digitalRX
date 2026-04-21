import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Calendar, ClipboardList, MapPin, Search } from 'lucide-react'
import Layout from '../components/Layout'
import { storage } from '../services/storage'

export default function PatientProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [patient, setPatient] = useState(null)
    const [history, setHistory] = useState([])

    useEffect(() => {
        const p = storage.getPatient(id)
        if (p) {
            setPatient(p)
            setHistory(storage.getConsultations().filter(c => c.patientId === id).sort((a, b) => b.date - a.date))
        } else {
            navigate('/patients')
        }
    }, [id, navigate])

    if (!patient) return null

    const handleNewRx = () => {
        sessionStorage.setItem('prefill_phone', patient.phone || '')
        navigate('/new-rx')
    }

    return (
        <Layout>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate('/patients')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={22} />
                    </button>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>Patient Profile</h1>
                </div>
                <button onClick={handleNewRx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', background: '#2563EB', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    <ClipboardList size={16} /> New Prescription
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '20px' }}>
                
                {/* Left Col - Patient Details */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF2', alignSelf: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem', color: '#2563EB', flexShrink: 0 }}>
                            {patient.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>{patient.name}</h2>
                            <div style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '2px' }}>{patient.age} years, {patient.gender}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <Phone size={16} color="#94A3B8" style={{ marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone Number</div>
                                <div style={{ fontSize: '0.95rem', color: '#1E293B', fontWeight: 500, marginTop: '2px' }}>{patient.phone || 'Not provided'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <MapPin size={16} color="#94A3B8" style={{ marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Address</div>
                                <div style={{ fontSize: '0.95rem', color: '#1E293B', fontWeight: 500, marginTop: '2px', lineHeight: 1.4 }}>{patient.address || 'Not provided'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <Calendar size={16} color="#94A3B8" style={{ marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Registered On</div>
                                <div style={{ fontSize: '0.95rem', color: '#1E293B', fontWeight: 500, marginTop: '2px' }}>{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Unknown'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col - Visit History */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF2' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>Consultation History</h3>
                    
                    {history.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
                            <Search size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>No consultations yet</div>
                            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Once a prescription is created, it will appear here.</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {history.map(visit => (
                                <div key={visit.id} onClick={() => navigate(`/prescription/${visit.id}`)} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #F1F5F9', cursor: 'pointer', transition: 'all 0.15s ease', background: '#F8FAFC' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '1rem', color: '#1E293B' }}>{visit.diagnosis || 'General Checkup'}</div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>{new Date(visit.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(visit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                                        {visit.medicines?.length > 0 ? (
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                                                {visit.medicines.length} medicine{visit.medicines.length !== 1 ? 's' : ''} prescribed
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94A3B8' }} />
                                                No medicines prescribed
                                            </div>
                                        )}
                                        {visit.followUp && (
                                            <div style={{ marginTop: '6px', color: '#F59E0B', fontWeight: 500, fontSize: '0.8rem' }}>
                                                Follow up: {new Date(visit.followUp).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}
