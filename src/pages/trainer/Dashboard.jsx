import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, ClipboardCheck, Activity, TrendingUp, TrendingDown,
  Plus, FileText, UserPlus, Clock, ChevronRight, MoreVertical,
  Dumbbell, Target, CheckCircle, AlertCircle, XCircle, Info
} from 'lucide-react';
import ApiService from '../../services/api';



const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [trainerName] = useState('John Smith');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch members and create today's schedule
  useEffect(() => {
    const fetchTodaysSchedule = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getMembers({ limit: 5 });
        const members = response?.members || [];
        
        // Generate random schedule times and session types
        const sessionTypes = [
          { type: 'Personal Training', color: 'bg-blue-500' },
          { type: 'Strength Training', color: 'bg-green-500' },
          { type: 'Cardio Session', color: 'bg-yellow-500' },
          { type: 'HIIT Workout', color: 'bg-red-500' },
          { type: 'Yoga Class', color: 'bg-purple-500' },
          { type: 'Functional Training', color: 'bg-pink-500' },
          { type: 'Core Workout', color: 'bg-indigo-500' }
        ];

        const timeSlots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '04:00 PM', '05:30 PM'];

        const scheduleData = members.slice(0, 5).map((member, index) => {
          const randomSessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
          return {
            id: member.id,
            memberName: `${member.first_name} ${member.last_name}`,
            time: timeSlots[index] || timeSlots[Math.floor(Math.random() * timeSlots.length)],
            sessionType: randomSessionType.type,
            typeColor: randomSessionType.color
          };
        });

        setTodaySchedule(scheduleData);
      } catch (error) {
        console.error('Error fetching members for schedule:', error);
        setError('Failed to load today\'s schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysSchedule();
  }, []);



  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Trainer Dashboard</h1>
        <p className="text-gray-400">Welcome back, {trainerName}!</p>
      </div>
      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => navigate('/trainer/workout-plans')}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
        >
          <Dumbbell className="h-5 w-5" />
          Create Workout Plan
        </button>
        
        <button
          onClick={() => navigate('/trainer/diet-plans')}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
        >
          <FileText className="h-5 w-5" />
          Create Diet Plan
        </button>
        <button
          onClick={() => navigate('/trainer/members')}
          className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 border border-gray-700 transition-colors"
        >
          <Users className="h-5 w-5" />
          View My Members
        </button>
      </div>

      {/* Quick Stats Cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-6 hover:scale-105 transition-transform cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`h-8 w-8 ${stat.iconColor}`} />
                <div className="flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-xs ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.title}</div>
            </div>
          );
        })}
      </div> */}

      {/* Today's Schedule and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Today's Schedule Widget */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-400" />
              Today's Schedule
            </h2>
            <button className="text-gray-400 hover:text-yellow-400">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Demo Schedule</span>
            </div>
            <p className="text-xs text-blue-200">
              This is a simulated schedule using real member data with randomly assigned times and session types for demonstration purposes.
            </p>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading schedule...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400">{error}</p>
              </div>
            ) : todaySchedule.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No sessions scheduled for today</p>
              </div>
            ) : (
              todaySchedule.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => navigate(`/trainer/member/${session.id}`)}
                >
                  <div className={`w-1 h-12 ${session.typeColor} rounded-full`} />
                  <div className="flex-1">
                    <div className="font-medium text-white">{session.memberName}</div>
                    <div className="text-sm text-gray-400">{session.sessionType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-yellow-400">{session.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Member Activity Feed */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-yellow-400" />
              Recent Member Activity
            </h2>
            <button className="text-gray-400 hover:text-yellow-400">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">Activity Feed Coming Soon</p>
            <p className="text-sm text-gray-500">
              Real-time member activity tracking will be available in the next update
            </p>
          </div>
        </div>
      </div>

      {/* Assign Plan Modal (Placeholder) */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Assign Plan to Member</h3>
            <p className="text-gray-400 mb-6">Plan assignment feature coming soon...</p>
            <button
              onClick={() => setShowAssignModal(false)}
              className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;