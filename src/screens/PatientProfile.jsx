import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Calendar, Plus, Clock, FileText } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/Button'
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
            setHistory(storage.getConsultations(id))
        } else {
            navigate('/patients')
        }
    }, [id, navigate])

    if (!patient) return null

    return (
        <Layout>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0, marginRight: '16px', cursor: 'pointer', color: 'var(--text-main)' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Patient Stats</h1>
            </div>

            <div className="card animate-fade-in" style={{ padding: '24px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{patient.name}</h2>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '1rem' }}>
                            {patient.gender}, {patient.age} years
                        </div>
                        {patient.phone && (
                            <a href={`tel:${patient.phone}`} style={{ display: 'flex', alignItems: 'center', marginTop: '12px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                                <div style={{ padding: '8px', background: 'var(--primary-soft)', borderRadius: '8px', marginRight: '8px' }}>
                                    <Phone size={16} />
                                </div>
                                {patient.phone}
                            </a>
                        )}
                    </div>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '24px',
                        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 700, color: 'var(--primary)'
                    }}>
                        {patient.name.charAt(0)}
                    </div>
                </div>
                {patient.notes && (
                    <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', borderLeft: '3px solid var(--text-light)' }}>
                        <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-main)' }}>Notes:</strong> {patient.notes}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Visit History</h3>
                <span className="badge badge-blue">{history.length} Visits</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
                {history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                        <Clock size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No previous consultations</p>
                    </div>
                ) : (
                    history.map(visit => (
                        <div key={visit.id} className="card" onClick={() => navigate(`/prescription/${visit.id}`)} style={{ marginBottom: 0, cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>
                                    <Calendar size={16} style={{ marginRight: '8px' }} />
                                    {new Date(visit.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                    {new Date(visit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '1.1rem' }}>{visit.diagnosis || 'General Checkup'}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                                <FileText size={14} style={{ marginRight: '6px' }} />
                                {visit.medicines?.length > 0 ? `${visit.medicines.length} medicines prescribed` : 'No medicines'}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button className="fab" onClick={() => navigate(`/consultation/${patient.id}`)}>
                <Plus size={28} />
            </button>

        </Layout>
    )
}
