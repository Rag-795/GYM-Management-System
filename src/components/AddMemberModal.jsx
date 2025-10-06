import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

const AddMemberModal = ({ isOpen, onClose, onSubmit, trainers = [], membershipPlans = [] }) => {
  const [formData, setFormData] = useState({
    // User credentials
    email: '',
    password: '',
    
    // Personal Information (Member table)
    first_name: '',
    last_name: '',
    dob: '',
    gender: '',
    emergency_contact: '',
    
    // Contact Information (MemberPhone table)
    phone: '',
    
    // Address Information (Address table)
    street_name: '',
    city_name: '',
    state_name: '',
    postal_code: '',
    
    // Membership Details (MemberMembership table)
    plan_id: '',
    start_date: '',
    amount_paid: '',
    discount: '0',
    
    // Physical Metrics (PhysicalMetric table)
    height_cm: '',
    weight_kg: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      dob: '',
      gender: '',
      emergency_contact: '',
      phone: '',
      street_name: '',
      city_name: '',
      state_name: '',
      postal_code: '',
      plan_id: '',
      start_date: '',
      amount_paid: '',
      discount: '0',
      height_cm: '',
      weight_kg: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Add New Member</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  name="dob"
                  value={formData.dob}
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
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <Input
                  label="Phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Emergency Contact"
                  name="emergency_contact"
                  type='tel'
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Street Name"
                    name="street_name"
                    value={formData.street_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Input
                  label="City"
                  name="city_name"
                  value={formData.city_name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="State"
                  name="state_name"
                  value={formData.state_name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Postal Code"
                  name="postal_code"
                  value={formData.postal_code}
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
                    name="plan_id"
                    value={formData.plan_id}
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
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Amount Paid"
                  type="number"
                  step="0.01"
                  min='0'
                  name="amount_paid"
                  value={formData.amount_paid}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Discount (%)"
                  type="number"
                  step="0.01"
                  min='0'
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Physical Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Physical Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Height (cm)"
                  type="number"
                  step="0.01"
                  min='0'
                  name="height_cm"
                  value={formData.height_cm}
                  onChange={handleInputChange}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.01"
                  min='0'
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="primary"
                onClick={handleSubmit}
              >
                Add Member
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;