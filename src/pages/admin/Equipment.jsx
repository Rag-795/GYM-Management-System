import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, Download, Edit, Trash2, 
  Package, AlertTriangle, CheckCircle, Clock, 
  Wrench, Calendar, BarChart3, TrendingDown,
  Settings, Info, ArrowUp, ArrowDown
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import apiService from '../../services/api';

const Equipment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    operational: 0,
    maintenance: 0,
    needsAttention: 0,
    totalValue: '$0',
    utilizationRate: '0%'
  });

  // Add equipment form state
  const [addForm, setAddForm] = useState({
    name: '',
    category: '',
    quantity: 1,
    purchase_date: '',
    last_maintenance_date: '',
    next_maintenance_date: ''
  });

  // Fetch equipment data on component mount
  useEffect(() => {
    fetchEquipment();
    fetchCategories();
    fetchStats();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEquipment({
        search: searchTerm,
        category: filterCategory !== 'all' ? filterCategory : '',
        page: 1,
        limit: 100
      });
      
      // Handle both array and object response formats
      const equipmentData = response.equipment || response || [];
      setEquipmentList(Array.isArray(equipmentData) ? equipmentData : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Failed to load equipment data');
      setEquipmentList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getEquipmentCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getEquipmentStats();
      if (response.stats) {
        setStats(response.stats);
      } else {
        // Calculate stats from equipmentList if API doesn't provide them
        calculateStatsFromEquipment();
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to calculating from current equipment list
      calculateStatsFromEquipment();
    }
  };

  const calculateStatsFromEquipment = () => {
    const operational = equipmentList.filter(e => getStatusFromMaintenance(e) === 'operational').length;
    const maintenance = equipmentList.filter(e => getStatusFromMaintenance(e) === 'maintenance').length;
    const needsAttention = equipmentList.filter(e => getStatusFromMaintenance(e) === 'needs-attention').length;
    
    setStats({
      total: equipmentList.length,
      operational,
      maintenance,
      needsAttention,
      totalValue: '$0', // Would need cost data from backend
      utilizationRate: '0%' // Would need usage data from backend
    });
  };

  // Recalculate stats when equipment list changes
  useEffect(() => {
    if (equipmentList.length > 0) {
      calculateStatsFromEquipment();
    }
  }, [equipmentList]);

  // Refetch equipment when filters change (with debouncing for search)
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(() => {
        fetchEquipment();
      }, searchTerm ? 500 : 0); // 500ms debounce for search, immediate for filters

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, filterCategory, filterStatus]);

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      const equipmentData = {
        name: addForm.name,
        category: addForm.category,
        quantity: parseInt(addForm.quantity),
        purchase_date: addForm.purchase_date || null,
        last_maintenance_date: addForm.last_maintenance_date || null,
        next_maintenance_date: addForm.next_maintenance_date || null
      };

      await apiService.createEquipment(equipmentData);
      setShowAddModal(false);
      setAddForm({
        name: '',
        category: '',
        quantity: 1,
        purchase_date: '',
        last_maintenance_date: '',
        next_maintenance_date: ''
      });
      fetchEquipment(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error adding equipment:', error);
      setError('Failed to add equipment: ' + error.message);
    }
  };

  const handleDeleteEquipment = async (equipmentId, equipmentName) => {
    if (window.confirm(`Are you sure you want to delete "${equipmentName}"?`)) {
      try {
        await apiService.deleteEquipment(equipmentId);
        fetchEquipment(); // Refresh the list
        fetchStats(); // Refresh stats
      } catch (error) {
        console.error('Error deleting equipment:', error);
        setError('Failed to delete equipment: ' + error.message);
      }
    }
  };

  const handleFormChange = (field, value) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper functions to determine maintenance status based on backend data
  const getMaintenanceStatus = (equipment) => {
    if (!equipment.next_maintenance_date) return 'unknown';
    
    const today = new Date();
    const nextDate = new Date(equipment.next_maintenance_date);
    const daysDiff = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'overdue';
    if (daysDiff <= 7) return 'due-soon';
    if (daysDiff <= 30) return 'due-this-month';
    return 'good';
  };

  const getStatusFromMaintenance = (equipment) => {
    const maintenanceStatus = getMaintenanceStatus(equipment);
    switch(maintenanceStatus) {
      case 'overdue': return 'needs-attention';
      case 'due-soon': return 'maintenance';
      default: return 'operational';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredEquipment = equipmentList.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || equipment.category.toLowerCase() === filterCategory.toLowerCase();
    
    // Apply status filter based on maintenance status
    let matchesStatus = true;
    if (filterStatus !== 'all') {
      const equipmentStatus = getStatusFromMaintenance(equipment);
      matchesStatus = equipmentStatus === filterStatus;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'operational': return 'bg-green-400/20 text-green-400';
      case 'maintenance': return 'bg-yellow-400/20 text-yellow-400';
      case 'needs-attention': return 'bg-orange-400/20 text-orange-400';
      case 'out-of-service': return 'bg-red-400/20 text-red-400';
      default: return 'bg-gray-400/20 text-gray-400';
    }
  };

  const getConditionColor = (maintenanceStatus) => {
    switch(maintenanceStatus) {
      case 'good': return 'text-green-400';
      case 'due-this-month': return 'text-blue-400';
      case 'due-soon': return 'text-yellow-400';
      case 'overdue': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading equipment...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Equipment Management</h1>
          <p className="text-gray-400 mt-1">Track and maintain gym equipment inventory</p>
        </div>
        <Button 
          variant="primary" 
          icon={Plus}
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0"
        >
          Add Equipment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Package className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-gray-400 text-sm">Total Equipment</p>
        </div>
        
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.operational}</span>
          </div>
          <p className="text-gray-400 text-sm">Operational</p>
        </div>
        
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Wrench className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats.maintenance}</span>
          </div>
          <p className="text-gray-400 text-sm">In Maintenance</p>
        </div>
        
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-8 w-8 text-orange-400" />
            <span className="text-2xl font-bold text-white">{stats.needsAttention}</span>
          </div>
          <p className="text-gray-400 text-sm">Needs Attention</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.totalValue}</span>
          </div>
          <p className="text-gray-400 text-sm">Total Value</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">{stats.utilizationRate}</span>
          </div>
          <p className="text-gray-400 text-sm">Utilization Rate</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.name} value={category.name.toLowerCase()}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="all">All Status</option>
              <option value="operational">Operational</option>
              <option value="maintenance">In Maintenance</option>
              <option value="needs-attention">Needs Attention</option>
              <option value="out-of-service">Out of Service</option>
            </select>
          </div>
          
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr className="text-left text-gray-400 text-sm">
                <th className="p-4">Equipment</th>
                <th className="p-4">Category</th>
                <th className="p-4">Purchase Date</th>
                <th className="p-4">Condition</th>
                <th className="p-4">Next Maintenance</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Package className="h-12 w-12 text-gray-500" />
                      <p className="text-gray-400">No equipment found</p>
                      {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' ? (
                        <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                      ) : (
                        <p className="text-gray-500 text-sm">Start by adding some equipment</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
              filteredEquipment.map((equipment) => {
                const maintenanceStatus = getMaintenanceStatus(equipment);
                const equipmentStatus = getStatusFromMaintenance(equipment);
                
                return (
                <tr key={equipment.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{equipment.name}</p>
                      <p className="text-gray-400 text-sm">Qty: {equipment.quantity}</p>
                      <p className="text-gray-500 text-xs">ID: {equipment.id.slice(0, 8)}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">{equipment.category}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300 text-sm">
                      {equipment.purchase_date ? formatDate(equipment.purchase_date) : 'Not set'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${getConditionColor(maintenanceStatus)}`}>
                      {maintenanceStatus === 'good' ? 'Good' :
                       maintenanceStatus === 'due-this-month' ? 'Due This Month' :
                       maintenanceStatus === 'due-soon' ? 'Due Soon' :
                       maintenanceStatus === 'overdue' ? 'Overdue' : 'Unknown'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="text-gray-300 text-sm">{formatDate(equipment.next_maintenance_date)}</p>
                      {maintenanceStatus === 'due-soon' && (
                        <p className="text-xs text-yellow-400">Due soon</p>
                      )}
                      {maintenanceStatus === 'overdue' && (
                        <p className="text-xs text-red-400">Overdue</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(equipmentStatus)}`}>
                      {equipmentStatus.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                        onClick={() => handleDeleteEquipment(equipment.id, equipment.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Equipment</h2>
            
            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Equipment Name" 
                  placeholder="e.g., Treadmill Pro" 
                  value={addForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required 
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Category <span className="text-yellow-400">*</span>
                  </label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    value={addForm.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Input 
                  label="Quantity" 
                  type="number" 
                  placeholder="1" 
                  value={addForm.quantity}
                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                  required 
                />
                <Input 
                  label="Purchase Date" 
                  type="date" 
                  value={addForm.purchase_date}
                  onChange={(e) => handleFormChange('purchase_date', e.target.value)}
                />
                <Input 
                  label="Last Maintenance" 
                  type="date" 
                  value={addForm.last_maintenance_date}
                  onChange={(e) => handleFormChange('last_maintenance_date', e.target.value)}
                />
              </div>
              
              <Input 
                label="Next Maintenance Date" 
                type="date" 
                value={addForm.next_maintenance_date}
                onChange={(e) => handleFormChange('next_maintenance_date', e.target.value)}
              />
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Add Equipment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Equipment;