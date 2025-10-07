import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Calendar, Dumbbell, Apple, Clock, TrendingUp, 
  CheckCircle, Activity, ChevronDown, LogOut, UserCircle,
  ChevronRight, Bell, Loader2
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ApiService from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MemberDashboard = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State for member data
  const [memberData, setMemberData] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [physicalMetrics, setPhysicalMetrics] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);

  // Fetch member data on component mount
  useEffect(() => {
    fetchMemberData();
    fetchAttendanceData();
  }, []);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Extract member ID from profile or user object
      // The login response stores the profile which contains the member id
      let memberId = null;
      
      if (user.profile && user.profile.id) {
        memberId = user.profile.id;
      } else if (user.member_id) {
        memberId = user.member_id;
      } else {
        // Try fetching current user info from /auth/me endpoint
        try {
          const meResponse = await ApiService.getCurrentUser();
          if (meResponse.user && meResponse.user.profile && meResponse.user.profile.id) {
            memberId = meResponse.user.profile.id;
            // Update localStorage with complete user info
            localStorage.setItem('user', JSON.stringify(meResponse.user));
          }
        } catch (meError) {
          console.error('Error fetching user profile:', meError);
        }
      }
      
      if (!memberId) {
        setError('Member profile not found. Please log in again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
        return;
      }

      console.log('Fetching member data for ID:', memberId);
      
      // Fetch member details
      const response = await ApiService.getMember(memberId);
      console.log('Member data received:', response);
      setMemberData(response.member);
      
      // Extract physical metrics
      if (response.member.physical_metrics && response.member.physical_metrics.length > 0) {
        setPhysicalMetrics(response.member.physical_metrics);
      }
      
      // Extract workout plans
      if (response.member.workout_plans && response.member.workout_plans.length > 0) {
        setWorkoutPlans(response.member.workout_plans);
      }
      
      // Extract diet plans
      if (response.member.diet_plans && response.member.diet_plans.length > 0) {
        setDietPlans(response.member.diet_plans);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching member data:', err);
      setError(err.message || 'Failed to load member data. Please try logging in again.');
      
      // If it's an auth error, redirect to login
      if (err.message && (err.message.includes('401') || err.message.includes('token') || err.message.includes('Unauthorized'))) {
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Extract member ID from profile
      let memberId = null;
      if (user.profile && user.profile.id) {
        memberId = user.profile.id;
      } else if (user.member_id) {
        memberId = user.member_id;
      }
      
      if (!memberId) {
        console.warn('Member ID not found for attendance stats');
        return;
      }
      
      console.log('Fetching attendance stats for member:', memberId);
      
      // Fetch member-specific attendance stats
      const stats = await ApiService.getAttendanceStats({ member_id: memberId, period: 'month' });
      console.log('Attendance stats received:', stats);
      
      // Calculate weekly attendance from daily_visits
      let weeklyAttendance = [0, 0, 0, 0];
      
      if (stats.daily_visits && Object.keys(stats.daily_visits).length > 0) {
        // Sort dates and group by week
        const dates = Object.keys(stats.daily_visits).sort();
        const today = new Date();
        const fourWeeksAgo = new Date(today);
        fourWeeksAgo.setDate(today.getDate() - 28); // 4 weeks = 28 days
        
        // Group visits by week (0 = most recent week, 3 = 4 weeks ago)
        dates.forEach(dateStr => {
          const visitDate = new Date(dateStr);
          if (visitDate >= fourWeeksAgo && visitDate <= today) {
            const daysAgo = Math.floor((today - visitDate) / (1000 * 60 * 60 * 24));
            const weekIndex = Math.min(Math.floor(daysAgo / 7), 3); // 0-3 for 4 weeks
            weeklyAttendance[3 - weekIndex] += stats.daily_visits[dateStr]; // Reverse so week 1 is oldest
          }
        });
      }
      
      // Transform the stats to match expected format
      setAttendanceStats({
        attendance_percentage: stats.member_info?.attendance_rate || 0,
        total_hours: stats.total_workout_hours || 0,
        days_attended: stats.total_visits || 0,
        weekly_attendance: weeklyAttendance
      });
      
      console.log('Transformed attendance stats:', {
        attendance_percentage: stats.member_info?.attendance_rate || 0,
        total_hours: stats.total_workout_hours || 0,
        days_attended: stats.total_visits || 0,
        weekly_attendance: weeklyAttendance
      });
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
      // Set default values on error
      setAttendanceStats({
        attendance_percentage: 0,
        total_hours: 0,
        days_attended: 0,
        weekly_attendance: [0, 0, 0, 0]
      });
    }
  };

  // Calculate BMI from latest physical metrics
  const calculateBMI = () => {
    if (physicalMetrics.length > 0) {
      const latest = physicalMetrics[0];
      if (latest.bmi) {
        return latest.bmi.toFixed(1);
      }
      if (latest.weight_kg && latest.height_cm) {
        const heightM = latest.height_cm / 100;
        const bmi = latest.weight_kg / (heightM * heightM);
        return bmi.toFixed(1);
      }
    }
    return 'N/A';
  };

  // Calculate days left in membership
  const calculateDaysLeft = () => {
    // Backend returns membership_history, not memberships
    const memberships = memberData?.membership_history || memberData?.memberships || [];
    
    if (memberships.length > 0) {
      // Find active membership or use the first one
      const activeMembership = memberships.find(m => m.status === 'active') || memberships[0];
      
      if (activeMembership.end_date) {
        const endDate = new Date(activeMembership.end_date);
        const today = new Date();
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
      }
    }
    return 0;
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/login');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-yellow-400 animate-spin" />
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !memberData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Failed to load member data'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get current membership plan
  // Backend returns membership_history, not memberships
  const memberships = memberData?.membership_history || memberData?.memberships || [];
  const currentMembership = memberships.find(m => m.status === 'active') || memberships[0];
  const membershipPlanName = currentMembership?.plan_name || currentMembership?.membership_plan?.name || memberData?.membership_type || 'No Plan';
  const daysLeft = calculateDaysLeft();

  // Stats data
  const stats = [
    {
      label: 'Current Plan',
      value: membershipPlanName,
      subtitle: `${daysLeft} days left`,
      icon: Calendar,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      label: 'Attendance',
      value: attendanceStats?.attendance_percentage 
        ? `${Math.round(attendanceStats.attendance_percentage)}%`
        : 'N/A',
      subtitle: 'This month',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      label: 'Gym Time',
      value: attendanceStats?.total_hours 
        ? `${attendanceStats.total_hours} hrs`
        : 'N/A',
      subtitle: 'This month',
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      label: 'BMI',
      value: calculateBMI(),
      subtitle: calculateBMI() !== 'N/A' && parseFloat(calculateBMI()) < 25 ? 'Normal' : 'Track it',
      icon: Activity,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ];

  // Get workout plan data from API (use first plan if available)
  const workoutPlan = workoutPlans.length > 0 ? {
    name: workoutPlans[0].name,
    type: workoutPlans[0].type,
    trainer: workoutPlans[0].trainer_name || 'Not Assigned',
    description: workoutPlans[0].description || 'No description available',
    // Placeholder schedule - this would need to come from workout details API if available
    schedule: [
      { day: 'Monday', focus: 'Chest & Triceps', time: '45 min' },
      { day: 'Tuesday', focus: 'Back & Biceps', time: '45 min' },
      { day: 'Wednesday', focus: 'Rest Day', time: '-' },
      { day: 'Thursday', focus: 'Legs', time: '50 min' },
      { day: 'Friday', focus: 'Shoulders & Abs', time: '40 min' },
      { day: 'Saturday', focus: 'Cardio', time: '30 min' },
      { day: 'Sunday', focus: 'Rest Day', time: '-' }
    ]
  } : {
    name: 'No Workout Plan Assigned',
    type: 'N/A',
    trainer: 'Not Assigned',
    description: 'Please contact your trainer to get a workout plan assigned.',
    schedule: []
  };

  // Get diet plan data from API (use first plan if available)
  const dietPlan = dietPlans.length > 0 ? {
    name: dietPlans[0].name,
    type: dietPlans[0].type,
    nutritionist: dietPlans[0].trainer_name || 'Not Assigned',
    dailyCalories: dietPlans[0].kcal_count || 0,
    description: dietPlans[0].description || 'No description available',
    // Placeholder macros and meals - this would need to come from diet details API if available
    macros: {
      protein: Math.round((dietPlans[0].kcal_count || 2800) * 0.30 / 4), // 30% of calories, 4 kcal per gram
      carbs: Math.round((dietPlans[0].kcal_count || 2800) * 0.50 / 4), // 50% of calories, 4 kcal per gram
      fats: Math.round((dietPlans[0].kcal_count || 2800) * 0.20 / 9) // 20% of calories, 9 kcal per gram
    },
    meals: [
      { name: 'Breakfast', calories: Math.round((dietPlans[0].kcal_count || 2800) * 0.23), time: '7:00 AM' },
      { name: 'Snack', calories: Math.round((dietPlans[0].kcal_count || 2800) * 0.11), time: '10:00 AM' },
      { name: 'Lunch', calories: Math.round((dietPlans[0].kcal_count || 2800) * 0.27), time: '1:00 PM' },
      { name: 'Pre-workout', calories: Math.round((dietPlans[0].kcal_count || 2800) * 0.07), time: '4:00 PM' },
      { name: 'Post-workout', calories: Math.round((dietPlans[0].kcal_count || 2800) * 0.14), time: '6:00 PM' },
      { name: 'Dinner', calories: Math.round((dietPlans[0].kcal_count || 2800) * 0.18), time: '8:00 PM' }
    ]
  } : {
    name: 'No Diet Plan Assigned',
    type: 'N/A',
    nutritionist: 'Not Assigned',
    dailyCalories: 0,
    description: 'Please contact your trainer to get a diet plan assigned.',
    macros: {
      protein: 0,
      carbs: 0,
      fats: 0
    },
    meals: []
  };

  // Attendance chart data (using real data if available)
  const getAttendanceChartData = () => {
    // If we have weekly attendance data, use it
    if (attendanceStats?.weekly_attendance && attendanceStats.weekly_attendance.length > 0) {
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Days Attended',
            data: attendanceStats.weekly_attendance,
            backgroundColor: '#facc15',
            borderRadius: 8
          }
        ]
      };
    }
    
    // Default data if no attendance stats available
    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Days Attended',
          data: [0, 0, 0, 0],
          backgroundColor: '#facc15',
          borderRadius: 8
        }
      ]
    };
  };

  const attendanceData = getAttendanceChartData();

  // Physical metrics chart data (using real data)
  const getPhysicalMetricsChartData = () => {
    if (physicalMetrics.length === 0) {
      return {
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
    }

    // Sort by date (newest first) and take last 6 entries
    const sortedMetrics = [...physicalMetrics]
      .sort((a, b) => new Date(a.measured_at || a.recorded_on) - new Date(b.measured_at || b.recorded_on))
      .slice(-6);

    return {
      labels: sortedMetrics.map(m => new Date(m.measured_at || m.recorded_on).toLocaleDateString('en-US', { month: 'short' })),
      datasets: [
        {
          label: 'Weight (kg)',
          data: sortedMetrics.map(m => m.weight_kg || 0),
          borderColor: '#facc15',
          backgroundColor: 'rgba(250, 204, 21, 0.1)',
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'BMI',
          data: sortedMetrics.map(m => m.bmi || 0),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    };
  };

  const physicalMetricsData = getPhysicalMetricsChartData();

  // Get latest physical metrics for display
  const latestMetrics = physicalMetrics.length > 0 ? physicalMetrics[0] : null;

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
              <span className="text-white font-medium hidden sm:block">
                {memberData.first_name} {memberData.last_name}
              </span>
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
                  onClick={handleLogout}
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
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {memberData.first_name}!
            </h1>
            <p className="text-gray-400 mt-1">
              Here's your fitness journey overview for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
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
                <h4 className={`font-semibold ${workoutPlans.length > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                  {workoutPlan.name}
                </h4>
                <p className="text-gray-400 text-sm mt-1">{workoutPlan.description}</p>
                {workoutPlans.length > 0 && workoutPlan.type && (
                  <p className="text-gray-500 text-xs mt-1">Type: {workoutPlan.type}</p>
                )}
              </div>

              {workoutPlan.schedule.length > 0 ? (
                <div className="space-y-2">
                  {workoutPlan.schedule.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                      <span className="text-white text-sm font-medium">{day.day}</span>
                      <span className="text-gray-400 text-sm">{day.focus}</span>
                      <span className="text-yellow-400 text-sm">{day.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">No schedule available yet</p>
                </div>
              )}
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
                    <p className="text-gray-400 text-sm">
                      {dietPlans.length > 0 && dietPlan.dailyCalories > 0 
                        ? `Daily target: ${dietPlan.dailyCalories} kcal`
                        : 'By ' + dietPlan.nutritionist}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className={`font-semibold ${dietPlans.length > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                  {dietPlan.name}
                </h4>
                {dietPlans.length > 0 && dietPlan.description && (
                  <p className="text-gray-400 text-sm mt-1">{dietPlan.description}</p>
                )}
                {dietPlans.length > 0 && dietPlan.dailyCalories > 0 && (
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
                )}
              </div>

              {dietPlan.meals.length > 0 ? (
                <div className="space-y-2">
                  {dietPlan.meals.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                      <span className="text-white text-sm font-medium">{meal.name}</span>
                      <span className="text-gray-400 text-sm">{meal.calories} kcal</span>
                      <span className="text-yellow-400 text-sm">{meal.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">No meal plan available yet</p>
                </div>
              )}
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
                <p className="text-3xl font-bold text-yellow-400">
                  {attendanceStats && attendanceStats.attendance_percentage !== undefined
                    ? `${Math.round(attendanceStats.attendance_percentage)}%`
                    : 'N/A'}
                </p>
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
                  <p className="text-xl font-bold text-white">
                    {latestMetrics?.weight_kg ? `${latestMetrics.weight_kg} kg` : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Height</p>
                  <p className="text-xl font-bold text-white">
                    {latestMetrics?.height_cm ? `${latestMetrics.height_cm} cm` : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">BMI</p>
                  <p className="text-xl font-bold text-green-400">{calculateBMI()}</p>
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
                  <p className="text-white text-lg">{memberData.first_name}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Last Name</label>
                  <p className="text-white text-lg">{memberData.last_name}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p className="text-white text-lg">{memberData.email}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Phone</label>
                  <p className="text-white text-lg">
                    {memberData.phones && memberData.phones.length > 0 
                      ? memberData.phones[0] 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Date of Birth</label>
                  <p className="text-white text-lg">
                    {memberData.dob 
                      ? new Date(memberData.dob).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Age / Gender</label>
                  <p className="text-white text-lg">
                    {memberData.age ? `${memberData.age} yrs` : calculateAge(memberData.dob) ? `${calculateAge(memberData.dob)} yrs` : 'N/A'}
                    {memberData.gender ? ` • ${memberData.gender}` : ''}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Joined Date</label>
                  <p className="text-white text-lg">
                    {memberData.joined_on 
                      ? new Date(memberData.joined_on).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Emergency Contact</label>
                  <p className="text-white text-lg">
                    {memberData.emergency_contact || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Address</label>
                <p className="text-white text-lg">
                  {memberData.addresses && memberData.addresses.length > 0
                    ? `${memberData.addresses[0].street_name || ''}, ${memberData.addresses[0].city_name || ''}, ${memberData.addresses[0].state_name || ''} ${memberData.addresses[0].postal_code || ''}`.replace(/^,\s*|,\s*$/g, '')
                    : 'N/A'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
                <div>
                  <label className="text-gray-400 text-sm">Current Plan</label>
                  <p className="text-yellow-400 text-lg font-semibold">{membershipPlanName}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Plan Expiry</label>
                  <p className="text-white text-lg">
                    {currentMembership?.end_date 
                      ? new Date(currentMembership.end_date).toLocaleDateString()
                      : 'N/A'}
                  </p>
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