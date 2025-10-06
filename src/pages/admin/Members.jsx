import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, Download, Edit, Trash2, Eye, 
  Mail, Phone, Calendar, MapPin, MoreVertical, UserPlus,
  FileText, CreditCard, Activity, Award, X, Upload, Camera, User2, AlertCircle,
  Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import AddMemberModal from '../../components/AddMemberModal';
import EditMemberModal from '../../components/EditMemberModal';
import ApiService from '../../services/api';

const Members = () => {
  // State for data
  const [members, setMembers] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [membershipPlanNames, setMembershipPlanNames] = useState([]);
  const [trainers, setTrainers] = useState([]);
  
  // State for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
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
  const [avgAttendance, setAvgAttendance] = useState(0);
  
  const perPage = 20;

  // Form state for new member
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    membershipPlan: '',
    startDate: '',
    trainer: '',
    height: '',
    weight: '',
    medicalConditions: '',
    goals: '',
    password: 'defaultpass123' // Default password for new members
  });

  // Fetch members data
  const fetchMembers = async (page = 1, search = '', status = 'all') => {
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
      setError(err.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  // Fetch membership plans
  const fetchMembershipPlans = async () => {
    try {
      // Fetch full membership plan objects (with id, name, price, etc.)
      const plansResponse = await ApiService.getMembershipPlans();
      console.log('Full membership plans response:', plansResponse);
      setMembershipPlans(plansResponse.plans || []);
      
      // Fetch plan names for filtering
      const namesResponse = await ApiService.getMembershipPlanNames();
      console.log('Membership plan names response:', namesResponse);
      setMembershipPlanNames(namesResponse.plans || []);
    } catch (err) {
      console.error('Error fetching membership plans:', err);
    }
  };

  // Fetch trainers
  const fetchTrainers = async () => {
    try {
      const response = await ApiService.getTrainers();
      setTrainers(response.trainers || []);
    } catch (err) {
      console.error('Error fetching trainers:', err);
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
        // Simple fallback: calculate based on current page data
        const activeMembers = members.filter(m => m.is_active).length;
        if (activeMembers > 0) {
          // Estimate based on members with recent activity (very rough estimate)
          const estimatedAttendance = Math.min(Math.round(activeMembers * 0.6), 100);
          setAvgAttendance(estimatedAttendance);
        }
      } catch (fallbackErr) {
        console.error('Fallback calculation failed:', fallbackErr);
        setAvgAttendance(0);
      }
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please login to access this page');
      return;
    }
    
    fetchMembers(1, searchTerm, filterStatus);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please login to access this page');
      return;
    }
    
    fetchMembershipPlans();
    fetchAttendanceStats();
    // Temporarily disable trainer fetching until we fix the trailing slash issue
    // fetchTrainers();
  }, []);

  // Handle add member
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for API
      const memberData = {
        ...formData,
        // Convert camelCase to API format
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: formData.emergencyContact
      };
      
      await ApiService.createMember(memberData);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        zipCode: '',
        emergencyContact: '',
        emergencyPhone: '',
        membershipPlan: '',
        startDate: '',
        trainer: '',
        height: '',
        weight: '',
        medicalConditions: '',
        goals: '',
        password: 'defaultpass123'
      });
      
      setShowAddModal(false);
      
      // Refresh members list
      await fetchMembers(currentPage, searchTerm, filterStatus);
      
    } catch (err) {
      console.error('Error adding member:', err);
      setError(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  // Handle view member
  const handleViewMember = async (member) => {
    try {
      // Fetch detailed member information
      const response = await ApiService.getMember(member.id);
      setSelectedMember(response.member);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error fetching member details:', err);
      setError(err.message || 'Failed to fetch member details');
    }
  };

  // Handle edit member
  const handleEditMember = async (member) => {
    try {
      // Fetch detailed member information for editing
      const response = await ApiService.getMember(member.id);
      console.log('Edit member response:', response);
      console.log('Member data for editing:', response.member);
      console.log('Member phones:', response.member.phones);
      console.log('Member addresses:', response.member.addresses);
      console.log('Member physical_metrics:', response.member.physical_metrics);
      setMemberToEdit(response.member);
      setShowEditModal(true);
    } catch (err) {
      console.error('Error fetching member details for editing:', err);
      setError(err.message || 'Failed to fetch member details');
    }
  };

  // Handle update member
  const handleUpdateMember = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);
      
      await ApiService.updateMember(memberToEdit.id, updatedData);
      
      setShowEditModal(false);
      setMemberToEdit(null);
      
      // Refresh members list
      await fetchMembers(currentPage, filters.search, filters.status || 'all');
      
    } catch (err) {
      console.error('Error updating member:', err);
      setError(err.message || 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete member
  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      try {
        setLoading(true);
        setError(null);
        
        await ApiService.deleteMember(id);
        console.log('Member deleted successfully');
        
        // Refresh members list
        await fetchMembers(currentPage, searchTerm, filterStatus);
        
      } catch (err) {
        console.error('Error deleting member:', err);
        setError(err.message || 'Failed to delete member');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle search with debouncing
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchMembers(page, searchTerm, filterStatus);
    }
  };

  // Format member data for display
  const formatMemberData = (member) => {
    return {
      ...member,
      fullName: member.full_name || `${member.first_name} ${member.last_name}`,
      joinDate: member.joined_on ? new Date(member.joined_on).toLocaleDateString() : 'N/A',
      status: member.is_active ? 'active' : 'inactive',
      phones: member.phones || [],
      addresses: member.addresses || [],
      address: member.addresses && member.addresses.length > 0 
        ? `${member.addresses[0].street_name || ''}, ${member.addresses[0].city_name || ''}, ${member.addresses[0].postal_code || ''}`.replace(/^,\s*|,\s*$/g, '')
        : 'N/A'
    };
  };

  // No need for client-side filtering since API handles it
  const displayMembers = members.map(formatMemberData);

  // Filter handling functions
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
    
    // Update the old state variables for backward compatibility
    if (key === 'search') setSearchTerm(value);
    if (key === 'status') setFilterStatus(value || 'all');
    
    // Trigger data fetch with new filters
    fetchMembers(1, newFilters.search, newFilters.status || 'all');
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
    fetchMembers(1, '', 'all');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMembers(currentPage, filters.search, filters.status || 'all');
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Members Management</h1>
          <p className="text-gray-400 mt-1">
            {loading ? 'Loading...' : `Total Members: ${totalMembers}`}
          </p>
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
              <p className="text-gray-400 text-sm">Inactive Members</p>
              <p className="text-2xl font-bold text-white">
                {members.filter(m => !m.is_active).length}
              </p>
            </div>
            <div className="bg-red-400/20 p-2 rounded">
              <UserPlus className="h-5 w-5 text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Attendance</p>
              <p className="text-2xl font-bold text-white">{avgAttendance}%</p>
              {console.log('Avg Attendance:', avgAttendance)}
            </div>
            <div className="bg-purple-400/20 p-2 rounded">
              <Award className="h-5 w-5 text-purple-400" />
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
              <th className="p-4">Trainer</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
            <td colSpan="7" className="p-8 text-center text-gray-400">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                <span>Loading members...</span>
              </div>
            </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
            <td colSpan="7" className="p-8 text-center text-gray-400">
              {filters.search || filters.status || filters.membership_type ? 
                'No members found matching your filters.' : 
                'No members found.'
              }
            </td>
              </tr>
            ) : (
              members.map((member) => (
            <tr key={member.id} className="border-t border-gray-800 hover:bg-gray-800/50">
              <td className="p-4">
                <div className="flex items-center space-x-3">
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
                Joined: {member.joined_on ? new Date(member.joined_on).toLocaleDateString() : 'N/A'}
              </p>
                </div>
              </td>
              <td className="p-4">
                <p className="text-gray-300">
              {member.trainer_name || 'Unassigned'}
                </p>
              </td>
              <td className="p-4">
                <p className="text-gray-300 text-sm">
              {member.joined_on ? new Date(member.joined_on).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-gray-500 text-xs">
              {member.days_since_joined ? `${member.days_since_joined} days ago` : ''}
                </p>
              </td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              member.is_active ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                }`}>
              {member.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleViewMember(member)}
                className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                title="View Member"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleEditMember(member)}
                className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                title="Edit Member"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDeleteMember(member.id)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Delete Member"
              >
                <Trash2 className="h-4 w-4" />
              </button>
                </div>
              </td>
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

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddMember}
        membershipPlans={membershipPlans}
        trainers={trainers}
      />

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setMemberToEdit(null);
        }}
        onSubmit={handleUpdateMember}
        member={memberToEdit}
        membershipPlans={membershipPlans}
      />

      {/* View Member Modal */}
      {showViewModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Quick Overview</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close">
                <X className="h-6 w-6 hover:cursor-pointer" />
              </button>
            </div>

            {/* Only info NOT shown in the table (no name/ID, email, phone, plan, trainer, last check-in, status) */}
            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/40 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Profile</h4>
                  <div className="space-y-3 text-gray-200">
                    <div className="flex items-center">
                      <User2 className="h-4 w-4 mr-3 text-gray-500" />
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
                      <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="flex-1 flex justify-between">
                        <span className="text-gray-400">Member Since</span>
                        <span className="font-medium">
                          {selectedMember.joined_on ? new Date(selectedMember.joined_on).toLocaleDateString() : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address & Emergency */}
                <div className="bg-gray-800/40 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Emergency & Address</h4>
                  <div className="space-y-4 text-gray-200">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="w-full grid grid-cols-[max-content,1fr] items-start gap-3">
                        <span className="text-gray-400">Emergency Phone</span>
                        <span className="font-medium break-words">
                          {selectedMember.emergency_contact || '—'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="w-full grid grid-cols-[max-content,1fr] items-start gap-3">
                        <span className="text-gray-400">Address</span>
                        <span className="font-medium break-words">
                          {selectedMember.addresses && selectedMember.addresses.length > 0 
                            ? `${selectedMember.addresses[0].street_name || ''}, ${selectedMember.addresses[0].city_name || ''}, ${selectedMember.addresses[0].postal_code || ''}`.replace(/^,\s*|,\s*$/g, '') || '—'
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact health snapshot */}
              <div className="bg-gray-800/40 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Health Snapshot</h4>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;