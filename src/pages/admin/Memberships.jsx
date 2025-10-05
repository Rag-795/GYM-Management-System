import React, { useState } from 'react';
import { 
  CreditCard, Plus, Search, Filter, Edit, Trash2, 
  TrendingUp, Users, DollarSign, Calendar, Clock,
  CheckCircle, XCircle, AlertCircle, X, Save, Eye,
  MoreVertical, Download, BarChart3, Award
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';

const Memberships = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  // Form state for membership plan
  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    features: [],
    maxFreeze: '',
    guestPasses: '',
    priority: ''
  });

  // Sample membership plans
  const membershipPlans = [
    {
      id: 1,
      name: 'Basic',
      description: 'Perfect for beginners starting their fitness journey',
      price: 29,
      duration: 'monthly',
      features: [
        'Access to gym equipment',
        'Locker room access',
        'Free fitness assessment',
        'Mobile app access'
      ],
      activeMembers: 350,
      revenue: 10150,
      color: 'bg-gray-600',
      maxFreeze: 7,
      guestPasses: 0,
      status: 'active'
    },
    {
      id: 2,
      name: 'Premium',
      description: 'Most popular plan with unlimited group classes',
      price: 59,
      duration: 'monthly',
      features: [
        'Everything in Basic',
        'Unlimited group classes',
        '1 Personal training session/month',
        'Nutrition consultation',
        'Priority booking'
      ],
      activeMembers: 480,
      revenue: 28320,
      color: 'bg-yellow-400',
      maxFreeze: 14,
      guestPasses: 2,
      status: 'active',
      popular: true
    },
    {
      id: 3,
      name: 'Elite',
      description: 'Ultimate membership with exclusive benefits',
      price: 99,
      duration: 'monthly',
      features: [
        'Everything in Premium',
        '4 PT sessions/month',
        'Custom meal plans',
        'Recovery zone access',
        'Guest passes (2/month)',
        'Free merchandise'
      ],
      activeMembers: 104,
      revenue: 10296,
      color: 'bg-purple-600',
      maxFreeze: 30,
      guestPasses: 4,
      status: 'active'
    },
    {
      id: 4,
      name: 'Student',
      description: 'Discounted plan for students with valid ID',
      price: 19,
      duration: 'monthly',
      features: [
        'Access to gym equipment',
        'Locker room access',
        'Off-peak hours only',
        'Mobile app access'
      ],
      activeMembers: 180,
      revenue: 3420,
      color: 'bg-blue-600',
      maxFreeze: 0,
      guestPasses: 0,
      status: 'active'
    }
  ];

  // Sample active memberships
  const activeMemberships = [
    {
      id: 1,
      member: { 
        name: 'John Doe', 
        email: 'john@example.com', 
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        phone: '(555) 123-4567'
      },
      plan: 'Premium',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      status: 'active',
      paymentStatus: 'paid',
      autoRenew: true,
      amount: 59,
      remainingDays: 8
    },
    {
      id: 2,
      member: { 
        name: 'Sarah Smith', 
        email: 'sarah@example.com', 
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        phone: '(555) 234-5678'
      },
      plan: 'Basic',
      startDate: '2024-01-14',
      endDate: '2024-02-14',
      status: 'active',
      paymentStatus: 'paid',
      autoRenew: true,
      amount: 29,
      remainingDays: 7
    },
    {
      id: 3,
      member: { 
        name: 'Mike Johnson', 
        email: 'mike@example.com', 
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        phone: '(555) 345-6789'
      },
      plan: 'Elite',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      status: 'expiring',
      paymentStatus: 'pending',
      autoRenew: false,
      amount: 99,
      remainingDays: 3
    },
    {
      id: 4,
      member: { 
        name: 'Emily Davis', 
        email: 'emily@example.com', 
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        phone: '(555) 456-7890'
      },
      plan: 'Student',
      startDate: '2024-01-05',
      endDate: '2024-02-05',
      status: 'expired',
      paymentStatus: 'overdue',
      autoRenew: false,
      amount: 19,
      remainingDays: -2
    },
    {
      id: 5,
      member: { 
        name: 'Alex Wilson', 
        email: 'alex@example.com', 
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        phone: '(555) 567-8901'
      },
      plan: 'Premium',
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      status: 'active',
      paymentStatus: 'paid',
      autoRenew: true,
      amount: 59,
      remainingDays: 13
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlanFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    console.log('Adding plan:', planFormData);
    setShowAddPlanModal(false);
    resetForm();
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setPlanFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      duration: plan.duration,
      features: plan.features,
      maxFreeze: plan.maxFreeze.toString(),
      guestPasses: plan.guestPasses.toString(),
      priority: plan.popular ? 'high' : 'normal'
    });
    setShowEditPlanModal(true);
  };

  const handleViewMembership = (membership) => {
    setSelectedMembership(membership);
    setShowViewMembershipModal(true);
  };

  const resetForm = () => {
    setPlanFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      features: [],
      maxFreeze: '',
      guestPasses: '',
      priority: ''
    });
  };

  const filteredMemberships = activeMemberships.filter(membership => {
    const matchesSearch = membership.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         membership.member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || membership.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || membership.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalStats = {
    totalRevenue: membershipPlans.reduce((sum, plan) => sum + plan.revenue, 0),
    totalMembers: membershipPlans.reduce((sum, plan) => sum + plan.activeMembers, 0),
    avgRevenue: membershipPlans.reduce((sum, plan) => sum + plan.revenue, 0) / membershipPlans.length,
    activePlans: membershipPlans.filter(plan => plan.status === 'active').length
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Membership Management</h1>
          <p className="text-gray-400 mt-1">Manage membership plans and active subscriptions</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="secondary" icon={Download}>
            Export
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddPlanModal(true)}>
            Add Plan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${totalStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-400/20 p-2 rounded">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Members</p>
              <p className="text-2xl font-bold text-white">{totalStats.totalMembers}</p>
            </div>
            <div className="bg-blue-400/20 p-2 rounded">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
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
        </div>
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
          <button
            onClick={() => setActiveTab('memberships')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'memberships'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Active Memberships
          </button>
        </nav>
      </div>

      {/* Membership Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {membershipPlans.map((plan) => (
              <div key={plan.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 relative">
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                      POPULAR
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${plan.color} rounded-lg flex items-center justify-center`}>
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400 ml-1">/{plan.duration}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      {feature}
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <p className="text-sm text-gray-400">+{plan.features.length - 3} more features</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Active Members</p>
                    <p className="text-white font-bold">{plan.activeMembers}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Revenue</p>
                    <p className="text-white font-bold">${plan.revenue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditPlan(plan)}
                  >
                    Edit Plan
                  </Button>
                  <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4 hover:cursor-pointer" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Memberships Tab */}
      {activeTab === 'memberships' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
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
                  <option value="expiring">Expiring</option>
                  <option value="expired">Expired</option>
                </select>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="all">All Plans</option>
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Elite">Elite</option>
                  <option value="Student">Student</option>
                </select>
              </div>
            </div>
          </div>

          {/* Memberships Table */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="p-4">Member</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Start Date</th>
                    <th className="p-4">End Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Auto Renew</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMemberships.map((membership) => (
                    <tr key={membership.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4">                        
                        <div>
                          <p className="font-medium text-white">{membership.member.name}</p>
                          <p className="text-gray-400 text-sm">{membership.member.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-medium">
                          {membership.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-300">{membership.startDate}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-300">{membership.endDate}</p>
                        <p className="text-gray-500 text-xs">
                          {membership.remainingDays > 0 ? `${membership.remainingDays} days left` : 
                           membership.remainingDays === 0 ? 'Expires today' : 
                           `${Math.abs(membership.remainingDays)} days overdue`}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          membership.status === 'active' ? 'bg-green-400/20 text-green-400' :
                          membership.status === 'expiring' ? 'bg-yellow-400/20 text-yellow-400' :
                          'bg-red-400/20 text-red-400'
                        }`}>
                          {membership.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            membership.paymentStatus === 'paid' ? 'bg-green-400/20 text-green-400' :
                            membership.paymentStatus === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                            'bg-red-400/20 text-red-400'
                          }`}>
                            {membership.paymentStatus}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">${membership.amount}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center mx-6">
                          {membership.autoRenew ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-400 hover:text-yellow-400 transition-colors">
                            <Edit className="h-4 w-4 cursor-pointer" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 className="h-4 w-4 cursor-pointer" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
                      Duration <span className="text-yellow-400">*</span>
                    </label>
                    <select
                      name="duration"
                      value={planFormData.duration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                      required
                    >
                      <option value="">Select Duration</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
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
    </div>
  );
};

export default Memberships;