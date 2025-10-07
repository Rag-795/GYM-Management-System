import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Eye, Mail, Phone, Calendar, MapPin, 
  UserPlus, Activity, Award, X, User2, AlertCircle,
  RefreshCw, FileText, Salad, Target, Clock, TrendingUp,
  Users, CheckCircle, Dumbbell, MessageSquare
} from 'lucide-react';
import { Alert } from '../../components/Alert';
import ApiService from '../../services/api';

const TrainerMembers = () => {
  // State for data
  const [members, setMembers] = useState([]);
  const [membershipPlanNames, setMembershipPlanNames] = useState([]);
  
  // State for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    membership_type: ''
  });
  
  // State for loading and pagination
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  
  const perPage = 20;

  // Fetch trainer's assigned members
  const fetchMyMembers = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(page === 1);
      setError(null);
      
      const params = {
        page,
        limit: perPage,
        ...(search && { search }),
        ...(status !== 'all' && { status })
      };
      
      const response = await ApiService.getMembers(params);
      
      setMembers(response.members || []);
      setTotalPages(response.pages || 1);
      setTotalMembers(response.total || 0);
      setCurrentPage(page);
      
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err.message || 'Failed to fetch your members');
    } finally {
      setLoading(false);
    }
  };

  // Fetch membership plan names for filtering
  const fetchMembershipPlanNames = async () => {
    try {
      const namesResponse = await ApiService.getMembershipPlanNames();
      setMembershipPlanNames(namesResponse.plans || []);
    } catch (err) {
      console.error('Error fetching membership plans:', err);
    }
  };

  // Fetch attendance statistics
  const fetchAttendanceStats = async () => {
    try {
      const response = await ApiService.getAttendanceStats();
      setAvgAttendance(response.average_attendance || 0);
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
      
      // Fallback calculation in frontend
      try {
        const activeMembers = members.filter(m => m.is_active).length;
        if (activeMembers > 0) {
          const estimatedAttendance = Math.min(Math.round(activeMembers * 0.6), 100);
          setAvgAttendance(estimatedAttendance);
        }
      } catch (fallbackErr) {
        console.error('Fallback calculation failed:', fallbackErr);
        setAvgAttendance(0);
      }
    }
  };

  // Fetch trainer statistics
  const fetchTrainerStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const trainerId = user.profile?.id || user.id;
      const response = await ApiService.getTrainerMemberStats(trainerId);
      setCompletedSessions(response.completed_sessions || 0);
    } catch (err) {
      console.error('Error fetching trainer stats:', err);
      // Fallback values
      setCompletedSessions(48);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please login to access this page');
      return;
    }
    
    fetchMyMembers(1, searchTerm, filterStatus);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please login to access this page');
      return;
    }
    
    fetchMembershipPlanNames();
    fetchAttendanceStats();
    fetchTrainerStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle view member
  const handleViewMember = async (member) => {
    try {
      const response = await ApiService.getMember(member.id);
      setSelectedMember(response.member);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error fetching member details:', err);
      setError(err.message || 'Failed to fetch member details');
    }
  };

  // Handle add/edit notes for member
  const handleMemberNotes = (member) => {
    // TODO: Implement notes functionality
    console.log('Add notes for:', member.id);
  };

  // Handle assign workout plan
  const handleAssignWorkout = (member) => {
    // Navigate to workout assignment page or open modal
    console.log('Assign workout to:', member.id);
  };

  // Handle assign diet plan
  const handleAssignDiet = (member) => {
    // Navigate to diet assignment page or open modal
    console.log('Assign diet to:', member.id);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchMyMembers(page, searchTerm, filterStatus);
    }
  };

  // Filter handling functions
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    
    if (key === 'search') setSearchTerm(value);
    if (key === 'status') setFilterStatus(value || 'all');
    
    fetchMyMembers(1, newFilters.search, newFilters.status || 'all');
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      membership_type: ''
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
    fetchMyMembers(1, '', 'all');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyMembers(currentPage, filters.search, filters.status || 'all');
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Members</h1>
          <p className="text-gray-400 mt-1">
            {loading ? 'Loading...' : `Total Active Members: ${totalMembers}`}
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => window.location.href = '/trainer/workout-plans'}
            className="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Dumbbell className="h-5 w-5" />
            Workout Plans
          </button>
          <button
            onClick={() => window.location.href = '/trainer/diet-plans'}
            className="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Salad className="h-5 w-5" />
            Diet Plans
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert 
          type="error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Members</p>
              <p className="text-2xl font-bold text-white">
                {members.filter(m => m.is_active).length}
              </p>
            </div>
            <div className="bg-green-400/20 p-2 rounded">
              <Activity className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Members</p>
              <p className="text-2xl font-bold text-white">{totalMembers}</p>
            </div>
            <div className="bg-blue-400/20 p-2 rounded">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Attendance</p>
              <p className="text-2xl font-bold text-white">{avgAttendance}%</p>
            </div>
            <div className="bg-purple-400/20 p-2 rounded">
              <Award className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Sessions This Month</p>
              <p className="text-2xl font-bold text-white">{completedSessions}</p>
            </div>
            <div className="bg-purple-400/20 p-2 rounded">
              <CheckCircle className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select 
              value={filters.membership_type}
              onChange={(e) => handleFilterChange('membership_type', e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="">All Plans</option>
              {membershipPlanNames.map((plan) => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>
            <button
              onClick={clearFilters}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr className="text-left text-gray-400 text-sm">
                <th className="p-4">Member</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Membership</th>
                {/* <th className="p-4">Progress</th> */}
                {/* <th className="p-4">Last Session</th> */}
                <th className="p-4">Status</th>
                {/* <th className="p-4">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                      <span>Loading your members...</span>
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    {filters.search || filters.status || filters.membership_type ? 
                      'No members found matching your filters.' : 
                      'No active members found.'}
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                          <User2 className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {member.full_name || `${member.first_name} ${member.last_name}`}
                          </p>
                          <p className="text-gray-400 text-sm">ID: #{member.id.toString().substring(0, 4)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          {member.email}
                        </div>
                        {member.phones && member.phones.length > 0 && (
                          <div className="flex items-center text-gray-300 text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            {member.phones[0]}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-medium">
                          {member.membership_type || 'Basic'}
                        </span>
                        <p className="text-gray-400 text-xs mt-1">
                          Since: {member.joined_on ? new Date(member.joined_on).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[80px]">
                          <div 
                            className="h-2 rounded-full bg-yellow-400"
                            style={{ width: `${member.progress || 50}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{member.progress || 50}%</span>
                      </div>
                    </td>
                    {/* <td className="p-4">
                      <div>
                        <p className="text-gray-300 text-sm">
                          {member.last_session ? new Date(member.last_session).toLocaleDateString() : 'No sessions yet'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Next: {member.next_session || 'Not scheduled'}
                        </p>
                      </div>
                    </td> */}
                    {/* <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        member.is_active ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                      }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td> */}
                    {/* <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewMember(member)}
                          className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                          title="View Member"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleAssignWorkout(member)}
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Assign Workout"
                        >
                          <Dumbbell className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleAssignDiet(member)}
                          className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                          title="Assign Diet"
                        >
                          <Salad className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleMemberNotes(member)}
                          className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                          title="Add Notes"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalMembers)} of {totalMembers} members
          </p>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className={`px-3 py-1 rounded transition-colors ${
                currentPage === 1 || loading 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-gray-800 text-gray-400 hover:text-yellow-400'
              }`}
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    pageNum === currentPage
                      ? 'bg-yellow-400 text-black'
                      : loading
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-800 text-gray-400 hover:text-yellow-400'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className={`px-3 py-1 rounded transition-colors ${
                currentPage === totalPages || loading
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-800 text-gray-400 hover:text-yellow-400'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Member Modal - Same as admin version */}
      {showViewModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Member Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close">
                <X className="h-6 w-6 hover:cursor-pointer" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/40 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Profile</h4>
                  <div className="space-y-3 text-gray-200">
                    <div className="flex items-center">
                      <User2 className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="flex-1 flex justify-between">
                        <span className="text-gray-400">Full Name</span>
                        <span className="font-medium">
                          {selectedMember.full_name || `${selectedMember.first_name} ${selectedMember.last_name}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="flex-1 flex justify-between">
                        <span className="text-gray-400">Age / Gender</span>
                        <span className="font-medium">
                          {selectedMember.age ? `${selectedMember.age} yrs` : '—'}
                          {selectedMember.gender ? ` • ${selectedMember.gender}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="flex-1 flex justify-between">
                        <span className="text-gray-400">Phone</span>
                        <span className="font-medium">
                          {selectedMember.phones && selectedMember.phones.length > 0 ? selectedMember.phones[0] : '—'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="flex-1 flex justify-between">
                        <span className="text-gray-400">Member Since</span>
                        <span className="font-medium">
                          {selectedMember.joined_on ? new Date(selectedMember.joined_on).toLocaleDateString() : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency & Goals */}
                <div className="bg-gray-800/40 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Emergency & Goals</h4>
                  <div className="space-y-4 text-gray-200">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="w-full">
                        <span className="text-gray-400 block text-sm">Emergency Contact</span>
                        <span className="font-medium">
                          {selectedMember.emergency_contact || '—'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="w-full">
                        <span className="text-gray-400 block text-sm">Fitness Goals</span>
                        <span className="font-medium">
                          {selectedMember.goals || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Info */}
              <div className="bg-gray-800/40 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Health Information</h4>
                <div className="grid grid-cols-3 gap-4 text-white">
                  <div>
                    <p className="text-gray-500 text-sm">Weight</p>
                    <p className="font-semibold">
                      {selectedMember.physical_metrics && selectedMember.physical_metrics.length > 0 && selectedMember.physical_metrics[0].weight_kg
                        ? `${selectedMember.physical_metrics[0].weight_kg} kg`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Height</p>
                    <p className="font-semibold">
                      {selectedMember.physical_metrics && selectedMember.physical_metrics.length > 0 && selectedMember.physical_metrics[0].height_cm
                        ? `${selectedMember.physical_metrics[0].height_cm} cm`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">BMI</p>
                    <p className="font-semibold">
                      {selectedMember.physical_metrics && selectedMember.physical_metrics.length > 0 && selectedMember.physical_metrics[0].bmi
                        ? selectedMember.physical_metrics[0].bmi.toFixed(1)
                        : '—'}
                    </p>
                  </div>
                </div>
                {selectedMember.medical_conditions && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-sm">Medical Conditions</p>
                    <p className="text-white mt-1">{selectedMember.medical_conditions}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleAssignWorkout(selectedMember);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Dumbbell className="h-4 w-4" />
                  Assign Workout Plan
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleAssignDiet(selectedMember);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Salad className="h-4 w-4" />
                  Assign Diet Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerMembers;