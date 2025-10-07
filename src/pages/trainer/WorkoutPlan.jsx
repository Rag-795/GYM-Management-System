import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit, Save, X, Calendar, Users, Search,
  Dumbbell, AlertCircle, CheckCircle, Clock, Info, AlertTriangle,
  ChevronDown, ChevronUp, MoreVertical, Copy, Eye,
  Activity, Target, Timer, Zap, TrendingUp, Hash
} from 'lucide-react';
import ApiService from '../../services/api';
import ErrorBoundary from '../../components/ErrorBoundary';

const WorkoutPlanCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);

  // Form state with proper initialization
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    exercises: [
      {
        id: Date.now(),
        exercise_name: '',
        exercise_type: 'strength',
        sets: '',
        reps: '',
        duration: '',
        rest_time: '',
        notes: ''
      }
    ],
    assigned_members: []
  });

  // Real data from API
  const [availableMembers, setAvailableMembers] = useState([]);

  // Workout plans state
  const [existingPlans, setExistingPlans] = useState([]);

  // Exercise type options
  const exerciseTypes = [
    { value: 'strength', label: 'Strength Training' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'plyometric', label: 'Plyometric' },
    { value: 'core', label: 'Core' },
    { value: 'power', label: 'Power' },
    { value: 'mobility', label: 'Mobility' },
    { value: 'balance', label: 'Balance' }
  ];

  // Fetch workout plans and members on component mount
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    console.log('Auth check - Token:', token ? 'Present' : 'Missing');
    console.log('Auth check - Role:', userRole);
    
    if (!token) {
      setError('Not authenticated. Please log in.');
      return;
    }
    
    fetchWorkoutPlans();
    fetchMembers();
  }, []);

  const fetchWorkoutPlans = async () => {
    try {
      setLoading(true);
      console.log('Fetching workout plans...');
      const response = await ApiService.getWorkoutPlans();
      console.log('Workout plans response:', response);
      
      // Handle both direct array and response with workout_plans property
      const plans = response?.workout_plans || response || [];
      setExistingPlans(Array.isArray(plans) ? plans : []);
      console.log('Set workout plans:', plans);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      setError(`Failed to load workout plans: ${error.message}`);
      setExistingPlans([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      console.log('Fetching members...');
      const response = await ApiService.getMembers();
      console.log('Members response:', response);
      
      // Handle both direct array and response with members property
      const members = response?.members || response || [];
      setAvailableMembers(Array.isArray(members) ? members : []);
      console.log('Set available members:', members);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError(`Failed to load members: ${error.message}`);
      setAvailableMembers([]); // Ensure it's always an array
    }
  };

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
      description: '',
      exercises: [
        {
          id: Date.now(),
          exercise_name: '',
          exercise_type: 'strength',
          sets: '',
          reps: '',
          duration: '',
          rest_time: '',
          notes: ''
        }
      ],
      assigned_members: []
    });
    setEditingPlan(null);
    setIsCreating(false);
    setSearchTerm('');
    setShowMemberDropdown(false);
  };

  // Add exercise to form
  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: Date.now() + Math.random(),
          exercise_name: '',
          exercise_type: 'strength',
          sets: '',
          reps: '',
          duration: '',
          rest_time: '',
          notes: ''
        }
      ]
    }));
  };

  // Remove exercise from form
  const removeExercise = (exerciseId) => {
    if (!formData.exercises || formData.exercises.length <= 1) return;
    
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(exercise => exercise.id !== exerciseId)
    }));
  };

  // Update exercise in form
  const updateExercise = (exerciseId, field, value) => {
    if (!formData.exercises) return;
    
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise =>
        exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  // Toggle member selection
  const toggleMemberSelection = (member) => {
    if (!member || !member.id || !member.first_name || !member.last_name) {
      console.error('Invalid member data:', member);
      return;
    }
    
    setFormData(prev => {
      const isSelected = prev.assigned_members?.some(m => m.id === member.id) || false;
      if (isSelected) {
        return {
          ...prev,
          assigned_members: prev.assigned_members.filter(m => m.id !== member.id)
        };
      } else {
        return {
          ...prev,
          assigned_members: [...(prev.assigned_members || []), { 
            id: member.id, 
            first_name: member.first_name,
            last_name: member.last_name
          }]
        };
      }
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!formData.exercises || !Array.isArray(formData.exercises)) {
      return { sets: 0, reps: 0, exercises: 0 };
    }
    
    const totals = formData.exercises.reduce((acc, exercise) => {
      return {
        sets: acc.sets + (parseInt(exercise.sets) || 0),
        reps: acc.reps + (parseInt(exercise.reps) || 0),
        exercises: acc.exercises + (exercise.exercise_name ? 1 : 0)
      };
    }, { sets: 0, reps: 0, exercises: 0 });
    return totals;
  };

  // Save workout plan
  const saveWorkoutPlan = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Validate form
      if (!formData.name || !formData.description) {
        setError('Please fill in name and description');
        setLoading(false);
        return;
      }

      // Prepare workout plan data based on schema constraints
      const workoutPlanData = {
        name: formData.name,
        type: formData.exercises.length > 0 ? formData.exercises[0].exercise_type : 'strength',
        description: formData.description,
        member_ids: formData.assigned_members.map(member => member.id)
      };
      
      if (editingPlan) {
        // Update existing plan
        const updatedPlan = await ApiService.updateWorkoutPlan(editingPlan.id, workoutPlanData);
        setExistingPlans(prev => 
          prev.map(plan => plan.id === editingPlan.id ? updatedPlan : plan)
        );
        setSuccessMessage('Workout plan updated successfully!');
      } else {
        // Create new plan
        const newPlan = await ApiService.createWorkoutPlan(workoutPlanData);
        setExistingPlans(prev => [newPlan, ...prev]);
        setSuccessMessage('Workout plan created successfully!');
      }
      
      resetForm();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to save workout plan. Please try again.');
      console.error('Error saving workout plan:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete workout plan
  const deleteWorkoutPlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this workout plan?')) return;
    
    setLoading(true);
    try {
      await ApiService.deleteWorkoutPlan(planId);
      setExistingPlans(prev => prev.filter(plan => plan.id !== planId));
      setSuccessMessage('Workout plan deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to delete workout plan');
      console.error('Error deleting workout plan:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit workout plan
  const editWorkoutPlan = (plan) => {
    setFormData({
      name: plan.name,
      description: plan.description,
      exercises: [
        {
          id: Date.now(),
          exercise_name: '',
          exercise_type: plan.type || 'strength',
          sets: '',
          reps: '',
          duration: '',
          rest_time: '',
          notes: ''
        }
      ],
      assigned_members: plan.assigned_members || []
    });
    setEditingPlan(plan);
    setIsCreating(true);
  };

  // Duplicate workout plan
  const duplicateWorkoutPlan = (plan) => {
    setFormData({
      name: `${plan.name} (Copy)`,
      description: plan.description,
      exercises: [
        {
          id: Date.now(),
          exercise_name: '',
          exercise_type: plan.type || 'strength',
          sets: '',
          reps: '',
          duration: '',
          rest_time: '',
          notes: ''
        }
      ],
      assigned_members: []
    });
    setIsCreating(true);
  };

  // Filter members for search
  const filteredMembers = availableMembers.filter(member => {
    if (!member || !member.first_name || !member.last_name || !member.email) {
      return false;
    }
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const email = member.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const getExerciseTypeLabel = (exerciseType) => {
    const type = exerciseTypes.find(t => t.value === exerciseType);
    return type ? type.label : exerciseType;
  };

  const getExerciseTypeIcon = (type) => {
    const icons = {
      strength: Dumbbell,
      cardio: Activity,
      flexibility: TrendingUp,
      plyometric: Zap,
      core: Target,
      power: Zap,
      mobility: Activity,
      balance: Target
    };
    return icons[type] || Dumbbell;
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Workout Plan Creator</h1>
        <p className="text-gray-400">Create and manage customized workout plans for your members</p>
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
              <Dumbbell className="h-5 w-5 text-yellow-400" />
              {editingPlan ? 'Edit Workout Plan' : 'Create New Workout Plan'}
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
                placeholder="e.g., Beginner Strength Training"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                required
              />
            </div>

          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the workout plan goals and guidelines..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 resize-none h-24 focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Exercises Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Exercises</h3>
              <button
                onClick={addExercise}
                className="px-3 py-1.5 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-300 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Exercise
              </button>
            </div>

            {/* Schema Limitations Notice */}
            <div className="mb-4 p-3 bg-orange-900/30 border border-orange-500/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Schema Limitations</span>
              </div>
              <p className="text-xs text-orange-200">
                Note: Exercise details are for UI reference only. The database only stores workout plan name, type, and description. 
                See WORKOUT_PLAN_LIMITATIONS.md for details on supported features.
              </p>
            </div>

            <div className="space-y-4">
              {(formData.exercises || []).map((exercise, index) => {
                const ExerciseIcon = getExerciseTypeIcon(exercise?.exercise_type || 'strength');
                return (
                  <div key={exercise.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ExerciseIcon className="h-5 w-5 text-yellow-400" />
                        <span className="text-white font-medium">Exercise {index + 1}</span>
                      </div>
                      {(formData.exercises?.length || 0) > 1 && (
                        <button
                          onClick={() => removeExercise(exercise?.id)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Exercise Name</label>
                        <input
                          type="text"
                          value={exercise.exercise_name}
                          onChange={(e) => updateExercise(exercise.id, 'exercise_name', e.target.value)}
                          placeholder="e.g., Squats, Push-ups"
                          className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Exercise Type</label>
                        <select
                          value={exercise.exercise_type}
                          onChange={(e) => updateExercise(exercise.id, 'exercise_type', e.target.value)}
                          className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-yellow-400"
                        >
                          {exerciseTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Sets</label>
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(exercise.id, 'sets', e.target.value)}
                          placeholder="e.g., 3"
                          className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                          min={0}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Reps</label>
                        <input
                          type="text"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                          placeholder="e.g., 12"
                          className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Duration</label>
                        <input
                          type="text"
                          value={exercise.duration}
                          onChange={(e) => updateExercise(exercise.id, 'duration', e.target.value)}
                          placeholder="e.g., 30s"
                          className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Rest Time</label>
                        <input
                          type="text"
                          value={exercise.rest_time}
                          onChange={(e) => updateExercise(exercise.id, 'rest_time', e.target.value)}
                          placeholder="e.g., 60s"
                          className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                        />
                      </div>

                      <div className="lg:col-span-4">
                        <label className="block text-xs text-gray-400 mb-1">Notes</label>
                        <input
                          type="text"
                          value={exercise.notes}
                          onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
                          placeholder="Special instructions or form cues..."
                          className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals Summary */}
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-400/20 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Exercises</p>
                  <p className="text-lg font-bold text-yellow-400">{totals.exercises}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Sets</p>
                  <p className="text-lg font-bold text-white">{totals.sets}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Reps</p>
                  <p className="text-lg font-bold text-white">{totals.reps}</p>
                </div>
              </div>
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
                    {member.first_name} {member.last_name}
                    <button
                      type="button"
                      onClick={() => toggleMemberSelection({ 
                        id: member.id, 
                        first_name: member.first_name, 
                        last_name: member.last_name 
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
              onClick={saveWorkoutPlan}
              disabled={loading || !formData.name || !formData.description}
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
          Create New Workout Plan
        </button>
      )}

      {/* Existing Workout Plans */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Activity className="h-5 w-5 text-yellow-400" />
          Existing Workout Plans
        </h2>

        <div className="space-y-4">
          {(existingPlans || []).map((plan) => (
            <div key={plan.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              {/* Plan Header */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="h-6 w-6 text-yellow-400" />
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
                      onClick={() => editWorkoutPlan(plan)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit className="h-5 w-5 text-gray-400 hover:text-yellow-400" />
                    </button>
                    <button
                      onClick={() => duplicateWorkoutPlan(plan)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Copy className="h-5 w-5 text-gray-400 hover:text-blue-400" />
                    </button>
                    <button
                      onClick={() => deleteWorkoutPlan(plan.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Plan Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <p className="text-white font-medium">{getExerciseTypeLabel(plan.type)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <p className="text-white font-medium">
                      {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Members:</span>
                    <p className="text-white font-medium">{plan.assigned_members?.length || 0} assigned</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-400/20">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </span>
                  </div>
                </div>

                {/* Assigned Members Tags */}
                {plan.assigned_members && plan.assigned_members.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {plan.assigned_members.map((member) => (
                      <span
                        key={member.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                      >
                        <Users className="h-3 w-3" />
                        {member.first_name} {member.last_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded Plan Details */}
              {expandedPlan === plan.id && (
                <div className="border-t border-gray-700 p-4 bg-gray-900/50">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Plan Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Plan ID:</span>
                          <p className="text-gray-300 font-mono">{plan.id}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Created by:</span>
                          <p className="text-gray-300">{plan.created_by || 'Current Trainer'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Schema Limitation Notice */}
                    <div className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Info className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-orange-400">Database Schema Note</span>
                      </div>
                      <p className="text-xs text-orange-200">
                        Detailed exercise information is not stored in the current database schema. 
                        Only plan name, type, description, and member assignments are persisted.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {(existingPlans || []).length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No workout plans created yet</p>
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

const WorkoutPlanWithErrorBoundary = () => (
  <ErrorBoundary showDetails={true}>
    <WorkoutPlanCreator />
  </ErrorBoundary>
);

export default WorkoutPlanWithErrorBoundary;