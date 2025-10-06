import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

const EditMemberModal = ({ isOpen, onClose, onSubmit, member, membershipPlans = [] }) => {
  const [formData, setFormData] = useState({
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

  // Populate form when member data changes
  useEffect(() => {
    if (member) {
      console.log('EditMemberModal - Member data:', member);
      console.log('EditMemberModal - Membership plans:', membershipPlans);
      
      setFormData({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        dob: member.dob || '',
        gender: member.gender || '',
        emergency_contact: member.emergency_contact || '',
        
        // Extract phone from phones array
        phone: (member.phones && member.phones.length > 0) ? member.phones[0] : '',
        
        // Extract address from addresses array
        street_name: (member.addresses && member.addresses.length > 0) ? member.addresses[0].street_name || '' : '',
        city_name: (member.addresses && member.addresses.length > 0) ? member.addresses[0].city_name || '' : '',
        state_name: (member.addresses && member.addresses.length > 0) ? member.addresses[0].state_name || '' : '',
        postal_code: (member.addresses && member.addresses.length > 0) ? member.addresses[0].postal_code || '' : '',
        
        // Extract membership details from membership_history
        plan_id: (member.membership_history && member.membership_history.length > 0) ? member.membership_history[0].plan_id || '' : '',
        start_date: (member.membership_history && member.membership_history.length > 0) ? member.membership_history[0].start_date || '' : '',
        amount_paid: (member.membership_history && member.membership_history.length > 0) ? member.membership_history[0].amount_paid || '' : '',
        discount: (member.membership_history && member.membership_history.length > 0) ? member.membership_history[0].discount || '0' : '0',
        
        // Extract physical metrics from physical_metrics array
        height_cm: (member.physical_metrics && member.physical_metrics.length > 0) ? member.physical_metrics[0].height_cm || '' : '',
        weight_kg: (member.physical_metrics && member.physical_metrics.length > 0) ? member.physical_metrics[0].weight_kg || '' : ''
      });
    }
  }, [member]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      id: member.id,
      ...formData
    });
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Edit Member</h2>
              <p className="text-gray-400 text-sm mt-1">
                ID: #{member.id?.toString().padStart(4, '0')}
              </p>
            </div>
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
            {/* Account Information - Read Only */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Email Address</p>
                    <p className="text-white font-medium mt-1">{member.email}</p>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                    Cannot be modified
                  </span>
                </div>
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
                        {plan.name} - ${plan.price}
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
                  name="amount_paid"
                  value={formData.amount_paid}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Discount (%)"
                  type="number"
                  step="0.01"
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
                  name="height_cm"
                  value={formData.height_cm}
                  onChange={handleInputChange}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.01"
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
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMemberModal;