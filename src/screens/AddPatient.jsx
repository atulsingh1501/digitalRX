import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Layout from '../components/Layout'
import { storage } from '../services/storage'

export default function AddPatient() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ name: '', phone: '', age: '', gender: 'Male', address: '' })
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const errs = {}
        if (!formData.name.trim()) errs.name = 'Full name is required'
        if (!formData.age) errs.age = 'Age is required'
        if (Object.keys(errs).length) { setErrors(errs); return }

        const patientId = storage.savePatient({ ...formData, name: formData.name.trim() })
        navigate(`/patients/${patientId}`)
    }

    const inp = {
        width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px',
        fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B',
        background: 'white', boxSizing: 'border-box', margin: 0
    }
    const lbl = { display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 500, color: '#64748B' }

    return (
        <Layout>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={22} />
                </button>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>Register New Patient</h1>
            </div>

            <div style={{ maxWidth: '580px', background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #E8EDF2' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={lbl}>Full Name *</label>
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Rahul Verma" style={{ ...inp, borderColor: errors.name ? '#EF4444' : '#E2E8F0' }} />
                        {errors.name && <div style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '4px' }}>{errors.name}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                        <div>
                            <label style={lbl}>Age *</label>
                            <input name="age" type="number" value={formData.age} onChange={handleChange} placeholder="25" style={{ ...inp, borderColor: errors.age ? '#EF4444' : '#E2E8F0' }} />
                            {errors.age && <div style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '4px' }}>{errors.age}</div>}
                        </div>
                        <div>
                            <label style={lbl}>Gender *</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} style={inp}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                        <div>
                            <label style={lbl}>Phone Number</label>
                            <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="9876543210" style={inp} />
                        </div>
                        <div>
                            <label style={lbl}>Address</label>
                            <input name="address" value={formData.address} onChange={handleChange} placeholder="City, Area" style={inp} />
                        </div>
                    </div>

                    <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', borderRadius: '8px', background: '#2563EB', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                        <UserPlus size={18} /> Register Patient
                    </button>
                </form>
            </div>
        </Layout>
    )
}
