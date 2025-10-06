import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import {
  User, Calendar, Dumbbell, Apple, Clock, TrendingUp, 
  CheckCircle, Activity, ChevronDown, LogOut, UserCircle,
  Target, Flame, Heart, ChevronRight, Bell
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

const MemberDashboard = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate(); // Add this

  // Logout handler
  const handleLogout = () => {
    // Clear any stored authentication tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    sessionStorage.clear();
    
    // Redirect to login page
    navigate('/login'); // Adjust the path based on your routing
    
    // If you're using any state management (Redux, Context API), clear the user state here
    // dispatch(logout()); // Example for Redux
  };

  // Sample member data - replace with actual API data
  const memberData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234-567-8900',
    membershipPlan: 'Premium',
    planExpiry: '2024-03-15',
    daysLeft: 45,
    joinedDate: '2023-06-15',
    emergencyContact: '+1 234-567-8901',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001'
    },
    dob: '1990-05-15',
    gender: 'Male'
  };

  const stats = [
    {
      label: 'Current Plan',
      value: memberData.membershipPlan,
      subtitle: `${memberData.daysLeft} days left`,
      icon: Calendar,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      label: 'Attendance',
      value: '85%',
      subtitle: 'This month',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      label: 'Gym Time',
      value: '42.5 hrs',
      subtitle: 'This month',
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      label: 'BMI',
      value: '22.8',
      subtitle: 'Normal',
      icon: Activity,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ];

  const workoutPlan = {
    name: 'Muscle Building Program',
    type: 'Strength Training',
    trainer: 'Mike Chen',
    description: 'A comprehensive 12-week muscle building program focusing on progressive overload',
    schedule: [
      { day: 'Monday', focus: 'Chest & Triceps', time: '45 min' },
      { day: 'Tuesday', focus: 'Back & Biceps', time: '45 min' },
      { day: 'Wednesday', focus: 'Rest Day', time: '-' },
      { day: 'Thursday', focus: 'Legs', time: '50 min' },
      { day: 'Friday', focus: 'Shoulders & Abs', time: '40 min' },
      { day: 'Saturday', focus: 'Cardio', time: '30 min' },
      { day: 'Sunday', focus: 'Rest Day', time: '-' }
    ]
  };

  const dietPlan = {
    name: 'High Protein Diet',
    type: 'Muscle Gain',
    nutritionist: 'Sarah Johnson',
    dailyCalories: 2800,
    macros: {
      protein: 180,
      carbs: 350,
      fats: 80
    },
    meals: [
      { name: 'Breakfast', calories: 650, time: '7:00 AM' },
      { name: 'Snack', calories: 300, time: '10:00 AM' },
      { name: 'Lunch', calories: 750, time: '1:00 PM' },
      { name: 'Pre-workout', calories: 200, time: '4:00 PM' },
      { name: 'Post-workout', calories: 400, time: '6:00 PM' },
      { name: 'Dinner', calories: 500, time: '8:00 PM' }
    ]
  };

  // Attendance chart data
  const attendanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Days Attended',
        data: [5, 6, 4, 5],
        backgroundColor: '#facc15',
        borderRadius: 8
      }
    ]
  };

  // Physical metrics chart data
  const physicalMetricsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Weight (kg)',
        data: [75, 74.5, 74, 73.5, 73, 72.5],
        borderColor: '#facc15',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        yAxisID: 'y',
        tension: 0.4
      },
      {
        label: 'BMI',
        data: [24.2, 24.0, 23.8, 23.7, 23.5, 23.3],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y1',
        tension: 0.4
      }
    ]
  };

  // Macros distribution chart
  const macrosData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [
      {
        data: [dietPlan.macros.protein, dietPlan.macros.carbs, dietPlan.macros.fats],
        backgroundColor: ['#f43f5e', '#facc15', '#3b82f6'],
        borderWidth: 0
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

  const metricsChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
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
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#9ca3af',
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand Name */}
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-lg">
              <Dumbbell className="h-6 w-6 text-black" />
            </div>
            <span className="text-xl font-bold text-white">FitHub</span>
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all"
            >
              <div className="bg-yellow-400 p-1.5 rounded-full">
                <User className="h-4 w-4 text-black" />
              </div>
              <span className="text-white font-medium hidden sm:block">{memberData.firstName} {memberData.lastName}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setShowProfile(true);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-gray-800 flex items-center gap-2"
                >
                  <UserCircle className="h-4 w-4" />
                  My Profile
                </button>
                <button
                  onClick={handleLogout} // Updated to use the logout handler
                  className="w-full px-4 py-3 text-left text-white hover:bg-gray-800 flex items-center gap-2 border-t border-gray-800"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-black text-white">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {memberData.firstName}!
            </h1>
            <p className="text-gray-400 mt-1">Here's your fitness journey overview for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                  </div>
                  <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                  <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                  <p className="text-gray-500 text-xs mt-2">{stat.subtitle}</p>
                </div>
              );
            })}
          </div>

          {/* Plans Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workout Plan */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-400/10 p-2 rounded-lg">
                    <Dumbbell className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Workout Plan</h3>
                    <p className="text-gray-400 text-sm">Assigned by {workoutPlan.trainer}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-yellow-400 font-semibold">{workoutPlan.name}</h4>
                <p className="text-gray-400 text-sm mt-1">{workoutPlan.description}</p>
              </div>

              <div className="space-y-2">
                {workoutPlan.schedule.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                    <span className="text-white text-sm font-medium">{day.day}</span>
                    <span className="text-gray-400 text-sm">{day.focus}</span>
                    <span className="text-yellow-400 text-sm">{day.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diet Plan */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-400/10 p-2 rounded-lg">
                    <Apple className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Diet Plan</h3>
                    <p className="text-gray-400 text-sm">Daily target: {dietPlan.dailyCalories} kcal</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-green-400 font-semibold">{dietPlan.name}</h4>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-gray-800 p-2 rounded text-center">
                    <p className="text-xs text-gray-400">Protein</p>
                    <p className="text-white font-bold">{dietPlan.macros.protein}g</p>
                  </div>
                  <div className="bg-gray-800 p-2 rounded text-center">
                    <p className="text-xs text-gray-400">Carbs</p>
                    <p className="text-white font-bold">{dietPlan.macros.carbs}g</p>
                  </div>
                  <div className="bg-gray-800 p-2 rounded text-center">
                    <p className="text-xs text-gray-400">Fats</p>
                    <p className="text-white font-bold">{dietPlan.macros.fats}g</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {dietPlan.meals.map((meal, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                    <span className="text-white text-sm font-medium">{meal.name}</span>
                    <span className="text-gray-400 text-sm">{meal.calories} kcal</span>
                    <span className="text-yellow-400 text-sm">{meal.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attendance Chart */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Monthly Attendance</h3>
              <div className="h-64">
                <Bar data={attendanceData} options={chartOptions} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-3xl font-bold text-yellow-400">85%</p>
                <p className="text-gray-400 text-sm">Attendance Rate</p>
              </div>
            </div>

            {/* Physical Metrics Chart */}
            <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Physical Metrics Progress</h3>
              <div className="h-64">
                <Line data={physicalMetricsData} options={metricsChartOptions} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Current Weight</p>
                  <p className="text-xl font-bold text-white">72.5 kg</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Height</p>
                  <p className="text-xl font-bold text-white">175 cm</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">BMI</p>
                  <p className="text-xl font-bold text-green-400">22.8</p>
                </div>
              </div>
            </div>
          </div>

          {/* Macros Distribution and Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Macros Distribution</h3>
              <div className="h-48">
                <Doughnut data={macrosData} options={{ ...chartOptions, maintainAspectRatio: true }} />
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#f43f5e] rounded"></div>
                  <span className="text-xs text-gray-400">Protein</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span className="text-xs text-gray-400">Carbs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  <span className="text-xs text-gray-400">Fats</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">This Month's Progress</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <Target className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">20</p>
                  <p className="text-xs text-gray-400">Days Attended</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <Clock className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">42.5</p>
                  <p className="text-xs text-gray-400">Hours in Gym</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <Flame className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">12,450</p>
                  <p className="text-xs text-gray-400">Calories Burned</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <Heart className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">145</p>
                  <p className="text-xs text-gray-400">Avg Heart Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">My Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-400 text-sm">First Name</label>
                  <p className="text-white text-lg">{memberData.firstName}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Last Name</label>
                  <p className="text-white text-lg">{memberData.lastName}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p className="text-white text-lg">{memberData.email}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Phone</label>
                  <p className="text-white text-lg">{memberData.phone}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Date of Birth</label>
                  <p className="text-white text-lg">{memberData.dob}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Gender</label>
                  <p className="text-white text-lg">{memberData.gender}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Joined Date</label>
                  <p className="text-white text-lg">{memberData.joinedDate}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Emergency Contact</label>
                  <p className="text-white text-lg">{memberData.emergencyContact}</p>
                </div>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Address</label>
                <p className="text-white text-lg">
                  {memberData.address.street}, {memberData.address.city}, {memberData.address.state} {memberData.address.postalCode}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
                <div>
                  <label className="text-gray-400 text-sm">Current Plan</label>
                  <p className="text-yellow-400 text-lg font-semibold">{memberData.membershipPlan}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Plan Expiry</label>
                  <p className="text-white text-lg">{memberData.planExpiry}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;