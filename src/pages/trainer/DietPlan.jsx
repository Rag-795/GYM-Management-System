import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit, Save, X, Users, Search,
  ChefHat, AlertCircle, CheckCircle, 
  ChevronDown, ChevronUp, Copy, Info
} from 'lucide-react';
import ApiService from '../../services/api';

const DietPlanCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);

  // Form state for real database fields only
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    kcal_count: '',
    assigned_members: []
  });

  // Real data from API
  const [availableMembers, setAvailableMembers] = useState([]);
  const [existingPlans, setExistingPlans] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Diet types hardcoded in select options below

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        
        // Load members and diet plans in parallel
        const [membersResponse, plansResponse] = await Promise.all([
          ApiService.getAvailableMembers(),
          ApiService.getDietPlans()
        ]);

        if (membersResponse.success) {
          setAvailableMembers(membersResponse.members || []);
        }

        if (plansResponse.success) {
          // Use only real database data
          setExistingPlans(plansResponse.diet_plans || []);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMemberDropdown && !event.target.closest('.member-dropdown-container')) {
        setShowMemberDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMemberDropdown]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      kcal_count: '',
      assigned_members: []
    });
    setEditingPlan(null);
    setIsCreating(false);
    setSearchTerm('');
    setShowMemberDropdown(false);
  };

  // Remove meal-related functions since not supported in schema

  // Toggle member selection
  const toggleMemberSelection = (member) => {
    setFormData(prev => {
      const isSelected = prev.assigned_members.some(m => m.id === member.id);
      if (isSelected) {
        return {
          ...prev,
          assigned_members: prev.assigned_members.filter(m => m.id !== member.id)
        };
      } else {
        return {
          ...prev,
          assigned_members: [...prev.assigned_members, { 
            id: member.id, 
            name: `${member.first_name} ${member.last_name}` 
          }]
        };
      }
    });
  };

  // Remove calculate totals since meals not in schema

  // Save diet plan
  const saveDietPlan = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Validate form
      if (!formData.name) {
        setError('Plan name is required');
        setLoading(false);
        return;
      }
      
      // Prepare data for API (using only fields available in schema)
      const apiData = {
        name: formData.name,
        type: formData.type || 'General',
        description: formData.description,
        kcal_count: parseInt(formData.kcal_count) || 0,
        assigned_members: formData.assigned_members
      };
      
      let response;
      if (editingPlan) {
        // Update existing plan
        response = await ApiService.updateDietPlan(editingPlan.id, apiData);
        if (response.success) {
          // Reload plans to get updated data
          const plansResponse = await ApiService.getDietPlans();
          if (plansResponse.success) {
            setExistingPlans(plansResponse.diet_plans || []);
          }
          setSuccessMessage('Diet plan updated successfully!');
        }
      } else {
        // Create new plan
        response = await ApiService.createDietPlan(apiData);
        if (response.success) {
          setExistingPlans(prev => [response.diet_plan, ...prev]);
          setSuccessMessage('Diet plan created successfully!');
        }
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to save diet plan');
      }
      
      resetForm();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to save diet plan. Please try again.');
      console.error('Error saving diet plan:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete diet plan
  const deleteDietPlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this diet plan?')) return;
    
    setLoading(true);
    try {
      const response = await ApiService.deleteDietPlan(planId);
      if (response.success) {
        setExistingPlans(prev => prev.filter(plan => plan.id !== planId));
        setSuccessMessage('Diet plan deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(response.error || 'Failed to delete diet plan');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete diet plan');
      console.error('Error deleting diet plan:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit diet plan
  const editDietPlan = (plan) => {
    setFormData({
      name: plan.name,
      type: plan.type || '',
      description: plan.description,
      kcal_count: plan.kcal_count || '',
      assigned_members: plan.assigned_members ? plan.assigned_members.map(member => ({ ...member })) : []
    });
    setEditingPlan(plan);
    setIsCreating(true);
  };

  // Duplicate diet plan
  const duplicateDietPlan = (plan) => {
    setFormData({
      name: `${plan.name} (Copy)`,
      type: plan.type || '',
      description: plan.description,
      kcal_count: plan.kcal_count || '',
      assigned_members: []
    });
    setIsCreating(true);
  };

  // Filter members for search
  const filteredMembers = availableMembers.filter(member => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const email = member.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  // Remove meal-related functions since not in schema

  // Show loading state while initial data loads
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading diet plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Diet Plan Creator</h1>
        <p className="text-gray-400">Create and manage customized diet plans for your members</p>
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

      {/* Create/Edit Form */}
      {isCreating ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-yellow-400" />
              {editingPlan ? 'Edit Diet Plan' : 'Create New Diet Plan'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Plan Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Weight Loss Accelerator"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Diet Type
              </label>
              <select
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="">Select type...</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Athletic Performance">Athletic Performance</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Keto">Keto</option>
                <option value="Low Carb">Low Carb</option>
                <option value="High Protein">High Protein</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Start Date (Display Only)
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
              <p className="text-xs text-gray-500 mt-1">Note: Dates are for display only and not stored in database</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                End Date (Display Only)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
              <p className="text-xs text-gray-500 mt-1">Note: Dates are for display only and not stored in database</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the diet plan goals and guidelines..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 resize-none h-24 focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Database Field Notice */}
          <div className="mb-6">
            <div className="p-4 bg-blue-900/20 border border-blue-400/20 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-400" />
                Diet Plan Information
              </h3>
              <p className="text-gray-300 text-sm">
                Note: The current database schema supports basic diet plan information. 
                Detailed meal planning features are not available. You can create diet plans 
                with name, type, description, and total calorie count only.
              </p>
            </div>
          </div>

          {/* Assign Members Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-yellow-400" />
                Assign to Members
              </h3>
              <span className="text-sm text-gray-400">
                {formData.assigned_members.length} selected
              </span>
            </div>

            <div className="relative member-dropdown-container">
              <button
                type="button"
                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-left text-white flex items-center justify-between hover:bg-gray-700 transition-colors"
              >
                <span className="text-gray-400">
                  {formData.assigned_members.length > 0
                    ? `${formData.assigned_members.length} members selected`
                    : 'Select members...'}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showMemberDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showMemberDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                  <div className="p-3 border-b border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredMembers.map((member) => {
                      const isSelected = formData.assigned_members.some(m => m.id === member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => toggleMemberSelection(member)}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-700 flex items-center gap-3 ${
                            isSelected ? 'bg-gray-700' : ''
                          }`}
                        >
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                            isSelected
                              ? 'bg-yellow-400 border-yellow-400'
                              : 'border-gray-600'
                          }`}>
                            {isSelected && (
                              <CheckCircle className="h-3 w-3 text-black" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white">
                              {member.first_name} {member.last_name}
                            </p>
                            <p className="text-xs text-gray-400">{member.email}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Members Display */}
            {formData.assigned_members.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.assigned_members.map((member) => (
                  <span
                    key={member.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-900/20 border border-yellow-400/20 rounded-full text-sm text-yellow-400"
                  >
                    {member.name}
                    <button
                      type="button"
                      onClick={() => toggleMemberSelection({ 
                        id: member.id, 
                        first_name: member.name.split(' ')[0], 
                        last_name: member.name.split(' ')[1] 
                      })}
                      className="hover:text-yellow-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <button
              onClick={saveDietPlan}
              disabled={loading || !formData.name || !formData.start_date || !formData.end_date}
              className="flex-1 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {editingPlan ? 'Update Plan' : 'Save Plan'}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="mb-8 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create New Diet Plan
        </button>
      )}

      {/* Existing Diet Plans */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-yellow-400" />
          Existing Diet Plans
        </h2>

        <div className="space-y-4">
          {existingPlans.map((plan) => (
            <div key={plan.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              {/* Plan Header */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <ChefHat className="h-6 w-6 text-yellow-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                      <p className="text-sm text-gray-400">{plan.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {expandedPlan === plan.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => editDietPlan(plan)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit className="h-5 w-5 text-gray-400 hover:text-yellow-400" />
                    </button>
                    <button
                      onClick={() => duplicateDietPlan(plan)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Copy className="h-5 w-5 text-gray-400 hover:text-blue-400" />
                    </button>
                    <button
                      onClick={() => deleteDietPlan(plan.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Plan Info */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <p className="text-white font-medium">
                      {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Calories:</span>
                    <p className="text-yellow-400 font-semibold">{plan.kcal_count || 0} kcal</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <p className="text-white font-medium">{plan.type || 'General'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Members:</span>
                    <p className="text-white font-medium">{plan.assigned_members?.length || 0} assigned</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-400/20">
                      <CheckCircle className="h-3 w-3" />
                      {plan.status}
                    </span>
                  </div>
                </div>

                {/* Assigned Members Tags */}
                {plan.assigned_members.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {plan.assigned_members.map((member) => (
                      <span
                        key={member.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                      >
                        <Users className="h-3 w-3" />
                        {member.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded Plan Details */}
              {expandedPlan === plan.id && (
                <div className="border-t border-gray-700 p-4 bg-gray-900/50">
                  <h4 className="text-sm font-semibold text-white mb-3">Diet Plan Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-xs">Full Description:</span>
                      <p className="text-white mt-1">{plan.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Total Calories:</span>
                      <p className="text-yellow-400 font-medium">{plan.kcal_count} kcal</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Created:</span>
                      <p className="text-white">{new Date(plan.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {existingPlans.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No diet plans created yet</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 px-4 py-2 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-300"
            >
              Create Your First Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietPlanCreator;