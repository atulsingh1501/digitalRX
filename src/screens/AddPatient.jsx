import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'
import Layout from '../components/Layout'
import Input from '../components/Input'
import Button from '../components/Button'
import { storage } from '../services/storage'

export default function AddPatient() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        age: '',
        gender: 'Male',
        notes: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.name) return

        // Save patient
        const patientId = storage.savePatient({
            id: crypto.randomUUID(),
            ...formData,
            createdAt: Date.now()
        })

        // Redirect to consultation
        navigate(`/consultation/${patientId}`)
    }

    return (
        <Layout>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0, marginRight: '16px', cursor: 'pointer', color: 'var(--text-main)' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>New Patient</h1>
            </div>

            <form onSubmit={handleSubmit} className="card animate-slide-up" style={{ padding: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <UserPlus size={32} color="var(--primary)" />
                    </div>
                </div>

                <Input
                    label="Full Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. John Doe"
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Input
                        label="Age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Years"
                    />

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '14px 16px', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', background: 'white', color: 'var(--text-main)' }}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91..."
                />

                <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Optional Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Allergies, chronic conditions..."
                        style={{ border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', width: '100%', padding: '14px 16px', fontFamily: 'var(--font-body)' }}
                    />
                </div>

                <Button type="submit" className="btn-primary">
                    <Save size={20} style={{ marginRight: '8px' }} />
                    Save & Start Consultation
                </Button>
            </form>
        </Layout>
    )
}
