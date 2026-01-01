import React, { useState, useEffect } from 'react'
import { ArrowLeft, Save, Trash2, Database } from 'lucide-react'
import Layout from '../components/Layout'
import Input from '../components/Input'
import Button from '../components/Button'
import { storage } from '../services/storage'

export default function Settings() {
    const [clinic, setClinic] = useState({ name: '', doctor: '', phone: '' })

    useEffect(() => {
        setClinic(storage.getClinicInfo())
    }, [])

    const handleSave = () => {
        storage.saveClinicInfo(clinic)
        alert('Settings saved!')
    }

    const handleReset = () => {
        if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
            localStorage.clear()
            window.location.href = '/'
        }
    }

    return (
        <Layout>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px' }}>Settings</h1>

            <section className="card animate-slide-up">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: 'var(--primary)' }}>Clinic Details</h2>

                <Input
                    label="Clinic/Hospital Name"
                    value={clinic.name}
                    onChange={e => setClinic({ ...clinic, name: e.target.value })}
                />

                <Input
                    label="Doctor Name"
                    value={clinic.doctor}
                    onChange={e => setClinic({ ...clinic, doctor: e.target.value })}
                />

                <Input
                    label="Phone / Header Contact"
                    value={clinic.phone}
                    onChange={e => setClinic({ ...clinic, phone: e.target.value })}
                />

                <Button onClick={handleSave} style={{ marginTop: '16px' }}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    Save Settings
                </Button>
            </section>

            <section className="card" style={{ borderColor: 'var(--accent)', borderWidth: '1px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                    <Database size={20} style={{ marginRight: '8px' }} />
                    Data Management
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Clear all stored patients and consultation history. This action deletes data from this device.
                </p>

                <Button variant="secondary" onClick={handleReset} style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                    <Trash2 size={18} style={{ marginRight: '8px' }} />
                    Reset App Data
                </Button>
            </section>
        </Layout>
    )
}
