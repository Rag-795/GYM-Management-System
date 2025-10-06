import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit, Save, X, Calendar, Users, Search,
  ChefHat, AlertCircle, CheckCircle, Clock, Info,
  ChevronDown, ChevronUp, MoreVertical, Copy, Eye,
  Coffee, Utensils, Apple
} from 'lucide-react';

const DietPlanCreator = () => {
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
    meals: [
      {
        id: Date.now(),
        meal_type: 'breakfast',
        food_items: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: ''
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
    { id: 5, first_name: 'Lisa', last_name: 'Davis', email: 'lisa.d@email.com', status: 'active' }
  ]);

  const [existingPlans, setExistingPlans] = useState([
    {
      id: 1,
      name: 'Weight Loss Accelerator',
      description: 'High-protein, low-carb diet plan for rapid weight loss',
      start_date: '2024-06-01',
      end_date: '2024-08-31',
      total_calories: 1500,
      total_protein: 120,
      total_carbs: 100,
      total_fats: 50,
      meals: [
        { id: 1, meal_type: 'breakfast', food_items: 'Oatmeal, Eggs, Fruits', calories: 400, protein: 30, carbs: 40, fats: 12 },
        { id: 2, meal_type: 'lunch', food_items: 'Grilled Chicken, Salad, Brown Rice', calories: 500, protein: 45, carbs: 35, fats: 15 },
        { id: 3, meal_type: 'dinner', food_items: 'Salmon, Vegetables, Quinoa', calories: 450, protein: 35, carbs: 20, fats: 18 },
        { id: 4, meal_type: 'snack', food_items: 'Protein Shake, Nuts', calories: 150, protein: 10, carbs: 5, fats: 5 }
      ],
      assigned_members: [
        { id: 1, name: 'Sarah Johnson' },
        { id: 3, name: 'Emma Wilson' }
      ],
      created_at: '2024-06-01',
      status: 'active'
    }
  ]);

  // Meal type options
  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'pre-workout', label: 'Pre-Workout' },
    { value: 'post-workout', label: 'Post-Workout' }
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
      meals: [
        {
          id: Date.now(),
          meal_type: 'breakfast',
          food_items: '',
          calories: '',
          protein: '',
          carbs: '',
          fats: ''
        }
      ],
      assigned_members: []
    });
    setEditingPlan(null);
    setIsCreating(false);
    setSearchTerm('');
    setShowMemberDropdown(false);
  };

  // Add meal to form
  const addMeal = () => {
    setFormData(prev => ({
      ...prev,
      meals: [
        ...prev.meals,
        {
          id: Date.now() + Math.random(),
          meal_type: 'lunch',
          food_items: '',
          calories: '',
          protein: '',
          carbs: '',
          fats: ''
        }
      ]
    }));
  };

  // Remove meal from form
  const removeMeal = (mealId) => {
    if (formData.meals.length > 1) {
      setFormData(prev => ({
        ...prev,
        meals: prev.meals.filter(meal => meal.id !== mealId)
      }));
    }
  };

  // Update meal in form
  const updateMeal = (mealId, field, value) => {
    setFormData(prev => ({
      ...prev,
      meals: prev.meals.map(meal =>
        meal.id === mealId ? { ...meal, [field]: value } : meal
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
    const totals = formData.meals.reduce((acc, meal) => {
      return {
        calories: acc.calories + (parseInt(meal.calories) || 0),
        protein: acc.protein + (parseInt(meal.protein) || 0),
        carbs: acc.carbs + (parseInt(meal.carbs) || 0),
        fats: acc.fats + (parseInt(meal.fats) || 0)
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
    return totals;
  };

  // Save diet plan
  const saveDietPlan = async () => {
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
                total_calories: totals.calories,
                total_protein: totals.protein,
                total_carbs: totals.carbs,
                total_fats: totals.fats
              }
            : plan
        ));
        setSuccessMessage('Diet plan updated successfully!');
      } else {
        // Create new plan
        const newPlan = {
          id: Date.now(),
          ...formData,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fats: totals.fats,
          created_at: new Date().toISOString().split('T')[0],
          status: 'active'
        };
        setExistingPlans(prev => [newPlan, ...prev]);
        setSuccessMessage('Diet plan created successfully!');
      }
      
      resetForm();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Failed to save diet plan. Please try again.');
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
      setExistingPlans(prev => prev.filter(plan => plan.id !== planId));
      setSuccessMessage('Diet plan deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Failed to delete diet plan');
      console.error('Error deleting diet plan:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit diet plan
  const editDietPlan = (plan) => {
    setFormData({
      name: plan.name,
      description: plan.description,
      start_date: plan.start_date,
      end_date: plan.end_date,
      meals: plan.meals.map(meal => ({ ...meal })),
      assigned_members: plan.assigned_members.map(member => ({ ...member }))
    });
    setEditingPlan(plan);
    setIsCreating(true);
  };

  // Duplicate diet plan
  const duplicateDietPlan = (plan) => {
    setFormData({
      name: `${plan.name} (Copy)`,
      description: plan.description,
      start_date: '',
      end_date: '',
      meals: plan.meals.map(meal => ({ 
        ...meal, 
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

  const getMealTypeLabel = (mealType) => {
    const meal = mealTypes.find(m => m.value === mealType);
    return meal ? meal.label : mealType;
  };

  const totals = calculateTotals();

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
              placeholder="Describe the diet plan goals and guidelines..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 resize-none h-24 focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Meals Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Meals</h3>
              <button
                onClick={addMeal}
                className="px-3 py-1.5 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-300 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Meal
              </button>
            </div>

            <div className="space-y-4">
              {formData.meals.map((meal, index) => (
                <div key={meal.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-5 w-5 text-yellow-400" />
                      <span className="text-white font-medium">Meal {index + 1}</span>
                    </div>
                    {formData.meals.length > 1 && (
                      <button
                        onClick={() => removeMeal(meal.id)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Meal Type</label>
                      <select
                        value={meal.meal_type}
                        onChange={(e) => updateMeal(meal.id, 'meal_type', e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-yellow-400"
                      >
                        {mealTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Food Items</label>
                      <input
                        type="text"
                        value={meal.food_items}
                        onChange={(e) => updateMeal(meal.id, 'food_items', e.target.value)}
                        placeholder="e.g., Oatmeal, Eggs, Fruits"
                        className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Calories</label>
                      <input
                        type="number"
                        value={meal.calories}
                        onChange={(e) => updateMeal(meal.id, 'calories', e.target.value)}
                        placeholder="kcal"
                        className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                        min={0}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Protein (g)</label>
                      <input
                        type="number"
                        value={meal.protein}
                        onChange={(e) => updateMeal(meal.id, 'protein', e.target.value)}
                        placeholder="grams"
                        className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                        min={0}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Carbs (g)</label>
                      <input
                        type="number"
                        value={meal.carbs}
                        onChange={(e) => updateMeal(meal.id, 'carbs', e.target.value)}
                        placeholder="grams"
                        className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                        min={0}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Fats (g)</label>
                      <input
                        type="number"
                        value={meal.fats}
                        onChange={(e) => updateMeal(meal.id, 'fats', e.target.value)}
                        placeholder="grams"
                        className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-400/20 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Calories</p>
                  <p className="text-lg font-bold text-yellow-400">{totals.calories} kcal</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Protein</p>
                  <p className="text-lg font-bold text-white">{totals.protein}g</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Carbs</p>
                  <p className="text-lg font-bold text-white">{totals.carbs}g</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Fats</p>
                  <p className="text-lg font-bold text-white">{totals.fats}g</p>
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
                    <span className="text-gray-400">Duration:</span>
                    <p className="text-white font-medium">
                      {plan.start_date} to {plan.end_date}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Calories:</span>
                    <p className="text-yellow-400 font-semibold">{plan.total_calories} kcal</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Meals:</span>
                    <p className="text-white font-medium">{plan.meals.length} meals</p>
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

              {/* Expanded Meal Details */}
              {expandedPlan === plan.id && (
                <div className="border-t border-gray-700 p-4 bg-gray-900/50">
                  <h4 className="text-sm font-semibold text-white mb-3">Meal Breakdown</h4>
                  <div className="space-y-2">
                    {plan.meals.map((meal) => (
                      <div key={meal.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                        <Utensils className="h-4 w-4 text-yellow-400" />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400 text-xs">Type:</span>
                            <p className="text-white capitalize">{getMealTypeLabel(meal.meal_type)}</p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-gray-400 text-xs">Food Items:</span>
                            <p className="text-white">{meal.food_items}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">Calories:</span>
                            <p className="text-yellow-400 font-medium">{meal.calories} kcal</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">Macros (P/C/F):</span>
                            <p className="text-white">{meal.protein}g / {meal.carbs}g / {meal.fats}g</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals Summary */}
                  <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-400/20 rounded-lg">
                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Total Cal</p>
                        <p className="font-bold text-yellow-400">{plan.total_calories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Protein</p>
                        <p className="font-bold text-white">{plan.total_protein}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Carbs</p>
                        <p className="font-bold text-white">{plan.total_carbs}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Fats</p>
                        <p className="font-bold text-white">{plan.total_fats}g</p>
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