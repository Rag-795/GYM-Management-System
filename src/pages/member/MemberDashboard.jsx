import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, User, LogOut, Calendar, TrendingUp, Clock, Award } from 'lucide-react';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-black text-yellow-400">FitHub</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">{user.firstName} {user.lastName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-gray-400 text-lg">
            Ready to crush your fitness goals today?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Workouts This Week</p>
                <p className="text-2xl font-bold text-white">5</p>
              </div>
              <div className="bg-yellow-400/20 p-2 rounded">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Hours</p>
                <p className="text-2xl font-bold text-white">12.5</p>
              </div>
              <div className="bg-blue-400/20 p-2 rounded">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Upcoming Classes</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
              <div className="bg-green-400/20 p-2 rounded">
                <Calendar className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Achievements</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <div className="bg-purple-400/20 p-2 rounded">
                <Award className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-xl p-8 border border-yellow-400/30">
          <h2 className="text-2xl font-bold text-white mb-4">
            Hello, Member! 🏋️‍♂️
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Welcome to your member dashboard! This is where you'll track your fitness journey, 
            view your workout plans, book classes, and monitor your progress. Your trainer and 
            our fitness team are here to support you every step of the way.
          </p>
          <div className="mt-6">
            <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
              View My Workout Plan
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-400/50 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">Book a Class</h3>
            <p className="text-gray-400 mb-4">Reserve your spot in upcoming group classes</p>
            <div className="text-yellow-400 font-medium">Browse Classes →</div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-400/50 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">Track Progress</h3>
            <p className="text-gray-400 mb-4">View your fitness journey and achievements</p>
            <div className="text-yellow-400 font-medium">View Progress →</div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-400/50 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">Contact Trainer</h3>
            <p className="text-gray-400 mb-4">Get guidance from your personal trainer</p>
            <div className="text-yellow-400 font-medium">Message Trainer →</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;