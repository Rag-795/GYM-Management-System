import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Dumbbell, Menu, X, Home, Users, UserCheck, CreditCard, ClipboardList, CheckSquare,
  Bell, Search, ChevronDown, LogOut,
  ReceiptIndianRupee,
} from 'lucide-react';
import { TbTreadmill } from "react-icons/tb";


const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      isActive ? 'bg-yellow-400 text-black' : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
    }`;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-yellow-400/20 z-40">
        <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded text-gray-400 hover:text-yellow-400"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Menu"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-black text-yellow-400">FitHub</span>
              <span className="text-sm text-gray-400 ml-1">Admin</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-yellow-400">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-yellow-400 rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800"
              >
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
                  alt="Admin"
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-white hidden md:block">Admin</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg border border-gray-700 shadow-lg p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 rounded flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-gray-900 border-r border-yellow-400/20 z-30 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1">
          <NavLink to="/admin/dashboard" className={navLinkClass}><Home className="h-5 w-5" /> Dashboard</NavLink>
          <NavLink to="/admin/members" className={navLinkClass}><Users className="h-5 w-5" /> Members</NavLink>
          <NavLink to="/admin/trainers" className={navLinkClass}><UserCheck className="h-5 w-5" /> Trainers</NavLink>
          <NavLink to="/admin/memberships" className={navLinkClass}><CreditCard className="h-5 w-5" /> Memberships</NavLink>
          <NavLink to="/admin/plans" className={navLinkClass}><ClipboardList className="h-5 w-5" /> Workout & Diet Plans</NavLink>
          <NavLink to="/admin/equipment" className={navLinkClass}><TbTreadmill className="h-5 w-5" /> Equipment</NavLink>
          <NavLink to="/admin/attendance" className={navLinkClass}><CheckSquare className="h-5 w-5" /> Attendance</NavLink>
          <NavLink to="/admin/payments" className={navLinkClass}><ReceiptIndianRupee className="h-5 w-5" /> Payments</NavLink>
        </nav>
      </aside>

      {/* Content */}
      <main className="pt-16 lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default AdminLayout;