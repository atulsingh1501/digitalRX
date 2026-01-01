import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, MicOff, Plus, Trash2, Save, Share, ChevronDown, ChevronUp, Check } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Input from '../components/Input'
import { storage } from '../services/storage'

const MOCK_MEDS = ['Paracetamol', 'Amoxicillin', 'Ibuprofen', 'Cetirizine', 'Metformin', 'Amlodipine']
const MOCK_DIAGNOSES = ['Viral Fever', 'Hypertension', 'Type 2 Diabetes', 'Acute Bronchitis', 'Migraine']
const DOSES = ['1-0-1', '1-0-0', '0-0-1', '1-1-1', 'SOS']
const DURATIONS = ['3 days', '5 days', '7 days', '10 days', '1 month']

export default function Consultation() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [patient, setPatient] = useState(null)
    const [expandedPatient, setExpandedPatient] = useState(false)
    const [listening, setListening] = useState(false)

    // Consultation State
    const [complaint, setComplaint] = useState('')
    const [vitals, setVitals] = useState({ bp: '', pulse: '', weight: '', sugar: '' })
    const [diagnosis, setDiagnosis] = useState('')
    const [medicines, setMedicines] = useState([])
    const [notes, setNotes] = useState('')
    const [followUp, setFollowUp] = useState('')
    const [showDiagnosisSuggestions, setShowDiagnosisSuggestions] = useState(false)

    // Load Patient
    useEffect(() => {
        const p = storage.getPatient(id)
        if (p) setPatient(p)
        else navigate('/dashboard')
    }, [id, navigate])

    // Voice Input Helper
    const toggleVoice = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognition) {
            alert('Voice input not supported in this browser')
            return
        }

        if (listening) {
            setListening(false)
        } else {
            const recognition = new SpeechRecognition()
            recognition.continuous = false
            recognition.lang = 'en-US'
            recognition.interimResults = false

            recognition.onstart = () => setListening(true)
            recognition.onend = () => setListening(false)
            recognition.onresult = (event) => {
                const transcript = event.results?.[0]?.[0]?.transcript
                if (transcript) {
                    setComplaint(prev => (prev ? prev + ' ' : '') + transcript)
                }
            }
            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error)
                setListening(false)
            }
            try { recognition.start() } catch (err) { console.error(err) }
        }
    }

    // Prescription Logic
    const addMedicine = () => {
        setMedicines([...medicines, { id: Date.now(), name: '', dose: '1-0-1', duration: '3 days', notes: '' }])
    }

    const updateMedicine = (index, field, value) => {
        const updated = [...medicines]
        updated[index][field] = value
        setMedicines(updated)
    }

    const removeMedicine = (index) => {
        const updated = [...medicines]
        updated.splice(index, 1)
        setMedicines(updated)
    }

    const handleSave = (andShare = false) => {
        if (!diagnosis && medicines.length === 0) {
            alert('Please enter at least a diagnosis or one medicine')
            return
        }

        const consultationData = {
            id: crypto.randomUUID(),
            patientId: id,
            date: Date.now(),
            complaint,
            vitals,
            diagnosis,
            medicines,
            notes,
            followUp
        }

        storage.saveConsultation(consultationData)

        if (andShare) {
            navigate(`/prescription/${consultationData.id}`)
        } else {
            navigate('/dashboard')
        }
    }

    if (!patient) return null

    return (
        <Layout>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0, marginRight: '16px', cursor: 'pointer', color: 'var(--text-main)' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1 }} onClick={() => setExpandedPatient(!expandedPatient)}>
                    <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                        {patient.name}
                        {expandedPatient ? <ChevronUp size={16} style={{ marginLeft: '6px' }} /> : <ChevronDown size={16} style={{ marginLeft: '6px' }} />}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {patient.gender}, {patient.age}y
                    </div>
                </div>
                <button onClick={() => handleSave(false)} style={{ background: 'var(--primary-soft)', border: 'none', padding: '8px 12px', borderRadius: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                    Draft
                </button>
            </div>

            {expandedPatient && (
                <div className="card animate-fade-in" style={{ background: 'var(--bg-main)', border: '1px solid #E2E8F0' }}>
                    <div style={{ marginBottom: '8px' }}><strong>Phone:</strong> {patient.phone}</div>
                    <div style={{ color: 'var(--text-secondary)' }}><strong>Notes:</strong> {patient.notes || 'None'}</div>
                </div>
            )}

            {/* Sections */}
            <div style={{ paddingBottom: '120px' }}>

                {/* Chief Complaint */}
                <section className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                        <label style={{ fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Chief Complaint</label>
                        <button onClick={toggleVoice} className={listening ? 'animate-pulse' : ''} style={{ background: listening ? 'var(--accent)' : 'var(--bg-main)', border: '1px solid #E2E8F0', color: listening ? 'white' : 'var(--text-secondary)', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}>
                            {listening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                    </div>
                    <textarea
                        className="input"
                        value={complaint}
                        onChange={e => setComplaint(e.target.value)}
                        placeholder={listening ? "Listening..." : "e.g. Fever for 3 days, body pain..."}
                        rows={3}
                        style={{ width: '100%', marginBottom: 0, borderColor: listening ? 'var(--accent)' : '#E2E8F0', padding: '16px', lineHeight: 1.6 }}
                    />
                </section>

                {/* Vitals */}
                <section className="card">
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Vitals</h3>
                    <div className="grid-cols-responsive">
                        <Input label="BP" placeholder="120/80" value={vitals.bp} onChange={e => setVitals({ ...vitals, bp: e.target.value })} className="mb-0" />
                        <Input label="Pulse" placeholder="72" type="number" value={vitals.pulse} onChange={e => setVitals({ ...vitals, pulse: e.target.value })} className="mb-0" />
                        <Input label="Weight (kg)" placeholder="70" type="number" value={vitals.weight} onChange={e => setVitals({ ...vitals, weight: e.target.value })} className="mb-0" />
                        <Input label="Sugar" placeholder="mg/dL" value={vitals.sugar} onChange={e => setVitals({ ...vitals, sugar: e.target.value })} className="mb-0" />
                    </div>
                </section>

                {/* Diagnosis */}
                <section className="card" style={{ overflow: 'visible' }}>
                    <label style={{ display: 'block', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em', fontSize: '0.8rem' }}>Diagnosis</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={diagnosis}
                            onChange={e => { setDiagnosis(e.target.value); setShowDiagnosisSuggestions(true); }}
                            onFocus={() => setShowDiagnosisSuggestions(true)}
                            placeholder="Type to search..."
                            style={{ width: '100%', marginBottom: 0, paddingLeft: '40px' }}
                        />
                        <div style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-light)' }}>
                            <Check size={18} />
                        </div>
                        {showDiagnosisSuggestions && diagnosis && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', zIndex: 20, maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-lg)', marginTop: '8px' }}>
                                {MOCK_DIAGNOSES.filter(d => d.toLowerCase().includes(diagnosis.toLowerCase())).map(d => (
                                    <div
                                        key={d}
                                        onClick={() => { setDiagnosis(d); setShowDiagnosisSuggestions(false); }}
                                        style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9' }}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Prescription */}
                <section className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Prescription</h3>
                        <button onClick={addMedicine} style={{ background: 'var(--primary-soft)', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>
                            + Add Med
                        </button>
                    </div>

                    {medicines.map((med, index) => (
                        <div key={med.id} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <div style={{ flex: '2 1 200px', position: 'relative' }}>
                                    <input
                                        placeholder="Medicine Name"
                                        value={med.name}
                                        onChange={e => updateMedicine(index, 'name', e.target.value)}
                                        style={{ width: '100%', marginBottom: 0, fontWeight: 600 }}
                                        list={`meds-${index}`}
                                    />
                                    <datalist id={`meds-${index}`}>
                                        {MOCK_MEDS.map(m => <option key={m} value={m} />)}
                                    </datalist>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', flex: '1 1 250px' }}>
                                    <select
                                        value={med.dose}
                                        onChange={e => updateMedicine(index, 'dose', e.target.value)}
                                        style={{ marginBottom: 0, background: 'white', fontSize: '0.9rem', flex: 1 }}
                                    >
                                        {DOSES.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select
                                        value={med.duration}
                                        onChange={e => updateMedicine(index, 'duration', e.target.value)}
                                        style={{ marginBottom: 0, background: 'white', fontSize: '0.9rem', flex: 1 }}
                                    >
                                        {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                <button onClick={() => removeMedicine(index)} style={{ background: 'white', border: '1px solid #FECACA', color: 'var(--accent)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {medicines.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem', padding: '20px', border: '2px dashed #E2E8F0', borderRadius: '12px' }}>No medicines added</div>}
                </section>

                {/* Follow Up & Notes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Follow Up</label>
                        <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} style={{ marginBottom: 0, border: 'none', background: '#F1F5F9', borderRadius: '8px' }} />
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Internal Notes</label>
                        <input type="text" placeholder="..." value={notes} onChange={e => setNotes(e.target.value)} style={{ marginBottom: 0, border: 'none', background: '#F1F5F9', borderRadius: '8px' }} />
                    </div>
                </div>

            </div>

            {/* Bottom Actions */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'white',
                borderTop: '1px solid #E2E8F0',
                padding: '16px 20px',
                display: 'flex',
                gap: '12px',
                zIndex: 100,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
            }}>
                <Button variant="secondary" onClick={() => handleSave(false)} style={{ flex: 1, padding: '16px', fontSize: '1rem' }}>
                    <Save size={20} style={{ marginRight: '8px' }} />
                    Save
                </Button>
                <Button onClick={() => handleSave(true)} style={{ flex: 2, padding: '16px', fontSize: '1rem' }}>
                    <Share size={20} style={{ marginRight: '8px' }} />
                    Save & Print Rx
                </Button>
            </div>

        </Layout>
    )
}
