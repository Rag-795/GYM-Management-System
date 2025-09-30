import React from 'react';
import {
  Users, UserCheck, TrendingUp, DollarSign, Calendar,
  Activity, Award, Clock, ArrowUp, ArrowDown
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

const Dashboard = () => {
  // Sample data - replace with actual API data
  const stats = [
    {
      label: 'Total Members',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      label: 'Active Trainers',
      value: '24',
      change: '+2',
      trend: 'up',
      icon: UserCheck,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      label: 'Monthly Revenue',
      value: '$45,678',
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      label: 'Classes Today',
      value: '18',
      change: '-2',
      trend: 'down',
      icon: Calendar,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ];

  const recentMembers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', plan: 'Premium', joinDate: '2024-01-15', status: 'active' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', plan: 'Basic', joinDate: '2024-01-14', status: 'active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', plan: 'Elite', joinDate: '2024-01-13', status: 'pending' },
    { id: 4, name: 'Emily Brown', email: 'emily@example.com', plan: 'Premium', joinDate: '2024-01-12', status: 'active' },
    { id: 5, name: 'David Wilson', email: 'david@example.com', plan: 'Basic', joinDate: '2024-01-11', status: 'inactive' }
  ];

  const upcomingClasses = [
    { id: 1, name: 'Morning Yoga', trainer: 'Emily Rodriguez', time: '06:00 AM', duration: '60 min', enrolled: 15 },
    { id: 2, name: 'HIIT Training', trainer: 'Mike Chen', time: '08:00 AM', duration: '45 min', enrolled: 20 },
    { id: 3, name: 'Strength Training', trainer: 'John Smith', time: '10:00 AM', duration: '50 min', enrolled: 12 },
    { id: 4, name: 'CrossFit', trainer: 'Sarah Johnson', time: '04:00 PM', duration: '45 min', enrolled: 18 }
  ];

  // Chart configurations
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [32000, 35000, 38000, 42000, 41000, 45678],
        borderColor: '#facc15',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const membershipChartData = {
    labels: ['Basic', 'Premium', 'Elite'],
    datasets: [
      {
        data: [450, 680, 104],
        backgroundColor: ['#facc15', '#3b82f6', '#f43f5e'],
        borderWidth: 0
      }
    ]
  };

  const attendanceChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Check-ins',
        data: [120, 145, 160, 140, 180, 210, 150],
        backgroundColor: '#facc15'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here's your gym overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-400/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  <span className="ml-1">{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">Revenue Overview</h3>
          <div className="h-64">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Membership Distribution */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">Membership Distribution</h3>
          <div className="h-64">
            <Doughnut data={membershipChartData} options={{ ...chartOptions, maintainAspectRatio: true }} />
          </div>
        </div>
      </div>

      {/* Attendance Chart */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4">Weekly Attendance</h3>
        <div className="h-64">
          <Bar data={attendanceChartData} options={chartOptions} />
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Members</h3>
            <button className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-3">Member</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentMembers.map((member) => (
                  <tr key={member.id} className="border-t border-gray-800">
                    <td className="py-3">
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-gray-400 text-xs">{member.email}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-gray-300">{member.plan}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === 'active' ? 'bg-green-400/20 text-green-400' :
                        member.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-400/20 text-red-400'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Today's Classes</h3>
            <button className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold">View Schedule</button>
          </div>
          <div className="space-y-3">
            {upcomingClasses.map((class_) => (
              <div key={class_.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">{class_.name}</p>
                  <p className="text-gray-400 text-sm">{class_.trainer} • {class_.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-semibold">{class_.time}</p>
                  <p className="text-gray-400 text-sm">{class_.enrolled} enrolled</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// import React, { useState, useEffect } from 'react';
// import {
//   Users, UserCheck, TrendingUp, DollarSign, Calendar,
//   Activity, Award, Clock, ArrowUp, ArrowDown, AlertCircle,
//   CreditCard, Package, Dumbbell, ChevronRight
// } from 'lucide-react';
// import { Line, Bar, Doughnut } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// } from 'chart.js';
// import { Button } from '../../components/Button';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

// const Dashboard = () => {
//   const [timeRange, setTimeRange] = useState('week');
//   const [loading, setLoading] = useState(false);

//   // Sample data - replace with actual API data
//   const stats = [
//     {
//       label: 'Total Members',
//       value: '1,234',
//       change: '+12%',
//       trend: 'up',
//       icon: Users,
//       color: 'text-yellow-400',
//       bgColor: 'bg-yellow-400/10',
//       description: '45 new this month'
//     },
//     {
//       label: 'Active Trainers',
//       value: '24',
//       change: '+2',
//       trend: 'up',
//       icon: UserCheck,
//       color: 'text-green-400',
//       bgColor: 'bg-green-400/10',
//       description: '18 sessions today'
//     },
//     {
//       label: 'Monthly Revenue',
//       value: '$45,678',
//       change: '+18%',
//       trend: 'up',
//       icon: DollarSign,
//       color: 'text-blue-400',
//       bgColor: 'bg-blue-400/10',
//       description: '$2,345 pending'
//     },
//     {
//       label: 'Active Memberships',
//       value: '892',
//       change: '-3%',
//       trend: 'down',
//       icon: CreditCard,
//       color: 'text-purple-400',
//       bgColor: 'bg-purple-400/10',
//       description: '23 expiring soon'
//     }
//   ];

//   const quickActions = [
//     { label: 'Add Member', icon: Users, path: '/admin/members/new', color: 'bg-yellow-400' },
//     { label: 'New Trainer', icon: UserCheck, path: '/admin/trainers/new', color: 'bg-green-400' },
//     { label: 'Create Plan', icon: Dumbbell, path: '/admin/plans/new', color: 'bg-blue-400' },
//     { label: 'Record Payment', icon: DollarSign, path: '/admin/billing/new', color: 'bg-purple-400' }
//   ];

//   const recentActivities = [
//     { id: 1, type: 'member', action: 'New member registered', user: 'John Doe', time: '5 minutes ago', icon: Users },
//     { id: 2, type: 'payment', action: 'Payment received', user: 'Sarah Smith', amount: '$59', time: '15 minutes ago', icon: CreditCard },
//     { id: 3, type: 'trainer', action: 'Trainer assigned', user: 'Mike Chen to Emily Brown', time: '1 hour ago', icon: UserCheck },
//     { id: 4, type: 'class', action: 'Class completed', user: 'Morning Yoga', count: '15 attendees', time: '2 hours ago', icon: Calendar },
//     { id: 5, type: 'equipment', action: 'Maintenance scheduled', user: 'Treadmill #3', time: '3 hours ago', icon: Package }
//   ];

//   const upcomingTasks = [
//     { id: 1, task: 'Review membership renewals', due: 'Today', priority: 'high', count: 12 },
//     { id: 2, task: 'Equipment maintenance check', due: 'Tomorrow', priority: 'medium', count: 5 },
//     { id: 3, task: 'Trainer performance reviews', due: 'This week', priority: 'low', count: 8 },
//     { id: 4, task: 'Process pending payments', due: 'Today', priority: 'high', count: 7 }
//   ];

//   const topPerformers = [
//     { id: 1, name: 'Mike Chen', role: 'Trainer', metric: '98% satisfaction', sessions: 142, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
//     { id: 2, name: 'Sarah Johnson', role: 'Trainer', metric: '95% satisfaction', sessions: 128, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
//     { id: 3, name: 'John Smith', role: 'Trainer', metric: '94% satisfaction', sessions: 115, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }
//   ];

//   // Chart configurations
//   const revenueChartData = {
//     labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//     datasets: [
//       {
//         label: 'Revenue',
//         data: [4200, 5100, 4800, 6200, 7100, 8900, 6500],
//         borderColor: '#facc15',
//         backgroundColor: 'rgba(250, 204, 21, 0.1)',
//         fill: true,
//         tension: 0.4
//       },
//       {
//         label: 'Last Week',
//         data: [3800, 4500, 4200, 5500, 6200, 7800, 5800],
//         borderColor: '#6b7280',
//         backgroundColor: 'rgba(107, 114, 128, 0.1)',
//         fill: true,
//         tension: 0.4
//       }
//     ]
//   };

//   const membershipChartData = {
//     labels: ['Basic', 'Premium', 'Elite', 'Student', 'Corporate'],
//     datasets: [
//       {
//         data: [350, 480, 104, 180, 120],
//         backgroundColor: ['#facc15', '#eab308', '#fde047', '#fbbf24', '#f59e0b'],
//         borderWidth: 0
//       }
//     ]
//   };

//   const attendanceChartData = {
//     labels: ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'],
//     datasets: [
//       {
//         label: 'Check-ins',
//         data: [45, 78, 92, 65, 48, 85, 120, 95],
//         backgroundColor: '#facc15',
//         borderRadius: 8
//       }
//     ]
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: true,
//         position: 'bottom',
//         labels: {
//           color: '#9ca3af',
//           padding: 20,
//           font: {
//             size: 12
//           }
//         }
//       },
//       tooltip: {
//         backgroundColor: '#1f2937',
//         titleColor: '#f3f4f6',
//         bodyColor: '#d1d5db',
//         borderColor: '#374151',
//         borderWidth: 1
//       }
//     },
//     scales: {
//       y: {
//         grid: {
//           color: 'rgba(255, 255, 255, 0.1)'
//         },
//         ticks: {
//           color: '#9ca3af'
//         }
//       },
//       x: {
//         grid: {
//           color: 'rgba(255, 255, 255, 0.1)'
//         },
//         ticks: {
//           color: '#9ca3af'
//         }
//       }
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Page Header with Actions */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
//           <p className="text-gray-400 mt-1">
//             Welcome back! Last login: {new Date().toLocaleString()}
//           </p>
//         </div>
//         <div className="flex items-center gap-2 mt-4 sm:mt-0">
//           <select
//             value={timeRange}
//             onChange={(e) => setTimeRange(e.target.value)}
//             className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
//           >
//             <option value="today">Today</option>
//             <option value="week">This Week</option>
//             <option value="month">This Month</option>
//             <option value="year">This Year</option>
//           </select>
//           <Button variant="primary">
//             Generate Report
//           </Button>
//         </div>
//       </div>

//       {/* Critical Alerts */}
//       <div className="bg-red-900/20 border border-red-500 rounded-xl p-4">
//         <div className="flex items-start gap-3">
//           <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
//           <div className="flex-1">
//             <h3 className="text-red-400 font-semibold">Attention Required</h3>
//             <p className="text-gray-300 text-sm mt-1">
//               5 memberships expiring today • 3 equipment need maintenance • 2 trainer certifications expiring
//             </p>
//           </div>
//           <button className="text-red-400 hover:text-red-300 text-sm font-semibold">
//             View All
//           </button>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-400/50 transition-all group">
//               <div className="flex items-start justify-between mb-4">
//                 <div className={`${stat.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
//                   <Icon className={`h-6 w-6 ${stat.color}`} />
//                 </div>
//                 <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
//                   {stat.trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
//                   <span className="ml-1 font-semibold">{stat.change}</span>
//                 </div>
//               </div>
//               <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
//               <p className="text-gray-400 text-sm">{stat.label}</p>
//               <p className="text-gray-500 text-xs mt-2">{stat.description}</p>
//             </div>
//           );
//         })}
//       </div>

//       {/* Quick Actions */}
//       <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
//         <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {quickActions.map((action, index) => {
//             const Icon = action.icon;
//             return (
//               <button
//                 key={index}
//                 className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all group"
//               >
//                 <div className={`${action.color} p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform`}>
//                   <Icon className="h-6 w-6 text-black" />
//                 </div>
//                 <span className="text-white text-sm font-medium">{action.label}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Charts Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Revenue Chart */}
//         <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 bg-yellow-400 rounded"></div>
//                 <span className="text-sm text-gray-400">This Week</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 bg-gray-500 rounded"></div>
//                 <span className="text-sm text-gray-400">Last Week</span>
//               </div>
//             </div>
//           </div>
//           <div className="h-64">
//             <Line data={revenueChartData} options={chartOptions} />
//           </div>
//         </div>

//         {/* Membership Distribution */}
//         <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
//           <h3 className="text-lg font-bold text-white mb-6">Membership Types</h3>
//           <div className="h-64">
//             <Doughnut data={membershipChartData} options={{ ...chartOptions, maintainAspectRatio: true }} />
//           </div>
//         </div>
//       </div>

//       {/* Secondary Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Peak Hours Chart */}
//         <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
//           <h3 className="text-lg font-bold text-white mb-6">Today's Peak Hours</h3>
//           <div className="h-48">
//             <Bar data={attendanceChartData} options={chartOptions} />
//           </div>
//         </div>

//         {/* Top Performers */}
//         <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-bold text-white">Top Trainers</h3>
//             <button className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold">
//               View All
//             </button>
//           </div>
//           <div className="space-y-3">
//             {topPerformers.map((performer) => (
//               <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
//                 <div className="flex items-center gap-3">
//                   <img 
//                     src={performer.avatar} 
//                     alt={performer.name}
//                     className="w-10 h-10 rounded-full"
//                   />
//                   <div>
//                     <p className="text-white font-medium">{performer.name}</p>
//                     <p className="text-gray-400 text-xs">{performer.sessions} sessions</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-yellow-400 text-sm font-semibold">{performer.metric}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Upcoming Tasks */}
//         <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-bold text-white">Tasks</h3>
//             <span className="bg-yellow-400/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
//               {upcomingTasks.length} pending
//             </span>
//           </div>
//           <div className="space-y-3">
//             {upcomingTasks.map((task) => (
//               <div key={task.id} className="flex items-start justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
//                 <div className="flex-1">
//                   <p className="text-white text-sm font-medium">{task.task}</p>
//                   <div className="flex items-center gap-3 mt-1">
//                     <span className="text-gray-400 text-xs">{task.due}</span>
//                     <span className={`text-xs px-2 py-0.5 rounded-full ${
//                       task.priority === 'high' ? 'bg-red-400/20 text-red-400' :
//                       task.priority === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
//                       'bg-green-400/20 text-green-400'
//                     }`}>
//                       {task.priority}
//                     </span>
//                   </div>
//                 </div>
//                 <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
//                   {task.count}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Recent Activities */}
//       <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-bold text-white">Recent Activities</h3>
//           <button className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold">
//             View All
//           </button>
//         </div>
//         <div className="space-y-3">
//           {recentActivities.map((activity) => {
//             const Icon = activity.icon;
//             return (
//               <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
//                 <div className="flex items-center gap-3">
//                   <div className="bg-yellow-400/10 p-2 rounded">
//                     <Icon className="h-4 w-4 text-yellow-400" />
//                   </div>
//                   <div>
//                     <p className="text-white text-sm">{activity.action}</p>
//                     <p className="text-gray-400 text-xs">
//                       {activity.user} {activity.amount && `• ${activity.amount}`} {activity.count && `• ${activity.count}`}
//                     </p>
//                   </div>
//                 </div>
//                 <span className="text-gray-500 text-xs">{activity.time}</span>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;