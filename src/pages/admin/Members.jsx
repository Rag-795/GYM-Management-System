import React, { useState } from 'react';
import { 
  Search, Plus, Filter, Download, Edit, Trash2, Eye, 
  Mail, Phone, Calendar, MapPin, MoreVertical, UserPlus,
  FileText, CreditCard, Activity, Award, X, Upload, Camera, User2, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState('list');

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
    goals: ''
  });

  // Sample data
  const members = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      joinDate: '2024-01-15',
      plan: 'Premium',
      status: 'active',
      lastCheckIn: '2024-01-20 09:30 AM',
      address: '123 Main St, City, 12345',
      age: 28,
      weight: '75 kg',
      height: '180 cm',
      bmi: 23.1,
      trainer: 'Mike Chen',
      nextPayment: '2024-02-15',
      attendance: '92%',
      gender: 'Male',
      emergencyPhone: '(555) 987-6543'
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'sarah@example.com',
      phone: '(555) 234-5678',
      joinDate: '2024-01-14',
      plan: 'Basic',
      status: 'active',
      lastCheckIn: '2024-01-20 06:00 AM',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      address: '456 Oak Ave, Town, 67890',
      age: 25,
      weight: '62 kg',
      height: '165 cm',
      bmi: 22.8,
      trainer: 'Emily Rodriguez',
      nextPayment: '2024-02-14',
      attendance: '88%',
      gender: 'Female',
      emergencyContact: 'Tom Smith',
      emergencyPhone: '(555) 876-5432'
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
      phone: '(555) 345-6789',
      joinDate: '2024-01-13',
      plan: 'Elite',
      status: 'inactive',
      lastCheckIn: '2024-01-18 07:45 AM',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      address: '789 Pine Rd, Village, 11111',
      age: 32,
      weight: '85 kg',
      height: '185 cm',
      bmi: 24.8,
      trainer: 'John Smith',
      nextPayment: 'Overdue',
      attendance: '76%',
      gender: 'Male',
      emergencyContact: 'Lisa Johnson',
      emergencyPhone: '(555) 765-4321'
    }
  ];

  const membershipPlans = [
    { id: 'basic', name: 'Basic', price: 29 },
    { id: 'premium', name: 'Premium', price: 59 },
    { id: 'elite', name: 'Elite', price: 99 }
  ];

  const trainers = [
    { id: 1, name: 'Mike Chen' },
    { id: 2, name: 'Emily Rodriguez' },
    { id: 3, name: 'John Smith' },
    { id: 4, name: 'Sarah Johnson' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    // API call to add member
    console.log('Adding member:', formData);
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
      goals: ''
    });
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleDeleteMember = (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      // API call to delete member
      console.log('Deleting member:', id);
    }
  };

  const filteredMembers = members.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Members Management</h1>
          <p className="text-gray-400 mt-1">Total Members: {members.length}</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="primary" icon={UserPlus} onClick={() => setShowAddModal(true)}>
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Members</p>
              <p className="text-2xl font-bold text-white">892</p>
            </div>
            <div className="bg-green-400/20 p-2 rounded">
              <Activity className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">New This Month</p>
              <p className="text-2xl font-bold text-white">45</p>
            </div>
            <div className="bg-yellow-400/20 p-2 rounded">
              <UserPlus className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Expired</p>
              <p className="text-2xl font-bold text-white">23</p>
            </div>
            <div className="bg-red-400/20 p-2 rounded">
              <Calendar className="h-5 w-5 text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg. Attendance</p>
              <p className="text-2xl font-bold text-white">85%</p>
            </div>
            <div className="bg-blue-400/20 p-2 rounded">
              <Award className="h-5 w-5 text-blue-400" />
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
            <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400">
              <option value="">All Plans</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="elite">Elite</option>
            </select>
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
                <th className="p-4">Last Check-in</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-white font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-gray-400 text-sm">ID: #{member.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-gray-300 text-sm">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        {member.email}
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        {member.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-medium">
                        {member.plan}
                      </span>
                      <p className="text-gray-400 text-xs mt-1">
                        Expires: {member.nextPayment}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-300">{member.trainer}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-300 text-sm">{member.lastCheckIn}</p>
                    <p className="text-gray-500 text-xs">Attendance: {member.attendance}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      member.status === 'active' ? 'bg-green-400/20 text-green-400' :
                      member.status === 'inactive' ? 'bg-red-400/20 text-red-400' :
                      'bg-yellow-400/20 text-yellow-400'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewMember(member)}
                        className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        <Eye className="h-4 w-4 hover:cursor-pointer" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-yellow-400 transition-colors">
                        <Edit className="h-4 w-4 hover:cursor-pointer" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 hover:cursor-pointer" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing 1 to {filteredMembers.length} of {members.length} members
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-yellow-400 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 bg-yellow-400 text-black rounded font-medium">1</button>
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-yellow-400 transition-colors">2</button>
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-yellow-400 transition-colors">3</button>
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:text-yellow-400 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Add New Member</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6 hover:cursor-pointer" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-6">
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
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
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

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Street Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="ZIP Code"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Contact Name"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="Contact Phone"
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Membership Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Membership Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Membership Plan <span className="text-yellow-400">*</span>
                    </label>
                    <select
                      name="membershipPlan"
                      value={formData.membershipPlan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                      required
                    >
                      <option value="">Select Plan</option>
                      {membershipPlans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.price}/month
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Start Date"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Assign Trainer
                    </label>
                    <select
                      name="trainer"
                      value={formData.trainer}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    >
                      <option value="">No Trainer</option>
                      {trainers.map(trainer => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Health Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Health Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Height (cm)"
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Medical Conditions
                    </label>
                    <textarea
                      name="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                      placeholder="Any medical conditions or allergies..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Fitness Goals
                    </label>
                    <textarea
                      name="goals"
                      value={formData.goals}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                      placeholder="Member's fitness goals..."
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
                  Add Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="flex-1 flex justify-between">
                        <span className="text-gray-400">Member Since</span>
                        <span className="font-medium">
                          {selectedMember.joinDate}
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
                          {selectedMember.emergencyPhone || '—'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="w-full grid grid-cols-[max-content,1fr] items-start gap-3">
                        <span className="text-gray-400">Address</span>
                        <span className="font-medium break-words">
                          {selectedMember.address || '—'}
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
                    <p className="font-semibold">{selectedMember.weight || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Height</p>
                    <p className="font-semibold">{selectedMember.height || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">BMI</p>
                    <p className="font-semibold">
                      {typeof selectedMember.bmi === 'number'
                        ? selectedMember.bmi.toFixed(1)
                        : selectedMember.bmi || '—'}
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