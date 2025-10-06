import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Award, Calendar, Edit2, Save, X,
  Users, FileText, Salad, TrendingUp, CheckCircle,
  Activity, Target, Clock, Plus, ChevronRight, Briefcase,
  Star, BarChart3, Heart, AlertCircle, Eye, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrainerProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Trainer profile state
  const [trainerData, setTrainerData] = useState({
    id: 1,
    name: 'John Smith',
    email: 'john.smith@fithub.com',
    phone: '+1 234-567-8900',
    specialization: 'Strength Training, HIIT, Nutrition',
    experience_years: 8,
    bio: 'Certified personal trainer with 8+ years of experience in strength training and nutrition coaching. Specialized in helping clients achieve their fitness goals through customized workout and diet plans. Former competitive athlete with a passion for transforming lives through fitness.',
    certification: 'ACE Certified Personal Trainer, NASM Nutrition Coach',
    rating: 4.8,
    total_clients_trained: 156,
    joined_date: '2020-03-15'
  });

  // Editable form data
  const [formData, setFormData] = useState({ ...trainerData });

  // Trainer stats
  const [stats, setStats] = useState({
    total_members: 24,
    active_workout_plans: 18,
    active_diet_plans: 15,
    sessions_this_month: 48,
    client_satisfaction: 95,
    avg_client_progress: 78
  });

  // Assigned members data
  const [assignedMembers, setAssignedMembers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      age: 28,
      gender: 'Female',
      joined_date: '2024-01-15',
      workout_plan: 'Beginner Strength Training',
      diet_plan: 'Weight Loss Accelerator',
      progress: 85,
      status: 'active',
      last_session: '2024-06-10',
      next_session: '2024-06-12'
    },
    {
      id: 2,
      name: 'Mike Chen',
      age: 35,
      gender: 'Male',
      joined_date: '2024-02-20',
      workout_plan: 'Advanced HIIT Program',
      diet_plan: 'Muscle Builder Pro',
      progress: 72,
      status: 'active',
      last_session: '2024-06-09',
      next_session: '2024-06-11'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      age: 24,
      gender: 'Female',
      joined_date: '2024-03-10',
      workout_plan: 'Flexibility & Mobility',
      diet_plan: 'Balanced Lifestyle',
      progress: 65,
      status: 'active',
      last_session: '2024-06-08',
      next_session: '2024-06-13'
    },
    {
      id: 4,
      name: 'Alex Brown',
      age: 31,
      gender: 'Male',
      joined_date: '2023-12-05',
      workout_plan: 'CrossFit Training',
      diet_plan: 'Performance Nutrition',
      progress: 45,
      status: 'inactive',
      last_session: '2024-06-01',
      next_session: '-'
    },
    {
      id: 5,
      name: 'Lisa Davis',
      age: 29,
      gender: 'Female',
      joined_date: '2024-01-20',
      workout_plan: 'Circuit Training',
      diet_plan: 'Mediterranean Diet',
      progress: 92,
      status: 'active',
      last_session: '2024-06-10',
      next_session: '2024-06-12'
    }
  ]);

  // Achievement badges
  const achievements = [
    { icon: Award, label: '100+ Clients', achieved: true },
    { icon: Star, label: 'Top Rated', achieved: true },
    { icon: Target, label: '500+ Sessions', achieved: true },
    { icon: Heart, label: 'Client Favorite', achieved: true }
  ];

  // Simulate API call
  useEffect(() => {
    fetchTrainerData();
  }, []);

  const fetchTrainerData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      // const response = await axios.get('/api/trainer/profile');
      // setTrainerData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch trainer data');
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setFormData({ ...trainerData });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      // await axios.put('/api/trainer/profile', formData);
      setTrainerData({ ...formData });
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-400/20">
          <CheckCircle className="h-3 w-3" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-400 border border-red-400/20">
        <X className="h-3 w-3" />
        Inactive
      </span>
    );
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-400';
    if (progress >= 60) return 'bg-yellow-400';
    if (progress >= 40) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Trainer Profile</h1>
        <p className="text-gray-400">Manage your profile and view your statistics</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-400/20 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-green-400">{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-auto">
            <X className="h-4 w-4 text-green-400" />
          </button>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-400/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="h-4 w-4 text-red-400" />
          </button>
        </div>
      )}

      {/* Trainer Info Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <User className="h-5 w-5 text-yellow-400" />
            Personal Information
          </h2>
          <button
            onClick={handleEditToggle}
            className="px-4 py-2 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-300 flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                />
              ) : (
                <p className="text-white text-lg">{trainerData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                />
              ) : (
                <p className="text-white">{trainerData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                />
              ) : (
                <p className="text-white">{trainerData.phone}</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Specialization
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                />
              ) : (
                <p className="text-white">{trainerData.specialization}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Years of Experience
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => handleInputChange('experience_years', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                />
              ) : (
                <p className="text-white">{trainerData.experience_years} years</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certifications
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.certification}
                  onChange={(e) => handleInputChange('certification', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                />
              ) : (
                <p className="text-white">{trainerData.certification}</p>
              )}
            </div>
          </div>

          {/* Bio - Full Width */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Bio / Description
            </label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-yellow-400"
              />
            ) : (
              <p className="text-gray-300 leading-relaxed">{trainerData.bio}</p>
            )}
          </div>
        </div>

        {/* Save Button - Only show when editing */}
        {isEditing && (
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-800">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        )}

        {/* Achievement Badges */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Achievements</h3>
          <div className="flex flex-wrap gap-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                    achievement.achieved
                      ? 'bg-yellow-900/20 border-yellow-400/20 text-yellow-400'
                      : 'bg-gray-800 border-gray-700 text-gray-500'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{achievement.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trainer Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-yellow-400" />
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.total_members}</p>
          <p className="text-xs text-gray-400">Total Members</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <Activity className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.active_workout_plans}</p>
          <p className="text-xs text-gray-400">Workout Plans</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Salad className="h-5 w-5 text-green-400" />
            <Activity className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.active_diet_plans}</p>
          <p className="text-xs text-gray-400">Diet Plans</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            <Clock className="h-4 w-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.sessions_this_month}</p>
          <p className="text-xs text-gray-400">Sessions/Month</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Heart className="h-5 w-5 text-red-400" />
            <Star className="h-4 w-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.client_satisfaction}%</p>
          <p className="text-xs text-gray-400">Satisfaction</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-5 w-5 text-orange-400" />
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.avg_client_progress}%</p>
          <p className="text-xs text-gray-400">Avg Progress</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => navigate('/trainer/workout-plans')}
          className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Workout Plan
        </button>
        <button
          onClick={() => navigate('/trainer/diet-plans')}
          className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Diet Plan
        </button>
        <button
          onClick={() => navigate('/trainer/members')}
          className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          View All Members
        </button>
      </div>

      {/* Assigned Members Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-yellow-400" />
            Assigned Members
          </h2>
          <span className="text-sm text-gray-400">
            {assignedMembers.filter(m => m.status === 'active').length} active of {assignedMembers.length} total
          </span>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="pb-3 px-2">Member Name</th>
                <th className="pb-3 px-2">Age/Gender</th>
                <th className="pb-3 px-2">Workout Plan</th>
                <th className="pb-3 px-2">Diet Plan</th>
                <th className="pb-3 px-2">Progress</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedMembers.map((member) => (
                <tr key={member.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium text-white">{member.name}</p>
                      <p className="text-xs text-gray-400">Since {member.joined_date}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-gray-300">{member.age} yrs</p>
                    <p className="text-xs text-gray-400">{member.gender}</p>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-blue-400" />
                      <span className="text-sm text-gray-300">{member.workout_plan}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <Salad className="h-3 w-3 text-green-400" />
                      <span className="text-sm text-gray-300">{member.diet_plan}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(member.progress)}`}
                          style={{ width: `${member.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{member.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => navigate(`/trainer/member/${member.id}`)}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Next Sessions Summary */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Upcoming Sessions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {assignedMembers
              .filter(m => m.status === 'active')
              .slice(0, 3)
              .map((member) => (
                <div key={member.id} className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-white">{member.name}</p>
                    <span className="text-xs text-yellow-400">{member.next_session}</span>
                  </div>
                  <p className="text-xs text-gray-400">Last session: {member.last_session}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;