import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Home, MessageCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { storage } from '../services/storage'
import { API_URL } from '../config'

// Expand short dose codes to full written form (NMC safe abbreviation)
const expandDose = (dose) => {
    const map = {
        '1-0-1': 'Morning & Night (Twice Daily)',
        '1-1-1': 'Morning, Afternoon & Night (Three Times Daily)',
        '1-0-0': 'Morning Only (Once Daily)',
        '0-0-1': 'Night Only (Once Daily)',
        '0-1-0': 'Afternoon Only (Once Daily)',
        '0-1-1': 'Afternoon & Night (Twice Daily)',
        'SOS': 'As Needed (SOS)',
        'As directed': 'As Directed by Physician',
    }
    return map[dose] || dose
}

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
        if (!patient.phone) { alert('No phone number found for this patient.'); return }
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
            const res = await fetch(`${API_URL}/api/whatsapp/send-pdf`, { method: 'POST', body: formData })
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
    const rxDate = new Date(data.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    const followUpDate = data.followUp ? new Date(data.followUp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null

    return (
        <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>

            {/* Action Navbar */}
            <div className="no-print" style={{ background: 'white', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.875rem', fontWeight: 500 }}>
                    <Home size={20} /> Dashboard
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', background: '#F8FAFC', color: '#374151', border: '1px solid #E2E8F0', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                        <Printer size={16} /> Print / PDF
                    </button>
                    <button onClick={handleWhatsApp} disabled={sendingWa} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', background: sendingWa ? '#86EFAC' : '#25D366', color: 'white', border: 'none', cursor: sendingWa ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                        <MessageCircle size={16} /> {sendingWa ? 'Sending...' : 'Send via WhatsApp'}
                    </button>
                </div>
            </div>

            {/* ─── A4 Prescription Paper ─── */}
            <div
                id="prescription-content"
                className="printable-area"
                style={{
                    maxWidth: '210mm',
                    minHeight: '297mm',
                    margin: '28px auto',
                    background: 'white',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                    fontFamily: "'Times New Roman', Times, serif",
                    fontSize: '13px',
                    color: '#111827',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                }}
            >
                {/* ── TOP COLOUR BAR ── */}
                <div style={{ background: '#1E3A5F', height: '8px', width: '100%', borderRadius: '0' }} />

                {/* ── HEADER ── */}
                <div style={{ padding: '20px 36px 14px', borderBottom: '2px solid #1E3A5F' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

                        {/* Left — Doctor & Clinic */}
                        <div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1E3A5F', fontFamily: 'sans-serif', letterSpacing: '0.3px' }}>
                                {clinic.doctor || 'Dr. Medical Officer'}
                            </div>
                            <div style={{ fontSize: '13px', color: '#374151', fontFamily: 'sans-serif', marginTop: '2px' }}>
                                {clinic.qualification || 'MBBS, MD (General Medicine)'}
                                {clinic.specialization ? ` • ${clinic.specialization}` : ''}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'sans-serif', marginTop: '2px' }}>
                                Reg. No: <strong style={{ color: '#1E3A5F' }}>{clinic.regNumber || 'MCI-XXXXXXXX'}</strong>
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 700, color: '#B45309', fontFamily: 'sans-serif', letterSpacing: '0.5px' }}>
                                {clinic.name || 'Clinic Name'}
                            </div>
                        </div>

                        {/* Right — Contact */}
                        <div style={{ textAlign: 'right', fontFamily: 'sans-serif', fontSize: '12px', color: '#4B5563', lineHeight: '1.7' }}>
                            {clinic.address && <div style={{ maxWidth: '200px', textAlign: 'right' }}>{clinic.address}</div>}
                            {clinic.phone && <div>📞 {clinic.phone}</div>}
                            {clinic.email && <div>✉ {clinic.email}</div>}
                        </div>
                    </div>
                </div>

                {/* ── PATIENT STRIP ── */}
                <div style={{ background: '#F0F4F8', padding: '10px 36px', borderBottom: '1px solid #CBD5E1', display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', gap: '12px', fontFamily: 'sans-serif' }}>
                    <div>
                        <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Patient Name</div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginTop: '1px' }}>{patient.name}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Age / Gender</div>
                        <div style={{ fontWeight: 600, marginTop: '1px' }}>{patient.age ? `${patient.age} Yrs` : '—'} / {patient.gender || '—'}</div>
                    </div>
                    {patient.phone && (
                        <div>
                            <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone</div>
                            <div style={{ fontWeight: 500, marginTop: '1px' }}>{patient.phone}</div>
                        </div>
                    )}
                    <div>
                        <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</div>
                        <div style={{ fontWeight: 600, marginTop: '1px' }}>{rxDate}</div>
                    </div>
                </div>

                {/* ── MAIN BODY ── */}
                <div style={{ padding: '20px 36px', flex: 1 }}>

                    {/* Vitals */}
                    {(data.vitals?.bp || data.vitals?.pulse || data.vitals?.weight || data.vitals?.sugar) && (
                        <div style={{ marginBottom: '14px', fontFamily: 'sans-serif', fontSize: '12px', display: 'flex', flexWrap: 'wrap', gap: '18px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '8px 14px' }}>
                            <span style={{ fontWeight: 700, color: '#374151', marginRight: '4px' }}>Vitals:</span>
                            {data.vitals.bp && <span><b>B.P.:</b> {data.vitals.bp} mmHg</span>}
                            {data.vitals.pulse && <span><b>Pulse:</b> {data.vitals.pulse} /min</span>}
                            {data.vitals.weight && <span><b>Wt:</b> {data.vitals.weight} kg</span>}
                            {data.vitals.sugar && <span><b>Blood Sugar:</b> {data.vitals.sugar}</span>}
                        </div>
                    )}

                    {/* Chief Complaints */}
                    {data.complaint && (
                        <div style={{ marginBottom: '10px', fontFamily: 'sans-serif' }}>
                            <span style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Chief Complaints: </span>
                            <span style={{ fontSize: '13px' }}>{data.complaint}</span>
                        </div>
                    )}

                    {/* Diagnosis */}
                    {data.diagnosis && (
                        <div style={{ marginBottom: '18px', padding: '10px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', fontFamily: 'sans-serif' }}>
                            <span style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1D4ED8' }}>Diagnosis: </span>
                            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1E3A5F' }}>{data.diagnosis}</span>
                        </div>
                    )}

                    {/* ℞ Symbol */}
                    <div style={{ fontSize: '28px', fontStyle: 'italic', fontWeight: 700, color: '#1E3A5F', marginBottom: '8px', fontFamily: 'serif', lineHeight: 1 }}>
                        ℞
                        <span style={{ fontSize: '11px', fontStyle: 'normal', fontWeight: 400, color: '#6B7280', fontFamily: 'sans-serif', marginLeft: '8px', verticalAlign: 'middle' }}>
                            (Generic medicine names to be dispensed as prescribed)
                        </span>
                    </div>

                    {/* Medicines Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontFamily: 'sans-serif' }}>
                        <thead>
                            <tr style={{ background: '#1E3A5F' }}>
                                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'white', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', width: '4%' }}>#</th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'white', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', width: '38%' }}>Medicine Name & Strength</th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'white', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', width: '35%' }}>Dosage Frequency</th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'white', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', width: '13%' }}>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.medicines?.map((med, idx) => (
                                <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                                    <td style={{ padding: '10px 10px', fontWeight: 700, color: '#1E3A5F', fontSize: '13px', verticalAlign: 'top' }}>{idx + 1}.</td>
                                    <td style={{ padding: '10px 10px', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#111827' }}>{med.name}</div>
                                        {med.strength && <div style={{ color: '#4B5563', fontSize: '12px', marginTop: '1px' }}>Strength: {med.strength}</div>}
                                        {med.notes && <div style={{ color: '#92400E', fontSize: '11.5px', marginTop: '3px', fontStyle: 'italic' }}>⚠ {med.notes}</div>}
                                    </td>
                                    <td style={{ padding: '10px 10px', fontSize: '12.5px', color: '#1F2937', verticalAlign: 'top', fontWeight: 500 }}>
                                        {expandDose(med.dose)}
                                    </td>
                                    <td style={{ padding: '10px 10px', fontSize: '12.5px', color: '#374151', verticalAlign: 'top' }}>{med.duration}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Advice & Follow-up */}
                    {(data.notes || followUpDate) && (
                        <div style={{ border: '1px solid #FDE68A', background: '#FFFBEB', borderRadius: '6px', padding: '12px 16px', marginBottom: '16px', fontFamily: 'sans-serif' }}>
                            {data.notes && (
                                <div style={{ marginBottom: followUpDate ? '10px' : 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#92400E', marginBottom: '6px' }}>Advice / Instructions</div>
                                    <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#1F2937', whiteSpace: 'pre-line' }}>{data.notes}</div>
                                </div>
                            )}
                            {followUpDate && (
                                <div style={{ marginTop: data.notes ? '8px' : 0, paddingTop: data.notes ? '8px' : 0, borderTop: data.notes ? '1px dashed #FCD34D' : 'none' }}>
                                    <span style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#92400E' }}>Next Visit (Follow-up): </span>
                                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#1E3A5F' }}>{followUpDate}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* NMC Disclaimer */}
                    <div style={{ fontSize: '10.5px', color: '#9CA3AF', fontFamily: 'sans-serif', fontStyle: 'italic', borderTop: '1px dashed #E5E7EB', paddingTop: '8px', marginBottom: '4px' }}>
                        ⚖ This prescription is valid for 30 days from the date of issue. Generic medicines may be substituted by the pharmacist as per DPCO / NMC guidelines.
                        Patients are advised not to self-medicate and to follow doctor's instructions strictly. This prescription is computer-generated and legally valid.
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div style={{ padding: '12px 36px 20px', borderTop: '2px solid #1E3A5F', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>

                    {/* QR Code */}
                    <div>
                        {whatsappUrl ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <QRCodeSVG value={whatsappUrl} size={64} level="M" />
                                <div style={{ fontFamily: 'sans-serif' }}>
                                    <div style={{ fontWeight: 600, fontSize: '11px', color: '#6B7280' }}>Scan to WhatsApp</div>
                                    <div style={{ fontWeight: 700, color: '#25D366', fontSize: '12px' }}>{clinic.whatsapp}</div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '10px', color: '#CBD5E1', fontFamily: 'sans-serif' }}>Add WhatsApp in Settings to show QR</div>
                        )}
                    </div>

                    {/* Stamp area + Signature */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '120px', height: '60px', border: '1px dashed #CBD5E1',
                            borderRadius: '6px', marginBottom: '6px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: '#D1D5DB', fontSize: '11px', fontFamily: 'sans-serif'
                        }}>
                            Stamp / Seal
                        </div>
                        <div style={{ width: '160px', borderBottom: '1.5px solid #374151', marginBottom: '4px' }} />
                        <div style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'sans-serif' }}>{clinic.doctor || 'Dr. Signature'}</div>
                        {clinic.qualification && <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'sans-serif' }}>{clinic.qualification}</div>}
                        <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'sans-serif' }}>Reg. No: {clinic.regNumber || 'MCI-XXXXXXXX'}</div>
                    </div>
                </div>

                {/* Bottom colour bar */}
                <div style={{ background: '#1E3A5F', height: '5px', width: '100%' }} />
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0; }
                    #prescription-content {
                        box-shadow: none !important;
                        margin: 0 !important;
                        max-width: none !important;
                        width: 100%;
                        min-height: auto;
                    }
                    @page { margin: 0; size: A4 portrait; }
                }
            `}</style>
        </div>
    )
}
