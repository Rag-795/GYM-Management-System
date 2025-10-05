import React, { useState } from 'react';
import { 
  Search, Plus, Filter, Download, Edit, Trash2, Eye, 
  Dumbbell, Apple, Clock, Users, Calendar, Star,
  TrendingUp, Copy, Salad, ChevronRight,
  BicepsFlexed
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';

const Plans = () => {
  const [activeTab, setActiveTab] = useState('workout');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample workout plans data
  const workoutPlans = [
    {
      id: 1,
      name: 'Beginner Full Body',
      type: 'Strength Training',
      duration: '45 mins',
      difficulty: 'Beginner',
      trainer: 'John Smith',
      trainerId: 1,
      description: 'A comprehensive full-body workout perfect for beginners',
      exercises: [
        { name: 'Squats', sets: 3, reps: 12, rest: '60s' },
        { name: 'Push-ups', sets: 3, reps: 10, rest: '45s' },
        { name: 'Lunges', sets: 3, reps: 10, rest: '60s' },
        { name: 'Plank', sets: 3, duration: '30s', rest: '30s' }
      ],
      assignedMembers: 45,
      rating: 4.5,
      createdDate: '2024-01-10',
      lastModified: '2024-01-15',
      status: 'active',
      equipment: ['Dumbbells', 'Mat', 'Resistance Bands']
    },
    {
      id: 2,
      name: 'Advanced HIIT',
      type: 'HIIT',
      duration: '30 mins',
      difficulty: 'Advanced',
      trainer: 'Sarah Johnson',
      trainerId: 2,
      description: 'High-intensity interval training for maximum calorie burn',
      exercises: [
        { name: 'Burpees', sets: 4, reps: 15, rest: '30s' },
        { name: 'Mountain Climbers', sets: 4, duration: '45s', rest: '15s' },
        { name: 'Jump Squats', sets: 4, reps: 20, rest: '30s' },
        { name: 'Box Jumps', sets: 3, reps: 12, rest: '45s' }
      ],
      assignedMembers: 32,
      rating: 4.8,
      createdDate: '2024-01-08',
      lastModified: '2024-01-18',
      status: 'active',
      equipment: ['Box', 'Timer']
    },
    {
      id: 3,
      name: 'Yoga Flow',
      type: 'Flexibility',
      duration: '60 mins',
      difficulty: 'All Levels',
      trainer: 'Emily Rodriguez',
      trainerId: 3,
      description: 'Gentle yoga flow for flexibility and mindfulness',
      exercises: [
        { name: 'Sun Salutation', sets: 5, reps: 1, rest: '0s' },
        { name: 'Warrior Poses', duration: '10 mins' },
        { name: 'Balance Poses', duration: '15 mins' },
        { name: 'Cool Down Stretches', duration: '10 mins' }
      ],
      assignedMembers: 28,
      rating: 4.7,
      createdDate: '2024-01-05',
      lastModified: '2024-01-12',
      status: 'active',
      equipment: ['Yoga Mat', 'Blocks', 'Strap']
    },
    {
      id: 4,
      name: 'Powerlifting Program',
      type: 'Strength Training',
      duration: '90 mins',
      difficulty: 'Advanced',
      trainer: 'Mike Chen',
      trainerId: 4,
      description: 'Heavy compound movements for maximum strength gains',
      exercises: [
        { name: 'Deadlift', sets: 5, reps: 5, rest: '3min' },
        { name: 'Bench Press', sets: 5, reps: 5, rest: '3min' },
        { name: 'Squat', sets: 5, reps: 5, rest: '3min' },
        { name: 'Overhead Press', sets: 4, reps: 8, rest: '2min' }
      ],
      assignedMembers: 18,
      rating: 4.9,
      createdDate: '2024-01-03',
      lastModified: '2024-01-19',
      status: 'active',
      equipment: ['Barbell', 'Plates', 'Power Rack', 'Bench']
    }
  ];

  // Sample diet plans data
  const dietPlans = [
    {
      id: 1,
      name: 'Weight Loss Plan',
      type: 'Calorie Deficit',
      calories: 1800,
      protein: '130g',
      carbs: '180g',
      fats: '60g',
      nutritionist: 'Dr. Sarah Miller',
      description: 'Balanced diet plan for healthy weight loss',
      meals: [
        { time: 'Breakfast', calories: 400, items: ['Oatmeal', 'Berries', 'Protein Shake'] },
        { time: 'Lunch', calories: 500, items: ['Grilled Chicken', 'Brown Rice', 'Vegetables'] },
        { time: 'Snack', calories: 200, items: ['Greek Yogurt', 'Nuts'] },
        { time: 'Dinner', calories: 500, items: ['Salmon', 'Quinoa', 'Salad'] },
        { time: 'Post-Workout', calories: 200, items: ['Protein Bar', 'Banana'] }
      ],
      assignedMembers: 68,
      rating: 4.6,
      createdDate: '2024-01-07',
      lastModified: '2024-01-16',
      status: 'active',
      dietaryRestrictions: ['Gluten-Free Options Available']
    },
    {
      id: 2,
      name: 'Muscle Building Diet',
      type: 'Calorie Surplus',
      calories: 3200,
      protein: '200g',
      carbs: '400g',
      fats: '100g',
      nutritionist: 'Dr. James Wilson',
      description: 'High-protein diet for muscle growth and recovery',
      meals: [
        { time: 'Breakfast', calories: 700, items: ['Eggs', 'Whole Wheat Toast', 'Avocado'] },
        { time: 'Mid-Morning', calories: 400, items: ['Mass Gainer Shake'] },
        { time: 'Lunch', calories: 800, items: ['Steak', 'Sweet Potato', 'Broccoli'] },
        { time: 'Pre-Workout', calories: 300, items: ['Rice Cakes', 'Peanut Butter'] },
        { time: 'Post-Workout', calories: 400, items: ['Whey Protein', 'White Rice'] },
        { time: 'Dinner', calories: 600, items: ['Chicken Breast', 'Pasta', 'Mixed Vegetables'] }
      ],
      assignedMembers: 42,
      rating: 4.7,
      createdDate: '2024-01-06',
      lastModified: '2024-01-14',
      status: 'active',
      dietaryRestrictions: []
    },
    {
      id: 3,
      name: 'Vegan Performance',
      type: 'Plant-Based',
      calories: 2500,
      protein: '150g',
      carbs: '320g',
      fats: '80g',
      nutritionist: 'Dr. Emily Green',
      description: 'Complete plant-based nutrition for athletes',
      meals: [
        { time: 'Breakfast', calories: 550, items: ['Tofu Scramble', 'Whole Grain Bread', 'Fruit'] },
        { time: 'Lunch', calories: 650, items: ['Lentil Bowl', 'Quinoa', 'Tahini Dressing'] },
        { time: 'Snack', calories: 300, items: ['Hummus', 'Vegetables', 'Nuts'] },
        { time: 'Dinner', calories: 700, items: ['Tempeh', 'Brown Rice', 'Stir-fried Vegetables'] },
        { time: 'Evening', calories: 300, items: ['Plant Protein Shake', 'Dates'] }
      ],
      assignedMembers: 24,
      rating: 4.5,
      createdDate: '2024-01-09',
      lastModified: '2024-01-17',
      status: 'active',
      dietaryRestrictions: ['100% Vegan', 'Gluten-Free Options']
    },
    {
      id: 4,
      name: 'Keto Diet Plan',
      type: 'Low Carb',
      calories: 2000,
      protein: '120g',
      carbs: '30g',
      fats: '150g',
      nutritionist: 'Dr. Robert Brown',
      description: 'Ketogenic diet for fat loss and mental clarity',
      meals: [
        { time: 'Breakfast', calories: 500, items: ['Bacon', 'Eggs', 'Butter Coffee'] },
        { time: 'Lunch', calories: 600, items: ['Caesar Salad', 'Grilled Chicken', 'Olive Oil'] },
        { time: 'Snack', calories: 250, items: ['Cheese', 'Macadamia Nuts'] },
        { time: 'Dinner', calories: 650, items: ['Ribeye Steak', 'Asparagus', 'Butter'] }
      ],
      assignedMembers: 35,
      rating: 4.4,
      createdDate: '2024-01-04',
      lastModified: '2024-01-13',
      status: 'active',
      dietaryRestrictions: ['Very Low Carb']
    }
  ];

  const plans = activeTab === 'workout' ? workoutPlans : dietPlans;
  
  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (activeTab === 'workout' ? plan.trainer : plan.nutritionist).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PlanCard = ({ plan }) => (
    <div className="bg-gray-800 rounded-xl p-6 hover:border-yellow-400 border border-gray-700 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
          <p className="text-gray-400 text-sm">{plan.type}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:cursor-pointer text-gray-400 hover:text-yellow-400 transition-colors">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 hover:cursor-pointer text-gray-400 hover:text-yellow-400 transition-colors">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{plan.description}</p>

      {activeTab === 'workout' ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-gray-400">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">{plan.duration}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="text-sm">{plan.difficulty}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-gray-400">
              <Dumbbell className="h-4 w-4 mr-2" />
              <span className="text-sm">{plan.exercises.length} exercises</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm text-white">{plan.rating}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-900 rounded-lg p-2 text-center">
              <p className="text-yellow-400 font-bold text-lg">{plan.calories}</p>
              <p className="text-gray-400 text-xs">Calories</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-2 text-center">
              <p className="text-yellow-400 font-bold text-lg">{plan.protein}</p>
              <p className="text-gray-400 text-xs">Protein</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-gray-400">
              <Apple className="h-4 w-4 mr-2" />
              <span className="text-sm">{plan.meals.length} meals</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm text-white">{plan.rating}</span>
            </div>
          </div>
        </>
      )}

      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Created by</p>
            <p className="text-sm text-white font-medium">
              {activeTab === 'workout' ? plan.trainer : plan.nutritionist}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Assigned to</p>
            <p className="text-sm text-white font-medium">{plan.assignedMembers} members</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Workout & Diet Plans</h1>
          <p className="text-gray-400 mt-1">Manage fitness and nutrition programs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all hover:cursor-pointer ${
            activeTab === 'workout' 
              ? 'bg-yellow-400 text-black' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BicepsFlexed className="h-5 w-5" />
          <span>Workout Plans</span>
        </button>
        <button
          onClick={() => setActiveTab('diet')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all hover:cursor-pointer ${
            activeTab === 'diet' 
              ? 'bg-yellow-400 text-black' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Salad className="h-5 w-5" />
          <span>Diet Plans</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab} plans...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400">
              <option value="">All Types</option>
              {activeTab === 'workout' ? (
                <>
                  <option value="strength">Strength Training</option>
                  <option value="cardio">Cardio</option>
                  <option value="hiit">HIIT</option>
                  <option value="flexibility">Flexibility</option>
                </>
              ) : (
                <>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="special">Special Diet</option>
                </>
              )}
            </select>
            <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400">
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      
    </div>
  );
};

export default Plans;


// import React, { useMemo, useState } from 'react';
// import {
//   Search, Plus, Edit, Trash2, Eye, X, Dumbbell, ClipboardList, Utensils, Users, CheckCircle
// } from 'lucide-react';
// import { Button } from '../../components/Button';
// import { Input } from '../../components/Input';
// import { Alert } from '../../components/Alert';

// const Modal = ({ open, title, onClose, children, width = 'max-w-2xl' }) => {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/60" onClick={onClose} />
//       <div className={`relative w-full ${width} bg-gray-900 rounded-xl border border-gray-800 p-6`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-bold text-white">{title}</h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-yellow-400">
//             <X className="h-5 w-5" />
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// };

// const initialWorkouts = [
//   {
//     id: 1,
//     name: 'Full Body Strength',
//     type: 'Strength',
//     level: 'Intermediate',
//     duration: '45 min',
//     frequency: '3x/week',
//     equipment: ['Barbell', 'Dumbbells', 'Bench'],
//     createdBy: 'John Smith',
//     description: 'Compound lifts focusing on squat, bench, and deadlift variations.'
//   },
//   {
//     id: 2,
//     name: 'Fat Burn HIIT',
//     type: 'Cardio',
//     level: 'Beginner',
//     duration: '30 min',
//     frequency: '4x/week',
//     equipment: ['Rowing Machine', 'Kettlebell'],
//     createdBy: 'Sarah Lee',
//     description: 'Intervals of high-intensity cardio mixed with active recovery.'
//   },
//   {
//     id: 3,
//     name: 'Hypertrophy Split',
//     type: 'Bodybuilding',
//     level: 'Advanced',
//     duration: '60 min',
//     frequency: '5x/week',
//     equipment: ['Cable Machine', 'Dumbbells', 'Barbell'],
//     createdBy: 'Mike Chen',
//     description: 'Push/Pull/Legs split focused on muscle growth and volume.'
//   },
//   {
//     id: 4,
//     name: 'Mobility Flow',
//     type: 'Mobility',
//     level: 'All Levels',
//     duration: '25 min',
//     frequency: 'Daily',
//     equipment: ['Mat'],
//     createdBy: 'Emily R.',
//     description: 'Dynamic mobility flow to improve range of motion and recovery.'
//   }
// ];

// const initialDiets = [
//   {
//     id: 1,
//     name: 'Lean Muscle',
//     dietType: 'High Protein',
//     calories: 2400,
//     macros: { protein: 40, carbs: 35, fat: 25 },
//     createdBy: 'Emily R.',
//     description: 'Protein-forward plan with balanced carbs and healthy fats.'
//   },
//   {
//     id: 2,
//     name: 'Fat Loss Cut',
//     dietType: 'Low Carb',
//     calories: 1800,
//     macros: { protein: 35, carbs: 25, fat: 40 },
//     createdBy: 'John Smith',
//     description: 'Low-carb meals prioritizing satiety and micronutrient density.'
//   },
//   {
//     id: 3,
//     name: 'Endurance Fuel',
//     dietType: 'High Carb',
//     calories: 2600,
//     macros: { protein: 25, carbs: 55, fat: 20 },
//     createdBy: 'Sarah Lee',
//     description: 'Designed for runners/cyclists to sustain long training blocks.'
//   },
//   {
//     id: 4,
//     name: 'Plant Power',
//     dietType: 'Vegan',
//     calories: 2200,
//     macros: { protein: 30, carbs: 50, fat: 20 },
//     createdBy: 'Mike Chen',
//     description: 'Whole-food plant-based meals with complete protein sources.'
//   }
// ];

// const WorkoutForm = ({ value, onChange, onSubmit, submitLabel = 'Save' }) => {
//   const [errors, setErrors] = useState({});
//   const validate = () => {
//     const e = {};
//     if (!value.name) e.name = 'Plan name is required';
//     if (!value.type) e.type = 'Select a type';
//     if (!value.level) e.level = 'Select a level';
//     if (!value.duration) e.duration = 'Provide duration';
//     if (!value.frequency) e.frequency = 'Provide frequency';
//     if (!value.description) e.description = 'Description is required';
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };
//   return (
//     <form
//       onSubmit={(ev) => {
//         ev.preventDefault();
//         if (validate()) onSubmit();
//       }}
//       className="space-y-4"
//     >
//       <div className="grid md:grid-cols-2 gap-4">
//         <Input label="Plan Name" name="name" value={value.name} onChange={onChange} error={errors.name} required />
//         <div>
//           <label className="block text-sm font-semibold text-gray-300 mb-2">Type <span className="text-yellow-400">*</span></label>
//           <select
//             name="type"
//             value={value.type}
//             onChange={onChange}
//             className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//           >
//             <option value="">Select type</option>
//             <option>Strength</option>
//             <option>Cardio</option>
//             <option>Bodybuilding</option>
//             <option>Mobility</option>
//             <option>CrossFit</option>
//           </select>
//           {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
//         </div>
//       </div>

//       <div className="grid md:grid-cols-3 gap-4">
//         <div>
//           <label className="block text-sm font-semibold text-gray-300 mb-2">Level <span className="text-yellow-400">*</span></label>
//           <select
//             name="level"
//             value={value.level}
//             onChange={onChange}
//             className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//           >
//             <option value="">Select level</option>
//             <option>Beginner</option>
//             <option>Intermediate</option>
//             <option>Advanced</option>
//             <option>All Levels</option>
//           </select>
//           {errors.level && <p className="mt-1 text-sm text-red-500">{errors.level}</p>}
//         </div>
//         <Input label="Duration" name="duration" value={value.duration} onChange={onChange} placeholder="e.g., 45 min" error={errors.duration} required />
//         <Input label="Frequency" name="frequency" value={value.frequency} onChange={onChange} placeholder="e.g., 3x/week" error={errors.frequency} required />
//       </div>

//       <Input
//         label="Equipment (comma-separated)"
//         name="equipment"
//         value={value.equipment}
//         onChange={onChange}
//         placeholder="Dumbbells, Barbell, Kettlebell"
//       />

//       <div>
//         <label className="block text-sm font-semibold text-gray-300 mb-2">Description <span className="text-yellow-400">*</span></label>
//         <textarea
//           name="description"
//           value={value.description}
//           onChange={onChange}
//           rows={4}
//           className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//           placeholder="Short description of the plan..."
//         />
//         {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
//       </div>

//       <div className="flex justify-end gap-2 pt-2">
//         <Button variant="ghost" type="button" onClick={() => onSubmit('cancel')}>Cancel</Button>
//         <Button variant="primary" type="submit">{submitLabel}</Button>
//       </div>
//     </form>
//   );
// };

// const DietForm = ({ value, onChange, onSubmit, submitLabel = 'Save' }) => {
//   const [errors, setErrors] = useState({});
//   const validate = () => {
//     const e = {};
//     if (!value.name) e.name = 'Plan name is required';
//     if (!value.dietType) e.dietType = 'Select a diet type';
//     if (!value.calories) e.calories = 'Calories required';
//     if (!value.description) e.description = 'Description is required';
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };
//   return (
//     <form
//       onSubmit={(ev) => {
//         ev.preventDefault();
//         if (validate()) onSubmit();
//       }}
//       className="space-y-4"
//     >
//       <div className="grid md:grid-cols-2 gap-4">
//         <Input label="Plan Name" name="name" value={value.name} onChange={onChange} error={errors.name} required />
//         <div>
//           <label className="block text-sm font-semibold text-gray-300 mb-2">Diet Type <span className="text-yellow-400">*</span></label>
//           <select
//             name="dietType"
//             value={value.dietType}
//             onChange={onChange}
//             className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//           >
//             <option value="">Select type</option>
//             <option>High Protein</option>
//             <option>Low Carb</option>
//             <option>High Carb</option>
//             <option>Keto</option>
//             <option>Vegan</option>
//             <option>Balanced</option>
//           </select>
//           {errors.dietType && <p className="mt-1 text-sm text-red-500">{errors.dietType}</p>}
//         </div>
//       </div>

//       <div className="grid md:grid-cols-3 gap-4">
//         <Input label="Calories" name="calories" type="number" value={value.calories} onChange={onChange} placeholder="e.g., 2200" error={errors.calories} required />
//         <Input label="Protein %" name="protein" type="number" value={value.protein} onChange={onChange} placeholder="30" />
//         <Input label="Carbs %" name="carbs" type="number" value={value.carbs} onChange={onChange} placeholder="40" />
//       </div>
//       <div className="grid md:grid-cols-2 gap-4">
//         <Input label="Fat %" name="fat" type="number" value={value.fat} onChange={onChange} placeholder="30" />
//         <Input label="Created By (Trainer/Admin)" name="createdBy" value={value.createdBy} onChange={onChange} placeholder="e.g., Emily R." />
//       </div>

//       <div>
//         <label className="block text-sm font-semibold text-gray-300 mb-2">Description <span className="text-yellow-400">*</span></label>
//         <textarea
//           name="description"
//           value={value.description}
//           onChange={onChange}
//           rows={4}
//           className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//           placeholder="Short description of the plan..."
//         />
//         {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
//       </div>

//       <div className="flex justify-end gap-2 pt-2">
//         <Button variant="ghost" type="button" onClick={() => onSubmit('cancel')}>Cancel</Button>
//         <Button variant="primary" type="submit">{submitLabel}</Button>
//       </div>
//     </form>
//   );
// };

// const AssignPlanModal = ({ open, onClose, plan }) => {
//   const [email, setEmail] = useState('');
//   const [startDate, setStartDate] = useState('');
//   return (
//     <Modal open={open} onClose={onClose} title={`Assign "${plan?.name}" to Member`} width="max-w-lg">
//       <div className="space-y-4">
//         <Input label="Member Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="member@example.com" required />
//         <Input label="Start Date" name="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
//         <div className="flex justify-end gap-2">
//           <Button variant="ghost" onClick={onClose}>Cancel</Button>
//           <Button
//             variant="primary"
//             onClick={() => {
//               // integrate with API: POST /plans/{id}/assign
//               alert(`Assigned "${plan.name}" to ${email} starting ${startDate}`);
//               onClose();
//             }}
//             icon={CheckCircle}
//           >
//             Assign
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// const Plans = () => {
//   const [tab, setTab] = useState('workouts'); // workouts | diets
//   const [search, setSearch] = useState('');
//   const [workouts, setWorkouts] = useState(initialWorkouts);
//   const [diets, setDiets] = useState(initialDiets);
//   const [alert, setAlert] = useState(null);

//   const [workoutModal, setWorkoutModal] = useState({ open: false, edit: null });
//   const [dietModal, setDietModal] = useState({ open: false, edit: null });
//   const [assignModal, setAssignModal] = useState({ open: false, plan: null });

//   const [workoutForm, setWorkoutForm] = useState({
//     name: '', type: '', level: '', duration: '', frequency: '',
//     equipment: '', description: '', createdBy: 'Admin'
//   });
//   const [dietForm, setDietForm] = useState({
//     name: '', dietType: '', calories: '', protein: '', carbs: '', fat: '', description: '', createdBy: 'Admin'
//   });

//   const filteredWorkouts = useMemo(() => {
//     return workouts.filter(w =>
//       w.name.toLowerCase().includes(search.toLowerCase()) ||
//       w.type.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [workouts, search]);

//   const filteredDiets = useMemo(() => {
//     return diets.filter(d =>
//       d.name.toLowerCase().includes(search.toLowerCase()) ||
//       d.dietType.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [diets, search]);

//   const openAddWorkout = () => {
//     setWorkoutForm({ name: '', type: '', level: '', duration: '', frequency: '', equipment: '', description: '', createdBy: 'Admin' });
//     setWorkoutModal({ open: true, edit: null });
//   };
//   const openEditWorkout = (plan) => {
//     setWorkoutForm({
//       ...plan,
//       equipment: plan.equipment?.join(', ') || plan.equipment || ''
//     });
//     setWorkoutModal({ open: true, edit: plan.id });
//   };

//   const openAddDiet = () => {
//     setDietForm({ name: '', dietType: '', calories: '', protein: '', carbs: '', fat: '', description: '', createdBy: 'Admin' });
//     setDietModal({ open: true, edit: null });
//   };
//   const openEditDiet = (plan) => {
//     setDietForm({
//       name: plan.name,
//       dietType: plan.dietType,
//       calories: plan.calories,
//       protein: plan.macros?.protein ?? '',
//       carbs: plan.macros?.carbs ?? '',
//       fat: plan.macros?.fat ?? '',
//       description: plan.description,
//       createdBy: plan.createdBy
//     });
//     setDietModal({ open: true, edit: plan.id });
//   };

//   const saveWorkout = () => {
//     if (workoutModal.edit) {
//       setWorkouts(prev => prev.map(w => w.id === workoutModal.edit ? {
//         ...w,
//         ...workoutForm,
//         equipment: workoutForm.equipment ? workoutForm.equipment.split(',').map(s => s.trim()).filter(Boolean) : []
//       } : w));
//       setAlert({ type: 'success', text: 'Workout plan updated' });
//     } else {
//       const newPlan = {
//         id: Date.now(),
//         ...workoutForm,
//         equipment: workoutForm.equipment ? workoutForm.equipment.split(',').map(s => s.trim()).filter(Boolean) : []
//       };
//       setWorkouts(prev => [newPlan, ...prev]);
//       setAlert({ type: 'success', text: 'Workout plan created' });
//     }
//     setWorkoutModal({ open: false, edit: null });
//   };

//   const saveDiet = () => {
//     const macros = {
//       protein: Number(dietForm.protein) || 0,
//       carbs: Number(dietForm.carbs) || 0,
//       fat: Number(dietForm.fat) || 0
//     };
//     if (dietModal.edit) {
//       setDiets(prev => prev.map(d => d.id === dietModal.edit ? {
//         ...d,
//         name: dietForm.name,
//         dietType: dietForm.dietType,
//         calories: Number(dietForm.calories),
//         macros,
//         description: dietForm.description,
//         createdBy: dietForm.createdBy
//       } : d));
//       setAlert({ type: 'success', text: 'Diet plan updated' });
//     } else {
//       setDiets(prev => [{
//         id: Date.now(),
//         name: dietForm.name,
//         dietType: dietForm.dietType,
//         calories: Number(dietForm.calories),
//         macros,
//         description: dietForm.description,
//         createdBy: dietForm.createdBy
//       }, ...prev]);
//       setAlert({ type: 'success', text: 'Diet plan created' });
//     }
//     setDietModal({ open: false, edit: null });
//   };

//   const deleteWorkout = (id) => {
//     if (confirm('Delete this workout plan?')) {
//       setWorkouts(prev => prev.filter(w => w.id !== id));
//       setAlert({ type: 'success', text: 'Workout plan deleted' });
//     }
//   };
//   const deleteDiet = (id) => {
//     if (confirm('Delete this diet plan?')) {
//       setDiets(prev => prev.filter(d => d.id !== id));
//       setAlert({ type: 'success', text: 'Diet plan deleted' });
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-black text-white">Workout & Diet Plans</h1>
//           <p className="text-gray-400 mt-1">Create, update, assign and manage all plan templates.</p>
//         </div>
//         <div className="flex gap-2">
//           {tab === 'workouts' ? (
//             <Button variant="primary" icon={Plus} onClick={openAddWorkout}>Add Workout Plan</Button>
//           ) : (
//             <Button variant="primary" icon={Plus} onClick={openAddDiet}>Add Diet Plan</Button>
//           )}
//         </div>
//       </div>

//       {alert && <Alert type={alert.type} message={alert.text} onClose={() => setAlert(null)} />}

//       {/* Tabs */}
//       <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800 w-fit">
//         <button
//           onClick={() => setTab('workouts')}
//           className={`px-4 py-2 rounded-md flex items-center gap-2 ${tab === 'workouts' ? 'bg-yellow-400 text-black' : 'text-gray-300 hover:text-yellow-400'}`}
//         >
//           <Dumbbell className="h-4 w-4" /> Workouts
//         </button>
//         <button
//           onClick={() => setTab('diets')}
//           className={`px-4 py-2 rounded-md flex items-center gap-2 ${tab === 'diets' ? 'bg-yellow-400 text-black' : 'text-gray-300 hover:text-yellow-400'}`}
//         >
//           <Utensils className="h-4 w-4" /> Diets
//         </button>
//       </div>

//       {/* Search */}
//       <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
//         <div className="relative max-w-md">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
//           <input
//             className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
//             placeholder={`Search ${tab === 'workouts' ? 'workout' : 'diet'} plans...`}
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Tables */}
//       {tab === 'workouts' ? (
//         <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-800">
//                 <tr className="text-left text-gray-400 text-sm">
//                   <th className="p-4">Plan</th>
//                   <th className="p-4">Type</th>
//                   <th className="p-4">Level</th>
//                   <th className="p-4">Duration</th>
//                   <th className="p-4">Frequency</th>
//                   <th className="p-4">Equipment</th>
//                   <th className="p-4">Created By</th>
//                   <th className="p-4">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredWorkouts.map((w) => (
//                   <tr key={w.id} className="border-t border-gray-800 hover:bg-gray-800/50">
//                     <td className="p-4">
//                       <div>
//                         <p className="text-white font-medium">{w.name}</p>
//                         <p className="text-gray-400 text-xs">{w.description}</p>
//                       </div>
//                     </td>
//                     <td className="p-4 text-gray-300">{w.type}</td>
//                     <td className="p-4 text-gray-300">{w.level}</td>
//                     <td className="p-4 text-gray-300">{w.duration}</td>
//                     <td className="p-4 text-gray-300">{w.frequency}</td>
//                     <td className="p-4">
//                       <div className="flex flex-wrap gap-1">
//                         {w.equipment?.map((eq, i) => (
//                           <span key={i} className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 rounded-full text-xs">{eq}</span>
//                         ))}
//                       </div>
//                     </td>
//                     <td className="p-4 text-gray-300">{w.createdBy}</td>
//                     <td className="p-4">
//                       <div className="flex items-center gap-2">
//                         <Button
//                           variant="secondary"
//                           onClick={() => setAssignModal({ open: true, plan: w })}
//                           icon={Users}
//                         >
//                           Assign
//                         </Button>
//                         <button className="p-2 text-gray-400 hover:text-yellow-400" onClick={() => openEditWorkout(w)}>
//                           <Edit className="h-4 w-4" />
//                         </button>
//                         <button className="p-2 text-gray-400 hover:text-red-400" onClick={() => deleteWorkout(w.id)}>
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//                 {filteredWorkouts.length === 0 && (
//                   <tr><td className="p-6 text-center text-gray-400" colSpan="8">No workout plans found</td></tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-800">
//                 <tr className="text-left text-gray-400 text-sm">
//                   <th className="p-4">Plan</th>
//                   <th className="p-4">Diet Type</th>
//                   <th className="p-4">Calories</th>
//                   <th className="p-4">Macros (P/C/F)</th>
//                   <th className="p-4">Created By</th>
//                   <th className="p-4">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredDiets.map((d) => (
//                   <tr key={d.id} className="border-t border-gray-800 hover:bg-gray-800/50">
//                     <td className="p-4">
//                       <div>
//                         <p className="text-white font-medium">{d.name}</p>
//                         <p className="text-gray-400 text-xs">{d.description}</p>
//                       </div>
//                     </td>
//                     <td className="p-4 text-gray-300">{d.dietType}</td>
//                     <td className="p-4 text-gray-300">{d.calories}</td>
//                     <td className="p-4 text-gray-300">{`${d.macros?.protein ?? 0}/${d.macros?.carbs ?? 0}/${d.macros?.fat ?? 0}`}</td>
//                     <td className="p-4 text-gray-300">{d.createdBy}</td>
//                     <td className="p-4">
//                       <div className="flex items-center gap-2">
//                         <Button
//                           variant="secondary"
//                           onClick={() => setAssignModal({ open: true, plan: d })}
//                           icon={Users}
//                         >
//                           Assign
//                         </Button>
//                         <button className="p-2 text-gray-400 hover:text-yellow-400" onClick={() => openEditDiet(d)}>
//                           <Edit className="h-4 w-4" />
//                         </button>
//                         <button className="p-2 text-gray-400 hover:text-red-400" onClick={() => deleteDiet(d.id)}>
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//                 {filteredDiets.length === 0 && (
//                   <tr><td className="p-6 text-center text-gray-400" colSpan="6">No diet plans found</td></tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       <Modal
//         open={workoutModal.open}
//         onClose={() => setWorkoutModal({ open: false, edit: null })}
//         title={workoutModal.edit ? 'Edit Workout Plan' : 'Add Workout Plan'}
//       >
//         <WorkoutForm
//           value={workoutForm}
//           onChange={(e) => setWorkoutForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
//           onSubmit={(cancel) => {
//             if (cancel === 'cancel') return setWorkoutModal({ open: false, edit: null });
//             saveWorkout();
//           }}
//           submitLabel={workoutModal.edit ? 'Update Plan' : 'Create Plan'}
//         />
//       </Modal>

//       <Modal
//         open={dietModal.open}
//         onClose={() => setDietModal({ open: false, edit: null })}
//         title={dietModal.edit ? 'Edit Diet Plan' : 'Add Diet Plan'}
//       >
//         <DietForm
//           value={dietForm}
//           onChange={(e) => setDietForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
//           onSubmit={(cancel) => {
//             if (cancel === 'cancel') return setDietModal({ open: false, edit: null });
//             saveDiet();
//           }}
//           submitLabel={dietModal.edit ? 'Update Plan' : 'Create Plan'}
//         />
//       </Modal>

//       <AssignPlanModal
//         open={assignModal.open}
//         onClose={() => setAssignModal({ open: false, plan: null })}
//         plan={assignModal.plan}
//       />
//     </div>
//   );
// };

// export default Plans;