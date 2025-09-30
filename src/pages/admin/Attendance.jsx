import React, { useState } from 'react';
import { 
  Search, Calendar, Clock, Users, UserCheck, 
  TrendingUp, TrendingDown, Download, Filter,
  ArrowUp, ArrowDown, Activity, BarChart3,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Line, Bar } from 'react-chartjs-2';

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('all'); // all, members, trainers
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly

  // Sample attendance data
  const attendanceRecords = [
    {
      id: 1,
      name: 'John Doe',
      type: 'member',
      memberId: 'MEM001',
      checkIn: '06:15 AM',
      checkOut: '07:45 AM',
      duration: '1h 30m',
      date: '2024-01-20',
      status: 'completed',
      activity: 'Strength Training',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
    },
    {
      id: 2,
      name: 'Sarah Smith',
      type: 'member',
      memberId: 'MEM002',
      checkIn: '07:00 AM',
      checkOut: '08:30 AM',
      duration: '1h 30m',
      date: '2024-01-20',
      status: 'completed',
      activity: 'Yoga Class',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    {
      id: 3,
      name: 'Mike Chen',
      type: 'trainer',
      memberId: 'TRN001',
      checkIn: '05:45 AM',
      checkOut: '02:00 PM',
      duration: '8h 15m',
      date: '2024-01-20',
      status: 'completed',
      activity: 'Training Sessions',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    {
      id: 4,
      name: 'Emily Brown',
      type: 'member',
      memberId: 'MEM003',
      checkIn: '09:00 AM',
      checkOut: '--:--',
      duration: 'Active',
      date: '2024-01-20',
      status: 'active',
      activity: 'Cardio',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
    },
    {
      id: 5,
      name: 'David Wilson',
      type: 'member',
      memberId: 'MEM004',
      checkIn: '10:30 AM',
      checkOut: '11:45 AM',
      duration: '1h 15m',
      date: '2024-01-20',
      status: 'completed',
      activity: 'CrossFit',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
    },
    {
      id: 6,
      name: 'Emily Rodriguez',
      type: 'trainer',
      memberId: 'TRN002',
      checkIn: '06:00 AM',
      checkOut: '--:--',
      duration: 'Active',
      date: '2024-01-20',
      status: 'active',
      activity: 'Yoga Instruction',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    }
  ];

  // Statistics
  const stats = {
    totalCheckIns: 156,
    currentlyActive: 42,
    avgDuration: '1h 45m',
    peakHour: '6:00 PM',
    memberAttendance: 142,
    trainerAttendance: 14,
    attendanceRate: '85%',
    trend: '+12%'
  };

  // Hourly distribution data for chart
  const hourlyData = {
    labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM'],
    datasets: [
      {
        label: 'Check-ins',
        data: [15, 25, 30, 20, 18, 22, 28, 25, 20, 18, 25, 35, 45, 40, 30],
        borderColor: '#facc15',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Weekly attendance data
  const weeklyData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Members',
        data: [120, 135, 128, 142, 138, 165, 95],
        backgroundColor: '#facc15'
      },
      {
        label: 'Trainers',
        data: [12, 14, 13, 14, 14, 16, 10],
        backgroundColor: '#eab308'
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
          color: '#fff'
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesDate = record.date === selectedDate;
    return matchesSearch && matchesType && matchesDate;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-400/20 text-green-400';
      case 'completed': return 'bg-gray-400/20 text-gray-400';
      case 'late': return 'bg-yellow-400/20 text-yellow-400';
      default: return 'bg-gray-400/20 text-gray-400';
    }
  };

  const handleCheckIn = (id) => {
    // Handle check-in logic
    console.log('Check-in for:', id);
  };

  const handleCheckOut = (id) => {
    // Handle check-out logic
    console.log('Check-out for:', id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Attendance Tracking</h1>
          <p className="text-gray-400 mt-1">Monitor member and trainer check-ins</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="secondary" icon={Download}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-yellow-400" />
            <div className="flex items-center text-sm text-green-400">
              <ArrowUp className="h-4 w-4" />
              <span>{stats.trend}</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.totalCheckIns}</h3>
          <p className="text-gray-400 text-sm mt-1">Total Check-ins Today</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.currentlyActive}</h3>
          <p className="text-gray-400 text-sm mt-1">Currently in Gym</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.avgDuration}</h3>
          <p className="text-gray-400 text-sm mt-1">Average Session</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.peakHour}</h3>
          <p className="text-gray-400 text-sm mt-1">Peak Hour Today</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">Today's Hourly Distribution</h3>
          <div className="h-64">
            <Line data={hourlyData} options={chartOptions} />
          </div>
        </div>

        {/* Weekly Attendance */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">Weekly Attendance</h3>
          <div className="h-64">
            <Bar data={weeklyData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Date Picker */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="all">All</option>
              <option value="member">Members Only</option>
              <option value="trainer">Trainers Only</option>
            </select>

            {/* View Mode */}
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="daily">Daily View</option>
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Members Present</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.memberAttendance}</p>
            </div>
            <UserCheck className="h-10 w-10 text-yellow-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Trainers Present</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.trainerAttendance}</p>
            </div>
            <UserCheck className="h-10 w-10 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Attendance Rate</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.attendanceRate}</p>
            </div>
            <BarChart3 className="h-10 w-10 text-blue-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Attendance Records - {selectedDate}</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr className="text-left text-gray-400 text-sm">
                <th className="p-4">Member/Trainer</th>
                <th className="p-4">ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Check Out</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Activity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={record.avatar} 
                        alt={record.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <span className="text-white font-medium">{record.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{record.memberId}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.type === 'trainer' 
                        ? 'bg-purple-400/20 text-purple-400' 
                        : 'bg-blue-400/20 text-blue-400'
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{record.checkIn}</td>
                  <td className="p-4 text-gray-300">{record.checkOut}</td>
                  <td className="p-4">
                    <span className={`font-medium ${
                      record.status === 'active' ? 'text-green-400' : 'text-gray-300'
                    }`}>
                      {record.duration}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{record.activity}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {record.status === 'active' ? (
                      <button 
                        onClick={() => handleCheckOut(record.id)}
                        className="px-3 py-1 bg-red-400/20 text-red-400 rounded-lg hover:bg-red-400/30 transition-colors text-sm font-medium"
                      >
                        Check Out
                      </button>
                    ) : (
                      <button className="px-3 py-1 text-gray-500 text-sm" disabled>
                        Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing {filteredRecords.length} records
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-yellow-400 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 bg-yellow-400 text-black rounded font-medium">
              1
            </button>
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-yellow-400 transition-colors">
              2
            </button>
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-yellow-400 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Quick Check-in Section */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4">Quick Check-in</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Member ID or scan QR code..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <Button variant="primary" icon={CheckCircle}>
            Check In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Attendance;