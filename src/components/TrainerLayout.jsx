import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Dumbbell, Menu, X, Home, Users, User, Bell, Search, 
  ChevronDown, LogOut, UserCircle, FileText, Salad
} from 'lucide-react';

const TrainerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [profileOpen, setProfileOpen] = useState(false);
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
              <span className="text-sm text-gray-400 ml-1">Trainer</span>
            </div>
          </div>

          {/* <div className="flex items-center gap-4"> */}
            {/* Search - Hidden on mobile */}
            {/* <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 w-64"
                aria-label="Search members"
              />
            </div> */}

            {/* Notification Bell */}
            {/* <button 
              className="relative p-2 text-gray-400 hover:text-yellow-400"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-yellow-400 rounded-full" />
            </button> */}

            {/* Profile Dropdown */}
            {/* <div className="relative">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Profile menu"
              >
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100"
                  alt="Trainer Avatar"
                  className="h-8 w-8 rounded-full object-cover border-2 border-yellow-400/20"
                />
                <span className="text-white hidden md:block">Trainer</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg border border-gray-700 shadow-lg p-1">
                  <NavLink
                    to="/trainer/profile"
                    onClick={() => setProfileOpen(false)}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 rounded flex items-center gap-2"
                  >
                    <UserCircle className="h-4 w-4" /> My Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 rounded flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div> */}

          {/* Mobile Search and Profile */}
          {/* <div className="flex items-center gap-2 md:hidden">
            <button 
              className="p-2 text-gray-400 hover:text-yellow-400"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button 
              className="relative p-2 text-gray-400 hover:text-yellow-400"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-yellow-400 rounded-full" />
            </button>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="p-2"
              aria-label="Profile menu"
            >
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100"
                alt="Trainer Avatar"
                className="h-8 w-8 rounded-full object-cover border-2 border-yellow-400/20"
              />
            </button>
          </div> */}
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-gray-900 border-r border-yellow-400/20 z-30 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <nav className="p-4 space-y-1">
          <NavLink 
            to="/trainer/dashboard" 
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <Home className="h-5 w-5" /> 
            <span>Trainer Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/trainer/members" 
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <Users className="h-5 w-5" /> 
            <span>My Members</span>
          </NavLink>
          
          {/* <NavLink 
            to="/trainer/member/:id" 
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <User className="h-5 w-5" /> 
            <span>Member Profile</span>
          </NavLink> */}
          
          <NavLink 
            to="/trainer/workout-plans" 
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <FileText className="h-5 w-5" /> 
            <span>Workout Plan Builder</span>
          </NavLink>
          
          <NavLink 
            to="/trainer/diet-plans" 
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <Salad className="h-5 w-5" /> 
            <span>Diet Plan Builder</span>
          </NavLink>
          
          <NavLink 
            to="/trainer/profile" 
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <UserCircle className="h-5 w-5" /> 
            <span>My Profile</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100"
              alt="Trainer"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">John Trainer</p>
              <p className="text-xs text-gray-400">Fitness Expert</p>
            </div>
          </div>
        </div> */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 hover:bg-red-900/20 hover:text-red-400 text-gray-300 transition-all group"
          >
            <LogOut className="h-5 w-5 group-hover:text-red-400" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pt-16 lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default TrainerLayout;