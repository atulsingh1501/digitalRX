import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Share2, Home } from 'lucide-react'
import Button from '../components/Button'
import { storage } from '../services/storage'

export default function PrescriptionPreview() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [patient, setPatient] = useState(null)
    const [clinic, setClinic] = useState({})

    useEffect(() => {
        const consultations = storage.getConsultations()
        const consult = consultations.find(c => c.id === id)
        if (consult) {
            setData(consult)
            setPatient(storage.getPatient(consult.patientId))
            setClinic(storage.getClinicInfo())
        } else {
            // In case we are coming from "Save & Share" directly with the ID, we might need to handle async if not found immediately (unlikely with synchronous localStorage)
        }
    }, [id, navigate])

    const handlePrint = () => {
        window.print()
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Dr. Prescription - ${patient?.name}`,
                    text: `Prescription from ${clinic.name}`,
                    url: window.location.href
                })
            } catch (err) {
                console.log('Share canceled')
            }
        } else {
            alert('Use browser print option to save as PDF and share.')
        }
    }

    if (!data || !patient) return <div className="p-4">Loading...</div>

    return (
        <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
            {/* Navbar */}
            <div className="no-print" style={{
                background: 'white',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <Home size={24} color="var(--text-muted)" />
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="secondary" onClick={handleShare} style={{ width: 'auto', padding: '8px 12px' }}>
                        <Share2 size={18} style={{ marginRight: '6px' }} /> Share
                    </Button>
                    <Button onClick={handlePrint} style={{ width: 'auto', padding: '8px 16px' }}>
                        <Printer size={18} style={{ marginRight: '8px' }} /> Print
                    </Button>
                </div>
            </div>

            {/* A4 Paper Container */}
            <div className="printable-area" style={{
                maxWidth: '210mm',
                minHeight: '297mm',
                margin: '24px auto',
                background: 'white',
                padding: '40px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                position: 'relative',
                fontFamily: "'Times New Roman', serif" // More professional look
            }}>

                {/* Header - Brand Color Strip */}
                <div style={{
                    borderBottom: '4px solid var(--primary)',
                    paddingBottom: '20px',
                    marginBottom: '32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start'
                }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', margin: 0, fontFamily: 'sans-serif' }}>
                            {clinic.name || 'MediCare Clinic'}
                        </h1>
                        <h2 style={{ fontSize: '1.2rem', margin: '4px 0', fontWeight: 600 }}>
                            {clinic.doctor || 'Dr. Medical Officer'}
                        </h2>
                        <div style={{ color: '#64748B', fontSize: '0.9rem', fontFamily: 'sans-serif' }}>
                            MBBS, MD (General Medicine)
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'sans-serif', fontSize: '0.9rem', color: '#64748B' }}>
                        <div>{clinic.phone || '+91 98765 43210'}</div>
                        <div>clinic@email.com</div>
                        <div>123 Health Street, Medical District</div>
                    </div>
                </div>

                {/* Patient Info Bar */}
                <div style={{
                    background: '#F8FAFC',
                    padding: '16px',
                    borderRadius: '8px',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    gap: '16px',
                    marginBottom: '32px',
                    border: '1px solid #E2E8F0',
                    fontFamily: 'sans-serif'
                }}>
                    <div>
                        <span style={{ color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Name</span>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{patient.name}</div>
                    </div>
                    <div>
                        <span style={{ color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</span>
                        <div style={{ fontWeight: 500 }}>{patient.age} Y / {patient.gender}</div>
                    </div>
                    <div>
                        <span style={{ color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</span>
                        <div style={{ fontWeight: 500 }}>{new Date(data.date).toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Clinical Notes */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', gap: '32px', marginBottom: '8px' }}>
                        {data.vitals.bp && <div><span style={{ fontWeight: 700 }}>BP:</span> {data.vitals.bp}</div>}
                        {data.vitals.weight && <div><span style={{ fontWeight: 700 }}>Wt:</span> {data.vitals.weight} kg</div>}
                        {data.vitals.pulse && <div><span style={{ fontWeight: 700 }}>Pulse:</span> {data.vitals.pulse} /min</div>}
                    </div>
                    {data.diagnosis && (
                        <div style={{ fontSize: '1.1rem' }}>
                            <span style={{ fontWeight: 700 }}>Diagnosis:</span> {data.diagnosis}
                        </div>
                    )}
                </div>

                {/* Rx Symbol */}
                <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 16px 0', fontFamily: 'serif', fontStyle: 'italic' }}>Rx</div>

                {/* Medicines Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #E2E8F0', fontFamily: 'sans-serif' }}>
                            <th style={{ textAlign: 'left', padding: '12px 0', color: '#64748B', width: '50%' }}>MEDICINE NAME</th>
                            <th style={{ textAlign: 'left', padding: '12px 0', color: '#64748B' }}>DOSAGE</th>
                            <th style={{ textAlign: 'left', padding: '12px 0', color: '#64748B' }}>DURATION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.medicines.map((med, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '16px 0', fontWeight: 700, fontSize: '1.05rem' }}>
                                    {idx + 1}. {med.name}
                                    {med.notes && <div style={{ fontWeight: 400, fontSize: '0.9rem', color: '#64748B', marginTop: '4px' }}>Note: {med.notes}</div>}
                                </td>
                                <td style={{ padding: '16px 0', fontWeight: 600 }}>{med.dose}</td>
                                <td style={{ padding: '16px 0' }}>{med.duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Advice / Follow Up */}
                {(data.notes || data.followUp) && (
                    <div style={{ background: '#FFF7ED', padding: '20px', borderRadius: '8px', border: '1px solid #FFEDD5', marginBottom: '40px' }}>
                        {data.notes && (
                            <div style={{ marginBottom: '12px' }}>
                                <strong style={{ display: 'block', marginBottom: '4px', color: '#9A3412', fontFamily: 'sans-serif' }}>ADVICE / INSTRUCTIONS</strong>
                                <div>{data.notes}</div>
                            </div>
                        )}
                        {data.followUp && (
                            <div>
                                <strong style={{ color: '#9A3412', fontFamily: 'sans-serif' }}>NEXT VISIT:</strong> {new Date(data.followUp).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ height: '60px' }}>
                            {/* Signature */}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{clinic.doctor || 'Dr. Signature'}</div>
                    </div>
                </div>

            </div>

            <style>{`
        @media print {
          .no-print { display: none !important; }
          .printable-area { 
            box-shadow: none; 
            margin: 0; 
            width: 100%; 
            max-width: none; 
            padding: 20px;
            border: none;
          }
          body { background: white; }
          @page { margin: 0; size: auto; }
        }
      `}</style>
        </div>
    )
}
