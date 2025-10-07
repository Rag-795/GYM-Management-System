import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, Search, Filter, Edit, Trash2, 
  TrendingUp, Users, DollarSign, Calendar, Clock,
  CheckCircle, XCircle, AlertCircle, X, Save, Eye,
  MoreVertical, Download, BarChart3, Award, Loader2
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import apiService from '../../services/api';

const Memberships = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  
  // Data state
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [activeMemberships, setActiveMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state for membership plan
  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: '',
    duration: '',
    maxFreeze: ''
  });

  // Load data from API
  useEffect(() => {
    loadMembershipPlans();
    loadMemberships();
  }, []);

  const loadMembershipPlans = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMembershipPlans();
      setMembershipPlans(response.plans || []);
    } catch (error) {
      setError('Failed to load membership plans: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMemberships = async () => {
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPlan !== 'all') params.plan_id = filterPlan;
      
      const response = await apiService.getMemberships(params);
      setActiveMemberships(response.memberships || []);
    } catch (error) {
      setError('Failed to load memberships: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlanFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiService.createMembershipPlan({
        name: planFormData.name,
        description: planFormData.description,
        price: parseFloat(planFormData.price),
        duration_days: parseInt(planFormData.duration_days)
      });
      setSuccess('Membership plan created successfully');
      setShowAddPlanModal(false);
      resetForm();
      loadMembershipPlans();
    } catch (error) {
      setError('Failed to create plan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setPlanFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      duration_days: plan.duration_days.toString(),
      duration: '',
      maxFreeze: ''
    });
    setShowEditPlanModal(true);
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiService.updateMembershipPlan(selectedPlan.id, {
        name: planFormData.name,
        description: planFormData.description,
        price: parseFloat(planFormData.price),
        duration_days: parseInt(planFormData.duration_days)
      });
      setSuccess('Membership plan updated successfully');
      setShowEditPlanModal(false);
      resetForm();
      loadMembershipPlans();
    } catch (error) {
      setError('Failed to update plan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      setLoading(true);
      await apiService.deleteMembershipPlan(planId);
      setSuccess('Membership plan deleted successfully');
      loadMembershipPlans();
    } catch (error) {
      setError('Failed to delete plan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMembership = (membership) => {
    setSelectedMembership(membership);
  };

  const resetForm = () => {
    setPlanFormData({
      name: '',
      description: '',
      price: '',
      duration_days: '',
      duration: '',
      maxFreeze: ''
    });
    setSelectedPlan(null);
  };

  const getDurationLabel = (days) => {
    if (days === 30) return 'Monthly';
    if (days === 365) return 'Annual';
    if (days === 7) return 'Weekly';
    return `${days} days`;
  };

  const filteredMemberships = activeMemberships.filter(membership => {
    const matchesSearch = membership.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         membership.member_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         membership.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || membership.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || membership.plan_id === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalStats = {
    totalRevenue: membershipPlans.reduce((sum, plan) => sum + (plan.total_revenue || 0), 0),
    totalMembers: membershipPlans.reduce((sum, plan) => sum + (plan.active_memberships || 0), 0),
    avgRevenue: membershipPlans.length > 0 ? membershipPlans.reduce((sum, plan) => sum + (plan.total_revenue || 0), 0) / membershipPlans.length : 0,
    activePlans: membershipPlans.length
  };

  // Filter effect
  useEffect(() => {
    loadMemberships();
  }, [filterStatus, filterPlan]);

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {/* {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )} */}
      {success && (
        <Alert 
          type="success" 
          message={success} 
          onClose={() => setSuccess(null)} 
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Membership Management</h1>
          <p className="text-gray-400 mt-1">Manage membership plans and active subscriptions</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button 
            variant="primary" 
            icon={Plus} 
            onClick={() => setShowAddPlanModal(true)}
            disabled={loading}
          >
            Add Plan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${totalStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-400/20 p-2 rounded">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </div> */}
        {/* <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Members</p>
              <p className="text-2xl font-bold text-white">{totalStats.totalMembers}</p>
            </div>
            <div className="bg-blue-400/20 p-2 rounded">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div> */}
        {/* <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Plans</p>
              <p className="text-2xl font-bold text-white">{totalStats.activePlans}</p>
            </div>
            <div className="bg-yellow-400/20 p-2 rounded">
              <CreditCard className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Revenue/Plan</p>
              <p className="text-2xl font-bold text-white">${Math.round(totalStats.avgRevenue).toLocaleString()}</p>
            </div>
            <div className="bg-purple-400/20 p-2 rounded">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </div> */}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plans'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Membership Plans
          </button>
          {/* <button
            onClick={() => setActiveTab('memberships')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'memberships'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Active Memberships
          </button> */}
        </nav>
      </div>

      {/* Membership Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            </div>
          )}

          {/* Plans Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {membershipPlans.map((plan) => (
                <div key={plan.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-black" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description || 'No description'}</p>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                      <span className="text-gray-400 ml-1">/{getDurationLabel(plan.duration_days)}</span>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Active Members</p>
                      <p className="text-white font-bold">{plan.active_memberships || 0}</p>
                    </div>
                    {/* <div className="text-center">
                      <p className="text-gray-400 text-xs">Revenue</p>
                      <p className="text-white font-bold">₹{(plan.total_revenue || 0).toLocaleString()}</p>
                    </div> */}
                  </div>
                </div>
              ))}
              
              {membershipPlans.length === 0 && !loading && (
                <div className="col-span-full text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No membership plans found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {/* Add Plan Modal */}
      {showAddPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Add New Plan</h2>
                <button
                  onClick={() => setShowAddPlanModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleAddPlan} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Plan Name <span className="text-yellow-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={planFormData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                      placeholder="e.g. Premium"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Price <span className="text-yellow-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={planFormData.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                      placeholder="59"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Duration (days) <span className="text-yellow-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="duration_days"
                      value={planFormData.duration_days}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                      placeholder="30"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Max Freeze Days
                    </label>
                    <input
                      type="number"
                      name="maxFreeze"
                      value={planFormData.maxFreeze}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                      placeholder="14"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={planFormData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    placeholder="Plan description..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddPlanModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Add Plan
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Membership Plan</h2>
              <button
                onClick={() => setShowEditPlanModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={planFormData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={planFormData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={planFormData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (days) *
                  </label>
                  <input
                    type="number"
                    name="duration_days"
                    value={planFormData.duration_days}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEditPlanModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Plan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Memberships;