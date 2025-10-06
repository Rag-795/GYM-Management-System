import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Lcl from './pages/Lcl'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import AdminLayout from './components/AdminLayout'
import TrainerLayout from './components/TrainerLayout'
import Dashboard from './pages/admin/Dashboard'
import Members from './pages/admin/Members'
import Trainers from './pages/admin/Trainers'
import Memberships from './pages/admin/Memberships'
import Plans from './pages/admin/Plans'
import Equipment from './pages/admin/Equipment'
import Attendance from './pages/admin/Attendance'
import Payments from './pages/admin/Payments'
import MemberDashboard from './pages/member/MemberDashboard'
import TrainerDashboard from './pages/trainer/Dashboard'
import DietPlanCreator from './pages/trainer/DietPlan'
import WorkoutPlanCreator from './pages/trainer/WorkoutPlan'
// import MyMembers from './pages/trainer/MyMembers'
// import MemberProfile from './pages/trainer/MemberProfile'


import TrainerProfile from './pages/trainer/TrainerProfile'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lcl />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        
        {/* Member Routes */}
        <Route path="/member/dashboard" element={<MemberDashboard />} />
        
        {/* Trainer Routes */}
        <Route path="/trainer" element={<TrainerLayout />}>
          <Route index element={<Navigate to="/trainer/dashboard" replace />} />
          <Route path="dashboard" element={<TrainerDashboard />} />
          {/* <Route path="members" element={<MyMembers />} /> */}
          {/* <Route path="member/:id" element={<MemberProfile />} /> */}
          <Route path="workout-plans" element={<WorkoutPlanCreator />} />
          <Route path="diet-plans" element={<DietPlanCreator />} />
          <Route path="profile" element={<TrainerProfile />} />
        </Route>
        
        {/* Admin Routes */}
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