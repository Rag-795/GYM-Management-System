import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, ClipboardCheck, Activity, TrendingUp, TrendingDown,
  Plus, FileText, UserPlus, Clock, ChevronRight, MoreVertical,
  Dumbbell, Target, CheckCircle, AlertCircle, XCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [trainerName] = useState('John Smith');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Mock data for stats
  const statsData = [
    {
      title: 'Active Members',
      value: 24,
      change: 12,
      trend: 'up',
      icon: Users,
      bgColor: 'bg-blue-900/20',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-400/20'
    },
    {
      title: 'Plans Assigned',
      value: 18,
      change: 5,
      trend: 'up',
      icon: FileText,
      bgColor: 'bg-green-900/20',
      iconColor: 'text-green-400',
      borderColor: 'border-green-400/20'
    },
    {
      title: 'Pending Follow-ups',
      value: 7,
      change: 2,
      trend: 'down',
      icon: ClipboardCheck,
      bgColor: 'bg-yellow-900/20',
      iconColor: 'text-yellow-400',
      borderColor: 'border-yellow-400/20'
    },
    {
      title: 'Completed Sessions',
      value: 156,
      change: 8,
      trend: 'up',
      icon: CheckCircle,
      bgColor: 'bg-purple-900/20',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-400/20'
    }
  ];

  // Mock data for today's schedule
  const todaySchedule = [
    { id: 1, memberName: 'Sarah Johnson', time: '09:00 AM', sessionType: 'Personal Training', typeColor: 'bg-blue-500' },
    { id: 2, memberName: 'Mike Chen', time: '10:30 AM', sessionType: 'Strength Training', typeColor: 'bg-green-500' },
    { id: 3, memberName: 'Emma Wilson', time: '12:00 PM', sessionType: 'Cardio Session', typeColor: 'bg-yellow-500' },
    { id: 4, memberName: 'Alex Brown', time: '02:00 PM', sessionType: 'HIIT Workout', typeColor: 'bg-red-500' },
    { id: 5, memberName: 'Lisa Davis', time: '04:00 PM', sessionType: 'Yoga Class', typeColor: 'bg-purple-500' }
  ];

  // Mock data for recent member activity
  const recentActivity = [
    { id: 1, memberName: 'Sarah Johnson', activity: 'Completed workout plan', timestamp: '2 hours ago', type: 'success' },
    { id: 2, memberName: 'Mike Chen', activity: 'Updated fitness goals', timestamp: '3 hours ago', type: 'info' },
    { id: 3, memberName: 'Emma Wilson', activity: 'Missed scheduled session', timestamp: '5 hours ago', type: 'warning' },
    { id: 4, memberName: 'Alex Brown', activity: 'Started new diet plan', timestamp: '1 day ago', type: 'success' },
    { id: 5, memberName: 'Lisa Davis', activity: 'Requested plan modification', timestamp: '1 day ago', type: 'info' }
  ];

  // Mock data for recent members
  const recentMembers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', plan: 'Premium', status: 'active' },
    { id: 2, name: 'Mike Chen', email: 'mike.c@email.com', plan: 'Basic', status: 'active' },
    { id: 3, name: 'Emma Wilson', email: 'emma.w@email.com', plan: 'Premium', status: 'pending' },
    { id: 4, name: 'Alex Brown', email: 'alex.b@email.com', plan: 'Standard', status: 'inactive' },
    { id: 5, name: 'Lisa Davis', email: 'lisa.d@email.com', plan: 'Premium', status: 'active' }
  ];

  // Mock data for today's classes
  const todayClasses = [
    { id: 1, className: 'Morning HIIT', trainer: 'John Smith', time: '07:00 AM', duration: '45 min', enrolled: 12 },
    { id: 2, className: 'Strength Training', trainer: 'John Smith', time: '09:00 AM', duration: '60 min', enrolled: 8 },
    { id: 3, className: 'Afternoon Yoga', trainer: 'John Smith', time: '04:00 PM', duration: '50 min', enrolled: 15 },
    { id: 4, className: 'Evening Cardio', trainer: 'John Smith', time: '06:00 PM', duration: '45 min', enrolled: 10 }
  ];

  // Chart data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Progress Overview',
        data: [65, 78, 72, 85, 82, 95],
        borderColor: 'rgb(250, 204, 21)',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const memberDistributionData = {
    labels: ['Premium', 'Standard', 'Basic'],
    datasets: [
      {
        data: [12, 8, 4],
        backgroundColor: [
          'rgba(250, 204, 21, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: [
          'rgba(250, 204, 21, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const attendanceChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Member Check-ins',
        data: [18, 22, 19, 24, 20, 15, 10],
        backgroundColor: 'rgba(250, 204, 21, 0.6)',
        borderColor: 'rgba(250, 204, 21, 1)',
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#9CA3AF'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9CA3AF'
        }
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-green-900/20 text-green-400 border-green-400/20', icon: CheckCircle },
      pending: { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-400/20', icon: AlertCircle },
      inactive: { color: 'bg-red-900/20 text-red-400 border-red-400/20', icon: XCircle }
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getActivityIcon = (type) => {
    const icons = {
      success: <CheckCircle className="h-4 w-4 text-green-400" />,
      warning: <AlertCircle className="h-4 w-4 text-yellow-400" />,
      info: <Activity className="h-4 w-4 text-blue-400" />
    };
    return icons[type] || icons.info;
  };

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
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
        >
          <UserPlus className="h-5 w-5" />
          Create Workout Plan
        </button>
        
        <button
          onClick={() => navigate('/trainer/DietPlan')}
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
          <div className="space-y-3">
            {todaySchedule.map((session) => (
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
            ))}
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
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => navigate(`/trainer/member/${activity.id}`)}
              >
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <div className="font-medium text-white">{activity.memberName}</div>
                  <div className="text-sm text-gray-400">{activity.activity}</div>
                </div>
                <div className="text-xs text-gray-500">{activity.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      

      {/* Charts Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"> */}
        {/* Progress Overview Chart */}
        {/* <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Progress Overview</h3>
          <div className="h-64">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div> */}

        {/* Member Distribution Chart */}
        {/* <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Member Distribution</h3>
          <div className="h-64">
            <Doughnut data={memberDistributionData} options={doughnutOptions} />
          </div>
        </div> */}

        {/* Weekly Attendance Chart */}
        {/* <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Attendance</h3>
          <div className="h-64">
            <Bar data={attendanceChartData} options={chartOptions} />
          </div>
        </div> */}
      {/* </div> */}

      {/* Tables Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        {/* Recent Members Table */}
        {/* <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Members</h3>
            <button
              onClick={() => navigate('/trainer/members')}
              className="text-sm text-yellow-400 hover:text-yellow-300"
            >
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                  <th className="pb-3">Member Name</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => navigate(`/trainer/member/${member.id}`)}
                  >
                    <td className="py-3">
                      <div>
                        <div className="font-medium text-white">{member.name}</div>
                        <div className="text-xs text-gray-400">{member.email}</div>
                      </div>
                    </td>
                    <td className="py-3 text-gray-300">{member.plan}</td>
                    <td className="py-3">{getStatusBadge(member.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}

        {/* Today's Classes Table */}
        {/* <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Today's Classes</h3>
            <button className="text-sm text-yellow-400 hover:text-yellow-300">
              Full schedule →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                  <th className="pb-3">Class</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Enrolled</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {todayClasses.map((cls) => (
                  <tr key={cls.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3">
                      <div className="font-medium text-white">{cls.className}</div>
                    </td>
                    <td className="py-3 text-gray-300">{cls.time}</td>
                    <td className="py-3 text-gray-300">{cls.duration}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-yellow-400">
                        <Users className="h-4 w-4" />
                        {cls.enrolled}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div> */}

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