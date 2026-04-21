import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Share2, Home, MessageCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { storage } from '../services/storage'
import { API_URL } from '../config'

export default function PrescriptionPreview() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [patient, setPatient] = useState(null)
    const [clinic, setClinic] = useState({})
    const [sendingWa, setSendingWa] = useState(false)

    useEffect(() => {
        const consultations = storage.getConsultations()
        const consult = consultations.find(c => c.id === id)
        if (consult) {
            setData(consult)
            setPatient(storage.getPatient(consult.patientId))
            setClinic(storage.getClinicInfo())
        } else {
            navigate('/dashboard')
        }
    }, [id, navigate])

    // Auto-trigger print or WhatsApp from session flag (set by NewRx screen)
    useEffect(() => {
        if (!data || !patient) return
        const action = sessionStorage.getItem('rx_auto_action')
        if (!action) return
        sessionStorage.removeItem('rx_auto_action')
        if (action === 'print') {
            setTimeout(() => window.print(), 600)
        } else if (action === 'whatsapp') {
            setTimeout(() => handleWhatsApp(), 600)
        }
    }, [data, patient])

    const handlePrint = () => window.print()

    const handleWhatsApp = async () => {
        if (!patient.phone) {
            alert('No phone number found for this patient.')
            return
        }

        try {
            setSendingWa(true)
            const element = document.getElementById('prescription-content')
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
            const imgData = canvas.toDataURL('image/png')

            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            const pdfBlob = pdf.output('blob')
            const fileName = `${patient.name.replace(/\s+/g, '_')}_Rx_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.pdf`

            const formData = new FormData()
            formData.append('pdf', pdfBlob, fileName)
            formData.append('phone', patient.phone)
            formData.append('filename', fileName)
            formData.append('message', `Hello ${patient.name},\n\nYour prescription from ${clinic.name || 'the clinic'} has been generated. Please find the PDF attached.\n\n- ${clinic.doctor || 'Your Doctor'}`)

            const res = await fetch(`${API_URL}/api/whatsapp/send-pdf`, {
                method: 'POST',
                body: formData
            })

            const resData = await res.json()
            if (resData.success) {
                alert('Prescription sent successfully via WhatsApp!')
            } else {
                alert(`Failed to send: ${resData.error}`)
            }
        } catch (err) {
            console.error(err)
            alert('Failed to generate or send PDF. Is the backend server running?')
        } finally {
            setSendingWa(false)
        }
    }

    if (!data || !patient) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F1F5F9', color: '#64748B' }}>
            Loading prescription...
        </div>
    )

    const whatsappUrl = clinic.whatsapp ? `https://wa.me/${clinic.whatsapp.replace(/\D/g, '')}` : null

    return (
        <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
            {/* Action Navbar */}
            <div className="no-print" style={{ background: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.875rem', fontWeight: 500 }}>
                    <Home size={20} /> Dashboard
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
                        <Printer size={16} /> Print
                    </button>
                    <button onClick={handleWhatsApp} disabled={sendingWa} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: sendingWa ? '#86EFAC' : '#25D366', color: 'white', border: 'none', cursor: sendingWa ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                        <MessageCircle size={16} /> {sendingWa ? 'Sending...' : 'Send WhatsApp'}
                    </button>
                </div>
            </div>

            {/* A4 Paper */}
            <div id="prescription-content" className="printable-area" style={{ maxWidth: '210mm', minHeight: '297mm', margin: '24px auto', background: 'white', padding: '36px 40px 100px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'relative', fontFamily: "'Times New Roman', serif" }}>

                {/* Header */}
                <div style={{ borderBottom: '3px solid #2563EB', paddingBottom: '18px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.9rem', fontWeight: 700, color: '#2563EB', margin: 0, fontFamily: 'sans-serif' }}>{clinic.name || 'MediCare Clinic'}</h1>
                        <h2 style={{ fontSize: '1.1rem', margin: '4px 0 2px', fontWeight: 600 }}>{clinic.doctor || 'Dr. Medical Officer'}</h2>
                        <div style={{ color: '#64748B', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>
                            {clinic.qualification || 'MBBS, MD (General Medicine)'} {clinic.specialization ? `• ${clinic.specialization}` : ''}
                        </div>
                        {clinic.regNumber && <div style={{ color: '#94A3B8', fontSize: '0.78rem', fontFamily: 'sans-serif', marginTop: '2px' }}>Reg No: {clinic.regNumber}</div>}
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'sans-serif', fontSize: '0.85rem', color: '#64748B' }}>
                        {clinic.phone && <div>{clinic.phone}</div>}
                        {clinic.email && <div>{clinic.email}</div>}
                        {clinic.address && <div style={{ maxWidth: '200px', lineHeight: 1.4 }}>{clinic.address}</div>}
                    </div>
                </div>

                {/* Patient Info */}
                <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '8px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '24px', border: '1px solid #E2E8F0', fontFamily: 'sans-serif' }}>
                    <div>
                        <span style={{ color: '#94A3B8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Patient Name</span>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '2px' }}>{patient.name}</div>
                    </div>
                    <div>
                        <span style={{ color: '#94A3B8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Details</span>
                        <div style={{ fontWeight: 500, marginTop: '2px' }}>{patient.age} Y / {patient.gender}</div>
                    </div>
                    <div>
                        <span style={{ color: '#94A3B8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</span>
                        <div style={{ fontWeight: 500, marginTop: '2px' }}>{new Date(data.date).toLocaleDateString('en-IN')}</div>
                    </div>
                </div>

                {/* Vitals + Diagnosis */}
                <div style={{ marginBottom: '24px', fontFamily: 'sans-serif' }}>
                    {(data.vitals?.bp || data.vitals?.weight || data.vitals?.pulse || data.vitals?.sugar) && (
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '8px', fontSize: '0.9rem' }}>
                            {data.vitals.bp && <span><b>BP:</b> {data.vitals.bp}</span>}
                            {data.vitals.pulse && <span><b>Pulse:</b> {data.vitals.pulse} /min</span>}
                            {data.vitals.weight && <span><b>Wt:</b> {data.vitals.weight} kg</span>}
                            {data.vitals.sugar && <span><b>Sugar:</b> {data.vitals.sugar}</span>}
                        </div>
                    )}
                    {data.complaint && <div style={{ marginBottom: '6px', fontSize: '0.9rem' }}><b>C/C:</b> {data.complaint}</div>}
                    {data.diagnosis && <div style={{ fontSize: '1rem' }}><b>Diagnosis:</b> {data.diagnosis}</div>}
                </div>

                {/* Rx Symbol */}
                <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 12px', fontFamily: 'serif', fontStyle: 'italic', color: '#2563EB' }}>Rx</div>

                {/* Medicines Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #E2E8F0', fontFamily: 'sans-serif' }}>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', width: '45%' }}>Medicine</th>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dosage</th>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.medicines?.map((med, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '13px 0', fontWeight: 700, fontSize: '1rem' }}>
                                    {idx + 1}. {med.name} {med.strength && <span style={{ fontWeight: 400, color: '#64748B', fontSize: '0.9rem' }}>({med.strength})</span>}
                                    {med.notes && <div style={{ fontWeight: 400, fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>Note: {med.notes}</div>}
                                </td>
                                <td style={{ padding: '13px 0', fontWeight: 600 }}>{med.dose}</td>
                                <td style={{ padding: '13px 0' }}>{med.duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Advice + Follow Up */}
                {(data.notes || data.followUp) && (
                    <div style={{ background: '#FFF7ED', padding: '16px', borderRadius: '8px', border: '1px solid #FFEDD5', marginBottom: '32px', fontFamily: 'sans-serif' }}>
                        {data.notes && (
                            <div style={{ marginBottom: data.followUp ? '10px' : 0 }}>
                                <strong style={{ display: 'block', marginBottom: '3px', color: '#9A3412', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Advice / Instructions</strong>
                                {data.notes}
                            </div>
                        )}
                        {data.followUp && (
                            <div>
                                <strong style={{ color: '#9A3412', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Next Visit: </strong>
                                {new Date(data.followUp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer — Signature + QR */}
                <div style={{ position: 'absolute', bottom: '32px', left: '40px', right: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                    {/* Doctor WhatsApp QR */}
                    <div>
                        {whatsappUrl ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <QRCodeSVG value={whatsappUrl} size={72} level="M" />
                                <div style={{ fontFamily: 'sans-serif' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#64748B' }}>Scan to Chat</div>
                                    <div style={{ fontWeight: 700, color: '#25D366', fontSize: '0.85rem' }}>{clinic.whatsapp}</div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: '#CBD5E1', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>
                                Add WhatsApp in Settings to show QR
                            </div>
                        )}
                    </div>

                    {/* Signature */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ height: '56px', borderBottom: '1px solid #94A3B8', marginBottom: '4px', width: '140px' }} />
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{clinic.doctor || 'Dr. Signature'}</div>
                        {clinic.qualification && <div style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'sans-serif' }}>{clinic.qualification}</div>}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    #prescription-content {
                        box-shadow: none; margin: 0 !important; max-width: none !important;
                        width: 100%; padding: 20px 28px 80px; min-height: auto;
                    }
                    body { background: white !important; }
                    @page { margin: 0; size: A4; }
                }
            `}</style>
        </div>
    )
}
