import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './styles/global.css'

// Screens
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import Patients from './screens/Patients'
import AddPatient from './screens/AddPatient'
import PatientProfile from './screens/PatientProfile'
import Consultation from './screens/Consultation'
import NewRx from './screens/NewRx'
import PrescriptionPreview from './screens/PrescriptionPreview'
import Settings from './screens/Settings'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? children : <Navigate to="/" />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
          <Route path="/patients/new" element={<ProtectedRoute><AddPatient /></ProtectedRoute>} />
          <Route path="/patients/:id" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
          <Route path="/consultation/:id" element={<ProtectedRoute><Consultation /></ProtectedRoute>} />
          <Route path="/new-rx" element={<ProtectedRoute><NewRx /></ProtectedRoute>} />
          <Route path="/prescription/:id" element={<ProtectedRoute><PrescriptionPreview /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>,
)
