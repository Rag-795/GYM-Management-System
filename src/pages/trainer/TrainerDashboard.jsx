import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, User, LogOut, Users, Calendar, TrendingUp, Clock, Award } from 'lucide-react';

const TrainerDashboard = () => {
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
                <span className="px-2 py-1 bg-green-400/20 text-green-400 rounded text-xs font-medium">
                  Trainer
                </span>
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
            Welcome back, Coach {user.firstName}! 💪
          </h1>
          <p className="text-gray-400 text-lg">
            Ready to help your clients achieve their fitness goals?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Clients</p>
                <p className="text-2xl font-bold text-white">28</p>
              </div>
              <div className="bg-yellow-400/20 p-2 rounded">
                <Users className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Sessions This Week</p>
                <p className="text-2xl font-bold text-white">42</p>
              </div>
              <div className="bg-blue-400/20 p-2 rounded">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <div className="bg-green-400/20 p-2 rounded">
                <Calendar className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Rating</p>
                <p className="text-2xl font-bold text-white">4.9</p>
              </div>
              <div className="bg-purple-400/20 p-2 rounded">
                <Award className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-xl p-8 border border-green-400/30">
          <h2 className="text-2xl font-bold text-white mb-4">
            Hello, Trainer! 🎯
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Welcome to your trainer dashboard! Here you can manage your clients, track their progress, 
            schedule training sessions, create workout plans, and monitor your performance metrics. 
            You're making a real difference in people's lives through fitness.
          </p>
          <div className="mt-6 flex gap-4">
            <button className="bg-green-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-300 transition-colors">
              View My Clients
            </button>
            <button className="border border-green-400 text-green-400 px-6 py-3 rounded-lg font-semibold hover:bg-green-400/10 transition-colors">
              Create Workout Plan
            </button>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Sessions</h3>
            <div className="space-y-4">
              {[
                { time: '09:00 AM', client: 'John Doe', type: 'Strength Training' },
                { time: '11:00 AM', client: 'Sarah Wilson', type: 'HIIT Session' },
                { time: '02:00 PM', client: 'Mike Johnson', type: 'Cardio Training' },
                { time: '04:00 PM', client: 'Emily Brown', type: 'Yoga Session' }
              ].map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{session.client}</p>
                    <p className="text-gray-400 text-sm">{session.type}</p>
                  </div>
                  <div className="text-green-400 font-semibold">
                    {session.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Achievements</h3>
            <div className="space-y-4">
              {[
                { client: 'John Doe', achievement: 'Lost 10 lbs this month', date: '2 days ago' },
                { client: 'Sarah Wilson', achievement: 'Completed first 5K run', date: '1 week ago' },
                { client: 'Mike Johnson', achievement: 'Increased bench press by 20%', date: '1 week ago' },
                { client: 'Emily Brown', achievement: 'Attended 20 consecutive sessions', date: '2 weeks ago' }
              ].map((achievement, index) => (
                <div key={index} className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-white font-medium">{achievement.client}</p>
                  <p className="text-gray-400 text-sm">{achievement.achievement}</p>
                  <p className="text-gray-500 text-xs mt-1">{achievement.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-green-400/50 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">Manage Clients</h3>
            <p className="text-gray-400 mb-4">View and update client profiles and progress</p>
            <div className="text-green-400 font-medium">View Clients →</div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-green-400/50 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">Schedule Sessions</h3>
            <p className="text-gray-400 mb-4">Book and manage training appointments</p>
            <div className="text-green-400 font-medium">Manage Schedule →</div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-green-400/50 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">Create Programs</h3>
            <p className="text-gray-400 mb-4">Design custom workout and nutrition plans</p>
            <div className="text-green-400 font-medium">Create Plan →</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrainerDashboard;