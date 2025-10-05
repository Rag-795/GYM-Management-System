import React, { useState } from 'react';
import { 
  Search, Plus, Filter, Download, Edit, Trash2, Eye, 
  Mail, Phone, Calendar, Award, Clock, Star, Users,
  X, Upload, FileText, DollarSign, TrendingUp, Pencil
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';

const Trainers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [editingSalary, setEditingSalary] = useState(null); // Stores ID of trainer whose salary is being edited
  const [newSalary, setNewSalary] = useState(''); // Stores the new salary value
  const [alert, setAlert] = useState(null); // For success/error messages

  // Form state for new trainer
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    specialties: [],
    certifications: '',
    experience: '',
    availability: '',
    salary: '',
    joinDate: '',
    bio: ''
  });

  // Sample data
  const trainers = [
    {
      id: 1,
      firstName: 'Mike',
      lastName: 'Chen',
      phone: '(555) 111-2222',
      specialties: ['Weight Training', 'HIIT', 'CrossFit'],
      experience: '5 years',
      rating: 4.9,
      totalClients: 45,
      sessionsThisMonth: 142,
      availability: 'Full-time',
      joinDate: '2020-03-15',
      status: 'active',
      salary: '$4,500/month',
      performance: 98
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@fithub.com',
      phone: '(555) 333-4444',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      specialties: ['Yoga', 'Pilates', 'Meditation'],
      certifications: ['RYT-500', 'Pilates Instructor'],
      experience: '8 years',
      rating: 4.8,
      totalClients: 38,
      sessionsThisMonth: 128,
      availability: 'Full-time',
      joinDate: '2019-06-20',
      status: 'active',
      salary: '$5,200/month',
      performance: 95
    },
    {
      id: 3,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@fithub.com',
      phone: '(555) 555-6666',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      specialties: ['Strength Training', 'Nutrition'],
      certifications: ['NASM-CPT', 'Nutrition Specialist'],
      experience: '3 years',
      rating: 4.7,
      totalClients: 32,
      sessionsThisMonth: 115,
      availability: 'Part-time',
      joinDate: '2021-01-10',
      status: 'active',
      salary: '$2,800/month',
      performance: 94
    },
    {
      id: 4,
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.r@fithub.com',
      phone: '(555) 777-8888',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      specialties: ['Cardio', 'Dance Fitness', 'Zumba'],
      certifications: ['Zumba Instructor', 'Group Fitness'],
      experience: '6 years',
      rating: 4.9,
      totalClients: 52,
      sessionsThisMonth: 156,
      availability: 'Full-time',
      joinDate: '2018-11-05',
      status: 'active',
      salary: '$4,800/month',
      performance: 97
    }
  ];

  const specialties = [
    'Weight Training', 'Cardio', 'HIIT', 'CrossFit', 'Yoga', 
    'Pilates', 'Boxing', 'MMA', 'Dance Fitness', 'Zumba',
    'Strength Training', 'Nutrition', 'Rehabilitation'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleAddTrainer = (e) => {
    e.preventDefault();
    console.log('Adding trainer:', formData);
    setShowAddModal(false);
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      specialties: [],
      certifications: '',
      experience: '',
      availability: '',
      salary: '',
      joinDate: '',
      bio: ''
    });
  };

  const handleViewTrainer = (trainer) => {
    setSelectedTrainer(trainer);
    setShowViewModal(true);
  };
  
  // Start editing salary of a trainer
  const handleEditSalary = (trainer) => {
    setEditingSalary(trainer.id);
    setNewSalary(trainer.salary.replace(/[^\d.]/g, '')); // Remove non-numeric characters
  };
  
  // Cancel salary editing
  const cancelSalaryEdit = () => {
    setEditingSalary(null);
    setNewSalary('');
  };
  
  // Save updated salary
  const saveSalary = async (trainerId) => {
    try {
      // Format salary for display
      const formattedSalary = `$${newSalary}/month`;
      
      // API call to update salary in database
      // This is where you would make an API call to your backend
      // For example:
      // const response = await fetch('/api/trainers/${trainerId}/salary', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ salary: newSalary })
      // });
      
      // For now, let's update the local state
      const updatedTrainers = trainers.map(trainer => 
        trainer.id === trainerId 
          ? { ...trainer, salary: formattedSalary } 
          : trainer
      );
      
      // In a real application, you would update your state from the API response
      // setTrainers(updatedTrainers);
      
      // Show success message
      setAlert({
        type: 'success',
        message: 'Trainer salary updated successfully!'
      });
      
      // Reset editing state
      setEditingSalary(null);
      setNewSalary('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating salary:', error);
      setAlert({
        type: 'error',
        message: 'Failed to update salary. Please try again.'
      });
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setAlert(null);
      }, 5000);
    }
  };

  const filteredTrainers = trainers.filter(trainer => {
    const fullName = `${trainer.firstName} ${trainer.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         trainer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSpecialty === 'all' || 
                         trainer.specialties.some(s => s.toLowerCase().includes(filterSpecialty.toLowerCase()));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Alert for notifications */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Trainers Management</h1>
          <p className="text-gray-400 mt-1">Total Trainers: {trainers.length} • Active: {trainers.filter(t => t.status === 'active').length}</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Trainer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Trainers</p>
              <p className="text-2xl font-bold text-white">24</p>
            </div>
            <div className="bg-green-400/20 p-2 rounded">
              <Users className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg. Rating</p>
              <p className="text-2xl font-bold text-white">4.8</p>
            </div>
            <div className="bg-yellow-400/20 p-2 rounded">
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Sessions Today</p>
              <p className="text-2xl font-bold text-white">68</p>
            </div>
            <div className="bg-blue-400/20 p-2 rounded">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Clients</p>
              <p className="text-2xl font-bold text-white">342</p>
            </div>
            <div className="bg-purple-400/20 p-2 rounded">
              <TrendingUp className="h-5 w-5 text-purple-400" />
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
                placeholder="Search trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="all">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400">
              <option value="">Availability</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((trainer) => (
          <div key={trainer.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-yellow-400/50 transition-all">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-white font-semibold">
                      {trainer.firstName} {trainer.lastName}
                    </h3>
                    <p className="text-gray-400 text-sm">{trainer.availability}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-sm font-medium">{trainer.rating}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Specialties</p>
                  <div className="flex flex-wrap gap-1">
                    {trainer.specialties.slice(0, 3).map((specialty, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                        {specialty}
                      </span>
                    ))}
                    {trainer.specialties.length > 3 && (
                      <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">
                        +{trainer.specialties.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Experience</p>
                    <p className="text-white font-medium">{trainer.experience}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Clients</p>
                    <p className="text-white font-medium">{trainer.totalClients}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Salary
                      {editingSalary !== trainer.id && (
                        <button 
                          onClick={() => handleEditSalary(trainer)} 
                          className="p-1 text-gray-400 hover:text-yellow-400 transition-colors ml-1"
                        >
                          <Pencil className="h-3 w-3 hover:cursor-pointer" />
                        </button>
                      )}
                    </p>
                    {editingSalary === trainer.id ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="text"
                          value={newSalary}
                          onChange={(e) => setNewSalary(e.target.value)}
                          className="w-20 px-1 py-0.5 bg-gray-800 border border-yellow-400 rounded text-white text-xs"
                          autoFocus
                        />
                        <button 
                          onClick={() => saveSalary(trainer.id)}
                          className="p-0.5 text-green-400 hover:text-green-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          onClick={cancelSalaryEdit}
                          className="p-0.5 text-red-400 hover:text-red-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <p className="text-white font-medium">{trainer.salary}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Performance</p>
                    <p className="text-green-400 font-medium">{trainer.performance}%</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-800">
                <button className="flex-1 px-3 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300 transition-colors text-sm font-medium hover:cursor-pointer">
                  Assign Client
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Add New Trainer</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6 hover:cursor-pointer" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddTrainer} className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Gender <span className="text-yellow-400">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Professional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Specialties <span className="text-yellow-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {specialties.map(specialty => (
                        <label key={specialty} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.specialties.includes(specialty)}
                            onChange={() => handleSpecialtyToggle(specialty)}
                            className="rounded border-gray-600 text-yellow-400 focus:ring-yellow-400 mr-2"
                          />
                          <span className="text-gray-300 text-sm">{specialty}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Years of Experience"
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      min='0'
                      required
                    />
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Availability <span className="text-yellow-400">*</span>
                      </label>
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                        required
                      >
                        <option value="">Select Availability</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Monthly Salary ₹"
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="Amount in USD"
                      required
                      min='0'
                    />
                    <Input
                      label="Join Date"
                      type="date"
                      name="joinDate"
                      value={formData.joinDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add Trainer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainers;