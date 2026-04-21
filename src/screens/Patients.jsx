import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, ClipboardList, Trash2, UserPlus } from 'lucide-react'
import Layout from '../components/Layout'
import { storage } from '../services/storage'

export default function Patients() {
    const navigate = useNavigate()
    const [patients, setPatients] = useState([])
    const [search, setSearch] = useState('')

    const load = () => setPatients(storage.getPatients())
    useEffect(() => { load() }, [])

    const filtered = patients.filter(p => {
        if (!search) return true
        const q = search.toLowerCase()
        return p.name.toLowerCase().includes(q) || (p.phone && p.phone.includes(q))
    })

    const handleDelete = (id) => {
        if (window.confirm('Delete this patient and all their records? This cannot be undone.')) {
            const updPatients = storage.getPatients().filter(p => p.id !== id)
            localStorage.setItem('doct_app_patients', JSON.stringify(updPatients))
            const updConsults = storage.getConsultations().filter(c => c.patientId !== id)
            localStorage.setItem('doct_app_consultations', JSON.stringify(updConsults))
            load()
        }
    }

    const iBtn = (bg, color) => ({
        width: '30px', height: '30px', borderRadius: '6px', background: bg,
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color
    })

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1E293B' }}>Patients</h1>
                <button onClick={() => navigate('/patients/new')} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '8px', background: '#2563EB', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    <UserPlus size={16} /> Register New
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E8EDF2', overflow: 'hidden' }}>
                {/* Search */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8EDF2' }}>
                    <div style={{ position: 'relative', maxWidth: '340px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '36px', paddingRight: '12px', height: '38px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.875rem', width: '100%', outline: 'none', background: '#F8FAFC', fontFamily: 'inherit', color: '#1E293B' }}
                        />
                    </div>
                </div>

                {/* Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#F8FAFC' }}>
                            {['Patient Name', 'Age / Gender', 'Phone', 'Address', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
                                    {search ? 'No patients match your search' : 'No patients registered yet'}
                                </td>
                            </tr>
                        ) : filtered.map(p => (
                            <tr key={p.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '13px 20px', fontWeight: 500, fontSize: '0.9rem' }}>
                                    <span onClick={() => navigate(`/patients/${p.id}`)} style={{ cursor: 'pointer', color: '#2563EB' }}>{p.name}</span>
                                </td>
                                <td style={{ padding: '13px 20px', color: '#64748B', fontSize: '0.875rem' }}>{p.age} / {p.gender?.charAt(0) || 'M'}</td>
                                <td style={{ padding: '13px 20px', color: '#2563EB', fontSize: '0.875rem' }}>{p.phone || '—'}</td>
                                <td style={{ padding: '13px 20px', color: '#64748B', fontSize: '0.875rem' }}>{p.address || '—'}</td>
                                <td style={{ padding: '13px 20px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button title="View History" onClick={() => navigate(`/patients/${p.id}`)} style={iBtn('#EFF6FF', '#2563EB')}><Eye size={15} /></button>
                                        <button title="New Rx for Patient" onClick={() => {
                                            sessionStorage.setItem('prefill_phone', p.phone || '')
                                            navigate('/new-rx')
                                        }} style={iBtn('#F0FDF4', '#22C55E')}><ClipboardList size={15} /></button>
                                        <button title="Delete Patient" onClick={() => handleDelete(p.id)} style={iBtn('#FFF1F2', '#EF4444')}><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    )
}
