import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer, MessageCircle, Save, Plus, Trash2, Search } from 'lucide-react'
import Layout from '../components/Layout'
import { storage } from '../services/storage'
import { API_URL } from '../config'

const DOSE_OPTIONS = ['1-0-1', '1-0-0', '0-0-1', '1-1-1', '0-1-0', '0-1-1', 'SOS', 'As directed']
const DURATION_OPTIONS = ['1 day', '3 days', '5 days', '7 days', '10 days', '14 days', '1 month', '2 months', 'Ongoing']

// ─── Medicine Autocomplete Component ─────────────────────────────────────────
function MedicineSearch({ value, onSelect, style }) {
    const [query, setQuery] = useState(value || '')
    const [results, setResults] = useState([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
    const debounceRef = useRef(null)
    const wrapRef = useRef(null)
    const inputRef = useRef(null)

    // Sync if parent resets
    useEffect(() => { setQuery(value || '') }, [value])

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Recalculate dropdown position when opened
    const calcPos = () => {
        if (!inputRef.current) return
        const rect = inputRef.current.getBoundingClientRect()
        setDropPos({ top: rect.bottom + window.scrollY + 2, left: rect.left + window.scrollX, width: rect.width })
    }

    const search = useCallback((q) => {
        clearTimeout(debounceRef.current)
        if (q.length < 2) { setResults([]); setOpen(false); return }
        setLoading(true)
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`${API_URL}/api/medicines/search?q=${encodeURIComponent(q)}`)
                const data = await res.json()
                setResults(data)
                if (data.length > 0) { calcPos(); setOpen(true) } else setOpen(false)
            } catch (_) { setResults([]) }
            finally { setLoading(false) }
        }, 250)
    }, [])

    const handleChange = (e) => {
        setQuery(e.target.value)
        onSelect({ name: e.target.value, strength: '', notes: '' })
        search(e.target.value)
    }

    const handlePick = (med) => {
        setQuery(med.name)
        setOpen(false)
        onSelect({ name: med.name, strength: med.strengths[0] || '', notes: med.notes || '', _strengths: med.strengths })
    }

    return (
        <div ref={wrapRef} style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
                <input
                    ref={inputRef}
                    value={query}
                    onChange={handleChange}
                    onFocus={() => { if (query.length >= 2 && results.length > 0) { calcPos(); setOpen(true) } }}
                    placeholder="Type medicine name..."
                    autoComplete="off"
                    style={{ ...style, paddingRight: '28px' }}
                />
                <Search size={13} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            </div>
            {open && (
                /* Fixed portal — escapes any overflow:hidden/auto parent */
                <div style={{
                    position: 'fixed',
                    top: dropPos.top,
                    left: dropPos.left,
                    width: Math.max(dropPos.width, 260),
                    zIndex: 9999,
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                    maxHeight: '260px',
                    overflowY: 'auto',
                }}>
                    {loading && <div style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#94A3B8' }}>Searching...</div>}
                    {!loading && results.map((med, i) => (
                        <div
                            key={i}
                            onMouseDown={() => handlePick(med)}
                            style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid #F8FAFC' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F0F9FF'}
                            onMouseLeave={e => e.currentTarget.style.background = 'white'}
                        >
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1E293B' }}>{med.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '1px' }}>
                                {med.category} &nbsp;·&nbsp; {med.strengths.join(', ')}
                            </div>
                        </div>
                    ))}
                    {!loading && results.length === 0 && query.length >= 2 && (
                        <div style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#94A3B8' }}>No results. Type the name manually.</div>
                    )}
                </div>
            )}
        </div>
    )
}


export default function NewRx() {
    const navigate = useNavigate()
    const [phone, setPhone] = useState('')
    const [patientName, setPatientName] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('Male')
    const [complaint, setComplaint] = useState('')
    const [diagnosis, setDiagnosis] = useState('')
    const [medicines, setMedicines] = useState([
        { id: Date.now(), name: '', strength: '', dose: '1-0-1', duration: '5 days', notes: '' }
    ])
    const [advice, setAdvice] = useState('')
    const [followUp, setFollowUp] = useState('')

    React.useEffect(() => {
        const prefill = sessionStorage.getItem('prefill_phone')
        if (prefill) {
            handlePhoneLookup(prefill)
            sessionStorage.removeItem('prefill_phone')
        }
    }, [])

    const handlePhoneLookup = (val) => {
        setPhone(val)
        const clean = val.replace(/\D/g, '')
        if (clean.length >= 10) {
            const patients = storage.getPatients()
            const found = patients.find(p => p.phone && p.phone.replace(/\D/g, '').includes(clean.slice(-10)))
            if (found) {
                setPatientName(found.name)
                setAge(found.age?.toString() || '')
                setGender(found.gender || 'Male')
            }
        }
    }

    const addMed = () => setMedicines(prev => [...prev, { id: Date.now(), name: '', strength: '', dose: '1-0-1', duration: '5 days', notes: '', _strengths: [] }])
    const updateMed = (idx, field, val) => setMedicines(prev => prev.map((m, i) => i === idx ? { ...m, [field]: val } : m))
    const updateMedFromSearch = (idx, picked) => setMedicines(prev => prev.map((m, i) => i === idx ? { ...m, ...picked } : m))
    const delMed = (idx) => setMedicines(prev => prev.filter((_, i) => i !== idx))

    const saveAndGetId = () => {
        if (!patientName.trim()) {
            alert('Please enter the patient name')
            return null
        }

        const patients = storage.getPatients()
        const cleanPhone = phone.replace(/\D/g, '')
        let patientId

        const existing = cleanPhone.length >= 10
            ? patients.find(p => p.phone && p.phone.replace(/\D/g, '').includes(cleanPhone.slice(-10)))
            : null

        if (existing) {
            patientId = existing.id
            storage.savePatient({ ...existing, name: patientName.trim(), age, gender, phone })
        } else {
            patientId = storage.savePatient({ name: patientName.trim(), age, gender, phone })
        }

        const consultId = crypto.randomUUID()
        storage.saveConsultation({
            id: consultId,
            patientId,
            date: Date.now(),
            complaint,
            vitals: {},
            diagnosis,
            medicines,
            notes: advice,
            followUp
        })
        return consultId
    }

    const handleSave = () => {
        const id = saveAndGetId()
        if (id) navigate(`/prescription/${id}`)
    }

    const handlePrint = () => {
        const id = saveAndGetId()
        if (id) {
            sessionStorage.setItem('rx_auto_action', 'print')
            navigate(`/prescription/${id}`)
        }
    }

    const handleWhatsApp = () => {
        const id = saveAndGetId()
        if (id) {
            sessionStorage.setItem('rx_auto_action', 'whatsapp')
            navigate(`/prescription/${id}`)
        }
    }

    const inp = {
        width: '100%', padding: '9px 13px', border: '1px solid #E2E8F0', borderRadius: '8px',
        fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B',
        background: 'white', boxSizing: 'border-box', margin: 0
    }
    const lbl = { display: 'block', marginBottom: '5px', fontSize: '0.78rem', fontWeight: 500, color: '#64748B' }
    const section = { background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E8EDF2', marginBottom: '16px' }

    return (
        <Layout>
            {/* Header + Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#1E293B' }}>New Prescription</h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', background: 'white', color: '#64748B', border: '1px solid #E2E8F0', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
                        <Printer size={15} /> Print
                    </button>
                    <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', background: '#2563EB', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                        <Save size={15} /> Save Rx
                    </button>
                    <button onClick={handleWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', background: '#25D366', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                        <MessageCircle size={15} /> WhatsApp
                    </button>
                </div>
            </div>

            {/* Patient Info */}
            <div style={section}>
                <div className="rx-patient-grid">
                    <div>
                        <label style={lbl}>Phone *</label>
                        <input value={phone} onChange={e => handlePhoneLookup(e.target.value)} placeholder="98765..." style={inp} />
                    </div>
                    <div>
                        <label style={lbl}>Patient Name *</label>
                        <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Rahul Verma" style={inp} />
                    </div>
                    <div>
                        <label style={lbl}>Age</label>
                        <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="YY" style={inp} />
                    </div>
                    <div>
                        <label style={lbl}>Gender</label>
                        <select value={gender} onChange={e => setGender(e.target.value)} style={inp}>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Chief Complaints + Diagnosis */}
            <div style={section}>
                <div className="rx-grid-2">
                    <div>
                        <label style={lbl}>Chief Complaints *</label>
                        <textarea value={complaint} onChange={e => setComplaint(e.target.value)} placeholder="Fever, Cough..." rows={4} style={{ ...inp, resize: 'vertical' }} />
                    </div>
                    <div>
                        <label style={lbl}>Diagnosis *</label>
                        <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Viral Upper Respiratory Infection" rows={4} style={{ ...inp, resize: 'vertical' }} />
                    </div>
                </div>
            </div>

            {/* Medicines */}
            <div style={section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1E293B' }}>Medicines (Rx) *</h3>
                    <button onClick={addMed} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plus size={15} /> Add Medicine
                    </button>
                </div>
                <div className="rx-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #E8EDF2' }}>
                            {['Medicine Name', 'Strength', 'Dose', 'Duration', 'Notes', ''].map(h => (
                                <th key={h} style={{ padding: '6px 10px 10px 0', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {medicines.map((med, idx) => (
                            <tr key={med.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                <td style={{ padding: '8px 10px 8px 0', minWidth: '180px' }}>
                                    <MedicineSearch
                                        value={med.name}
                                        onSelect={(picked) => updateMedFromSearch(idx, picked)}
                                        style={{ ...inp, padding: '7px 11px' }}
                                    />
                                </td>
                                <td style={{ padding: '8px 10px 8px 0', width: '110px' }}>
                                    {med._strengths && med._strengths.length > 1 ? (
                                        <select value={med.strength} onChange={e => updateMed(idx, 'strength', e.target.value)} style={{ ...inp, padding: '7px 11px' }}>
                                            {med._strengths.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    ) : (
                                        <input value={med.strength} onChange={e => updateMed(idx, 'strength', e.target.value)} placeholder="500mg" style={{ ...inp, padding: '7px 11px' }} />
                                    )}
                                </td>
                                <td style={{ padding: '8px 10px 8px 0', width: '105px' }}>
                                    <select value={med.dose} onChange={e => updateMed(idx, 'dose', e.target.value)} style={{ ...inp, padding: '7px 11px' }}>
                                        {DOSE_OPTIONS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </td>
                                <td style={{ padding: '8px 10px 8px 0', width: '110px' }}>
                                    <select value={med.duration} onChange={e => updateMed(idx, 'duration', e.target.value)} style={{ ...inp, padding: '7px 11px' }}>
                                        {DURATION_OPTIONS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </td>
                                <td style={{ padding: '8px 10px 8px 0', minWidth: '110px' }}>
                                    <input value={med.notes} onChange={e => updateMed(idx, 'notes', e.target.value)} placeholder="After food" style={{ ...inp, padding: '7px 11px' }} />
                                </td>
                                <td style={{ padding: '8px 0', width: '36px' }}>
                                    <button onClick={() => delMed(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Advice + Follow Up */}
            <div style={section}>
                <label style={lbl}>Advice / Instructions</label>
                <textarea value={advice} onChange={e => setAdvice(e.target.value)} placeholder="Rest, Hydration..." rows={3} style={{ ...inp, resize: 'vertical', marginBottom: '16px' }} />
                <label style={lbl}>Follow Up Date</label>
                <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} style={{ ...inp, maxWidth: '220px' }} />
            </div>
        </Layout>
    )
}
