/**
 * storage.js
 * Wrapper for localStorage to handle data persistence
 */

const KEYS = {
    PIN: 'doct_app_pin',
    PATIENTS: 'doct_app_patients',
    CONSULTATIONS: 'doct_app_consultations',
    CLINIC: 'doct_app_clinic_info'
}

export const storage = {
    // Auth
    hasPin: () => !!localStorage.getItem(KEYS.PIN),

    verifyPin: (inputPin) => {
        const stored = localStorage.getItem(KEYS.PIN)
        return stored === inputPin
    },

    setPin: (pin) => {
        localStorage.setItem(KEYS.PIN, pin)
    },

    // Patients
    getPatients: () => {
        try {
            const data = localStorage.getItem(KEYS.PATIENTS)
            return data ? JSON.parse(data) : []
        } catch (e) {
            console.error('Error parsing patients', e)
            return []
        }
    },

    savePatient: (patient) => {
        const patients = storage.getPatients()
        const existingIndex = patients.findIndex(p => p.id === patient.id)

        if (existingIndex >= 0) {
            patients[existingIndex] = { ...patients[existingIndex], ...patient, updatedAt: Date.now() }
        } else {
            patients.unshift({ ...patient, id: crypto.randomUUID(), createdAt: Date.now() })
        }

        localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients))
        return patient.id || patients[0].id
    },

    getPatient: (id) => {
        const patients = storage.getPatients()
        return patients.find(p => p.id === id)
    },

    // Consultations
    getConsultations: (patientId) => {
        const all = localStorage.getItem(KEYS.CONSULTATIONS)
        const store = all ? JSON.parse(all) : []
        if (!patientId) return store
        return store.filter(c => c.patientId === patientId).sort((a, b) => b.date - a.date)
    },

    saveConsultation: (consultation) => {
        const all = localStorage.getItem(KEYS.CONSULTATIONS)
        const store = all ? JSON.parse(all) : []

        const index = store.findIndex(c => c.id === consultation.id)

        if (index >= 0) {
            store[index] = { ...store[index], ...consultation, updatedAt: Date.now() }
        } else {
            store.unshift({
                ...consultation,
                id: consultation.id || crypto.randomUUID(),
                date: Date.now()
            })
        }

        localStorage.setItem(KEYS.CONSULTATIONS, JSON.stringify(store))
    },

    // Clinic Info
    getClinicInfo: () => {
        const data = localStorage.getItem(KEYS.CLINIC)
        return data ? JSON.parse(data) : { name: 'My Clinic', doctor: 'Dr. Smith' }
    },

    saveClinicInfo: (info) => {
        localStorage.setItem(KEYS.CLINIC, JSON.stringify(info))
    }
}
