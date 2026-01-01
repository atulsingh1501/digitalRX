import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, User, ChevronRight } from 'lucide-react'
import Layout from '../components/Layout'
import { storage } from '../services/storage'

export default function Patients() {
    const navigate = useNavigate()
    const [patients, setPatients] = useState([])
    const [filtered, setFiltered] = useState([])
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        const data = storage.getPatients()
        setPatients(data)
        setFiltered(data)
    }, [])

    useEffect(() => {
        let result = patients
        if (search) {
            const q = search.toLowerCase()
            result = result.filter(p => p.name.toLowerCase().includes(q) || (p.phone && p.phone.includes(q)))
        }
        setFiltered(result)
    }, [search, patients])

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Patients</h1>
                <button onClick={() => navigate('/patients/new')} style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)'
                }}>
                    <Plus size={24} />
                </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-light)' }} />
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: '48px', marginBottom: 0, borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filtered.map(patient => (
                    <div
                        key={patient.id}
                        className="card"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 0,
                            padding: '16px',
                            cursor: 'pointer',
                            borderLeft: 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                fontWeight: 700,
                                fontSize: '1.1rem'
                            }}>
                                {patient.name.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>{patient.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    {patient.gender}, {patient.age}y • {patient.phone}
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={20} color="#CBD5E1" />
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
                        <User size={48} style={{ margin: '0 auto 16px', color: '#CBD5E1' }} />
                        <p>No patients found</p>
                    </div>
                )}
            </div>
        </Layout>
    )
}
