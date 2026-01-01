import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Calendar, Users, ChevronRight, Stethoscope } from 'lucide-react'
import Layout from '../components/Layout'
import { storage } from '../services/storage'

export default function Dashboard() {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')

    const patientsCount = storage.getPatients().length
    const consultations = storage.getConsultations()
    const today = new Date().setHours(0, 0, 0, 0)
    const todayConsults = consultations.filter(c => c.date >= today).length

    return (
        <Layout>
            {/* Hero Search */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>
                    Good Morning,<br />
                    <span style={{ color: 'var(--primary)' }}>Dr. {storage.getClinicInfo().doctor.split(' ')[0] || 'Doctor'}</span>
                </h2>

                <div style={{ position: 'relative', boxShadow: '0 8px 20px -4px rgba(0,0,0,0.08)', borderRadius: '16px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--primary)' }} />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            paddingLeft: '50px',
                            marginBottom: 0,
                            border: 'none',
                            height: '52px',
                            borderRadius: '16px',
                            fontSize: '1rem'
                        }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid-cols-responsive" style={{ marginBottom: '32px', gap: '16px' }}>

                {/* Patients Card */}
                <div className="card" onClick={() => navigate('/patients')} style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '140px',
                    cursor: 'pointer'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{patientsCount}</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '4px' }}>Total Patients</div>
                    </div>
                </div>

                {/* Visits Card */}
                <div className="card" style={{
                    background: 'white',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '140px'
                }}>
                    <div style={{ background: '#ECFDF5', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={20} color="var(--secondary)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, color: 'var(--text-main)' }}>{todayConsults}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Visits Today</div>
                    </div>
                </div>

            </div>

            {/* CTA Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Quick Actions</h3>
            </div>

            <button className="card" onClick={() => navigate('/patients/new')} style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderLeft: '4px solid var(--primary)',
                cursor: 'pointer'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'var(--primary-soft)', padding: '12px', borderRadius: '12px' }}>
                        <Plus size={24} color="var(--primary)" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Add New Patient</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Register and start visit</div>
                    </div>
                </div>
                <ChevronRight size={20} color="#CBD5E1" />
            </button>

            {/* Recent Activity Mock */}
            <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Waiting List</h3>
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '16px', border: '1px dashed #E2E8F0' }}>
                    <Stethoscope size={32} color="#CBD5E1" style={{ marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
                    <div style={{ color: 'var(--text-secondary)' }}>No patients currently waiting</div>
                </div>
            </div>

        </Layout>
    )
}
