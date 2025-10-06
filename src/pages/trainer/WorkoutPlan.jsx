import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit, Save, X, Calendar, Users, Search,
  Dumbbell, AlertCircle, CheckCircle, Clock, Info,
  ChevronDown, ChevronUp, MoreVertical, Copy, Eye,
  Activity, Target, Timer, Zap, TrendingUp, Hash
} from 'lucide-react';

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
    start_date: '',
    end_date: '',
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

  // Mock data - Replace with API calls
  const [availableMembers] = useState([
    { id: 1, first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.j@email.com', status: 'active' },
    { id: 2, first_name: 'Mike', last_name: 'Chen', email: 'mike.c@email.com', status: 'active' },
    { id: 3, first_name: 'Emma', last_name: 'Wilson', email: 'emma.w@email.com', status: 'active' },
    { id: 4, first_name: 'Alex', last_name: 'Brown', email: 'alex.b@email.com', status: 'inactive' },
    { id: 5, first_name: 'Lisa', last_name: 'Davis', email: 'lisa.d@email.com', status: 'active' },
    { id: 6, first_name: 'Tom', last_name: 'Miller', email: 'tom.m@email.com', status: 'active' },
    { id: 7, first_name: 'Jane', last_name: 'Smith', email: 'jane.s@email.com', status: 'active' }
  ]);

  const [existingPlans, setExistingPlans] = useState([
    {
      id: 1,
      name: 'Beginner Strength Training',
      description: 'Full body workout plan for beginners focusing on fundamental movements',
      start_date: '2024-06-01',
      end_date: '2024-08-31',
      total_exercises: 6,
      total_sets: 18,
      total_duration: '45 min',
      exercises: [
        { id: 1, exercise_name: 'Squats', exercise_type: 'strength', sets: 3, reps: 12, duration: '', rest_time: '60s', notes: 'Focus on form' },
        { id: 2, exercise_name: 'Push-ups', exercise_type: 'strength', sets: 3, reps: 10, duration: '', rest_time: '45s', notes: 'Modify on knees if needed' },
        { id: 3, exercise_name: 'Lunges', exercise_type: 'strength', sets: 3, reps: 10, duration: '', rest_time: '60s', notes: 'Alternate legs' },
        { id: 4, exercise_name: 'Plank', exercise_type: 'core', sets: 3, reps: '', duration: '30s', rest_time: '30s', notes: 'Keep core tight' },
        { id: 5, exercise_name: 'Dumbbell Rows', exercise_type: 'strength', sets: 3, reps: 12, duration: '', rest_time: '60s', notes: 'Light weight to start' },
        { id: 6, exercise_name: 'Shoulder Press', exercise_type: 'strength', sets: 3, reps: 10, duration: '', rest_time: '60s', notes: 'Control the movement' }
      ],
      assigned_members: [
        { id: 1, name: 'Sarah Johnson' },
        { id: 3, name: 'Emma Wilson' }
      ],
      created_at: '2024-06-01',
      status: 'active'
    },
    {
      id: 2,
      name: 'Advanced HIIT Program',
      description: 'High-intensity interval training for experienced athletes',
      start_date: '2024-06-15',
      end_date: '2024-09-15',
      total_exercises: 8,
      total_sets: 24,
      total_duration: '60 min',
      exercises: [
        { id: 1, exercise_name: 'Burpees', exercise_type: 'cardio', sets: 4, reps: 15, duration: '', rest_time: '30s', notes: 'Full intensity' },
        { id: 2, exercise_name: 'Box Jumps', exercise_type: 'plyometric', sets: 3, reps: 10, duration: '', rest_time: '45s', notes: '24-inch box' },
        { id: 3, exercise_name: 'Battle Ropes', exercise_type: 'cardio', sets: 3, reps: '', duration: '45s', rest_time: '30s', notes: 'Alternating waves' },
        { id: 4, exercise_name: 'Medicine Ball Slams', exercise_type: 'power', sets: 3, reps: 12, duration: '', rest_time: '30s', notes: '20lb ball' },
        { id: 5, exercise_name: 'Sprint Intervals', exercise_type: 'cardio', sets: 3, reps: '', duration: '30s', rest_time: '60s', notes: 'Max effort' },
        { id: 6, exercise_name: 'Pull-ups', exercise_type: 'strength', sets: 3, reps: 8, duration: '', rest_time: '60s', notes: 'Use assistance if needed' },
        { id: 7, exercise_name: 'Kettlebell Swings', exercise_type: 'power', sets: 3, reps: 20, duration: '', rest_time: '45s', notes: 'Hip drive focus' },
        { id: 8, exercise_name: 'Mountain Climbers', exercise_type: 'cardio', sets: 3, reps: '', duration: '45s', rest_time: '30s', notes: 'Fast pace' }
      ],
      assigned_members: [
        { id: 2, name: 'Mike Chen' },
        { id: 4, name: 'Alex Brown' },
        { id: 6, name: 'Tom Miller' }
      ],
      created_at: '2024-06-15',
      status: 'active'
    },
    {
      id: 3,
      name: 'Flexibility & Mobility',
      description: 'Yoga and stretching routine for improved flexibility',
      start_date: '2024-05-01',
      end_date: '2024-07-31',
      total_exercises: 5,
      total_sets: 15,
      total_duration: '30 min',
      exercises: [
        { id: 1, exercise_name: 'Sun Salutations', exercise_type: 'flexibility', sets: 3, reps: 5, duration: '', rest_time: '30s', notes: 'Flow smoothly' },
        { id: 2, exercise_name: 'Hamstring Stretch', exercise_type: 'flexibility', sets: 3, reps: '', duration: '60s', rest_time: '15s', notes: 'Each leg' },
        { id: 3, exercise_name: 'Hip Flexor Stretch', exercise_type: 'flexibility', sets: 3, reps: '', duration: '45s', rest_time: '15s', notes: 'Each side' },
        { id: 4, exercise_name: 'Shoulder Rolls', exercise_type: 'mobility', sets: 3, reps: 15, duration: '', rest_time: '20s', notes: 'Both directions' },
        { id: 5, exercise_name: 'Cat-Cow Stretch', exercise_type: 'flexibility', sets: 3, reps: 10, duration: '', rest_time: '20s', notes: 'Slow and controlled' }
      ],
      assigned_members: [
        { id: 5, name: 'Lisa Davis' }
      ],
      created_at: '2024-05-01',
      status: 'active'
    }
  ]);

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
      start_date: '',
      end_date: '',
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
    if (formData.exercises.length > 1) {
      setFormData(prev => ({
        ...prev,
        exercises: prev.exercises.filter(exercise => exercise.id !== exerciseId)
      }));
    }
  };

  // Update exercise in form
  const updateExercise = (exerciseId, field, value) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise =>
        exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

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

  // Calculate totals
  const calculateTotals = () => {
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
      if (!formData.name || !formData.start_date || !formData.end_date) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const totals = calculateTotals();
      
      if (editingPlan) {
        // Update existing plan
        setExistingPlans(prev => prev.map(plan =>
          plan.id === editingPlan.id
            ? { 
                ...plan, 
                ...formData, 
                total_exercises: totals.exercises,
                total_sets: totals.sets
              }
            : plan
        ));
        setSuccessMessage('Workout plan updated successfully!');
      } else {
        // Create new plan
        const newPlan = {
          id: Date.now(),
          ...formData,
          total_exercises: totals.exercises,
          total_sets: totals.sets,
          total_duration: '45 min',
          created_at: new Date().toISOString().split('T')[0],
          status: 'active'
        };
        setExistingPlans(prev => [newPlan, ...prev]);
        setSuccessMessage('Workout plan created successfully!');
      }
      
      resetForm();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Failed to save workout plan. Please try again.');
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
      setExistingPlans(prev => prev.filter(plan => plan.id !== planId));
      setSuccessMessage('Workout plan deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Failed to delete workout plan');
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
      start_date: plan.start_date,
      end_date: plan.end_date,
      exercises: plan.exercises.map(exercise => ({ ...exercise })),
      assigned_members: plan.assigned_members.map(member => ({ ...member }))
    });
    setEditingPlan(plan);
    setIsCreating(true);
  };

  // Duplicate workout plan
  const duplicateWorkoutPlan = (plan) => {
    setFormData({
      name: `${plan.name} (Copy)`,
      description: plan.description,
      start_date: '',
      end_date: '',
      exercises: plan.exercises.map(exercise => ({ 
        ...exercise, 
        id: Date.now() + Math.random() 
      })),
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>
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

            <div className="space-y-4">
              {formData.exercises.map((exercise, index) => {
                const ExerciseIcon = getExerciseTypeIcon(exercise.exercise_type);
                return (
                  <div key={exercise.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ExerciseIcon className="h-5 w-5 text-yellow-400" />
                        <span className="text-white font-medium">Exercise {index + 1}</span>
                      </div>
                      {formData.exercises.length > 1 && (
                        <button
                          onClick={() => removeExercise(exercise.id)}
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
              onClick={saveWorkoutPlan}
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
          {existingPlans.map((plan) => (
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <p className="text-white font-medium">
                      {plan.start_date} to {plan.end_date}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Exercises:</span>
                    <p className="text-yellow-400 font-semibold">{plan.total_exercises} exercises</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Sets:</span>
                    <p className="text-white font-medium">{plan.total_sets} sets</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Members:</span>
                    <p className="text-white font-medium">{plan.assigned_members.length} assigned</p>
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

              {/* Expanded Exercise Details */}
              {expandedPlan === plan.id && (
                <div className="border-t border-gray-700 p-4 bg-gray-900/50">
                  <h4 className="text-sm font-semibold text-white mb-3">Exercise Breakdown</h4>
                  <div className="space-y-2">
                    {plan.exercises.map((exercise) => {
                      const ExerciseIcon = getExerciseTypeIcon(exercise.exercise_type);
                      return (
                        <div key={exercise.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                          <ExerciseIcon className="h-4 w-4 text-yellow-400" />
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
                            <div className="md:col-span-2">
                              <span className="text-gray-400 text-xs">Exercise:</span>
                              <p className="text-white font-medium">{exercise.exercise_name}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 text-xs">Type:</span>
                              <p className="text-white capitalize">{getExerciseTypeLabel(exercise.exercise_type)}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 text-xs">Sets x Reps:</span>
                              <p className="text-yellow-400 font-medium">
                                {exercise.sets} x {exercise.reps || exercise.duration}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400 text-xs">Rest:</span>
                              <p className="text-white">{exercise.rest_time}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 text-xs">Notes:</span>
                              <p className="text-gray-300 text-xs">{exercise.notes}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-400/20 rounded-lg">
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Total Exercises</p>
                        <p className="font-bold text-yellow-400">{plan.total_exercises}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Total Sets</p>
                        <p className="font-bold text-white">{plan.total_sets}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Est. Duration</p>
                        <p className="font-bold text-white">{plan.total_duration}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {existingPlans.length === 0 && (
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

export default WorkoutPlanCreator;