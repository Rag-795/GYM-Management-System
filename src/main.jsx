import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Lcl from './pages/Lcl'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPassword from './pages/auth/ForgotPassword'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Members from './pages/admin/Members'
import Trainers from './pages/admin/Trainers'
import Memberships from './pages/admin/Memberships'
import Plans from './pages/admin/Plans'
import Equipment from './pages/admin/Equipment'
import Attendance from './pages/admin/Attendance'
import Payments from './pages/admin/Payments'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lcl />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        {/* Admin demo routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="trainers" element={<Trainers />} />
          <Route path="memberships" element={<Memberships />} />
          <Route path="plans" element={<Plans />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payments" element={<Payments />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
