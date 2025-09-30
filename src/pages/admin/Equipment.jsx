import React, { useState } from 'react';
import { 
  Search, Plus, Filter, Download, Edit, Trash2, 
  Package, AlertTriangle, CheckCircle, Clock, 
  Wrench, Calendar, BarChart3, TrendingDown,
  Settings, Info, ArrowUp, ArrowDown
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';

const Equipment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // Sample equipment data
  const equipmentList = [
    {
      id: 1,
      name: 'Treadmill Pro X500',
      category: 'Cardio',
      brand: 'LifeFitness',
      model: 'X500',
      quantity: 8,
      available: 6,
      inUse: 2,
      status: 'operational',
      purchaseDate: '2023-06-15',
      warrantyExpiry: '2025-06-15',
      cost: '$3,500',
      location: 'Main Floor - Zone A',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10',
      maintenanceHistory: [
        { date: '2024-01-10', type: 'Routine', technician: 'John Tech', notes: 'Belt adjusted, lubrication done' },
        { date: '2023-12-10', type: 'Routine', technician: 'Mike Service', notes: 'Regular checkup' },
        { date: '2023-11-10', type: 'Repair', technician: 'John Tech', notes: 'Display unit replaced' }
      ],
      usageHours: 1250,
      condition: 'Excellent',
      qrCode: 'TRD001'
    },
    {
      id: 2,
      name: 'Olympic Barbell',
      category: 'Strength',
      brand: 'Rogue',
      model: 'Ohio Bar',
      quantity: 15,
      available: 12,
      inUse: 3,
      status: 'operational',
      purchaseDate: '2023-03-20',
      warrantyExpiry: '2028-03-20',
      cost: '$350',
      location: 'Weight Room - Rack Area',
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-03-05',
      maintenanceHistory: [
        { date: '2024-01-05', type: 'Inspection', technician: 'Sarah M.', notes: 'Checked for bend, cleaned and oiled' }
      ],
      usageHours: null,
      condition: 'Good',
      qrCode: 'BAR001'
    },
    {
      id: 3,
      name: 'Rowing Machine',
      category: 'Cardio',
      brand: 'Concept2',
      model: 'Model D',
      quantity: 5,
      available: 4,
      inUse: 0,
      status: 'maintenance',
      purchaseDate: '2022-11-10',
      warrantyExpiry: '2024-11-10',
      cost: '$1,200',
      location: 'Cardio Section - Row B',
      lastMaintenance: '2024-01-18',
      nextMaintenance: '2024-01-25',
      maintenanceHistory: [
        { date: '2024-01-18', type: 'Repair', technician: 'Tech Team', notes: 'Chain replacement in progress' }
      ],
      usageHours: 2100,
      condition: 'Under Maintenance',
      qrCode: 'ROW001'
    },
    {
      id: 4,
      name: 'Dumbbells Set',
      category: 'Strength',
      brand: 'PowerBlock',
      model: 'Elite Series',
      quantity: 20,
      available: 18,
      inUse: 2,
      status: 'operational',
      purchaseDate: '2023-01-15',
      warrantyExpiry: '2025-01-15',
      cost: '$150',
      location: 'Free Weights Area',
      lastMaintenance: '2023-12-20',
      nextMaintenance: '2024-02-20',
      maintenanceHistory: [
        { date: '2023-12-20', type: 'Routine', technician: 'Mike S.', notes: 'Inspection and cleaning' }
      ],
      usageHours: null,
      condition: 'Excellent',
      qrCode: 'DMB001'
    },
    {
      id: 5,
      name: 'Leg Press Machine',
      category: 'Strength',
      brand: 'Hammer Strength',
      model: 'Linear LP',
      quantity: 2,
      available: 1,
      inUse: 1,
      status: 'needs-attention',
      purchaseDate: '2022-08-20',
      warrantyExpiry: '2024-08-20',
      cost: '$4,200',
      location: 'Strength Training - Zone C',
      lastMaintenance: '2023-11-15',
      nextMaintenance: '2024-01-25',
      maintenanceHistory: [
        { date: '2023-11-15', type: 'Repair', technician: 'John Tech', notes: 'Cable adjustment needed soon' }
      ],
      usageHours: 3500,
      condition: 'Fair',
      qrCode: 'LEG001'
    }
  ];

  // Calculate statistics
  const stats = {
    total: equipmentList.length,
    operational: equipmentList.filter(e => e.status === 'operational').length,
    maintenance: equipmentList.filter(e => e.status === 'maintenance').length,
    needsAttention: equipmentList.filter(e => e.status === 'needs-attention').length,
    totalValue: '$250,000',
    utilizationRate: '78%'
  };

  const filteredEquipment = equipmentList.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || equipment.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesStatus = filterStatus === 'all' || equipment.status === filterStatus;
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

  const getConditionColor = (condition) => {
    switch(condition) {
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-blue-400';
      case 'Fair': return 'text-yellow-400';
      case 'Poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
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
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
              <option value="flexibility">Flexibility</option>
              <option value="accessories">Accessories</option>
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
          
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
              <Filter className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
              <Download className="h-5 w-5" />
            </button>
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
                <th className="p-4">Location</th>
                <th className="p-4">Condition</th>
                <th className="p-4">Next Maintenance</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.map((equipment) => (
                <tr key={equipment.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{equipment.name}</p>
                      <p className="text-gray-400 text-sm">{equipment.brand} - {equipment.model}</p>
                      <p className="text-gray-500 text-xs">ID: {equipment.qrCode}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">{equipment.category}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300 text-sm">{equipment.location}</span>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${getConditionColor(equipment.condition)}`}>
                      {equipment.condition}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="text-gray-300 text-sm">{equipment.nextMaintenance}</p>
                      {new Date(equipment.nextMaintenance) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                        <p className="text-xs text-yellow-400">Due soon</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.status)}`}>
                      {equipment.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="View Details"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setShowMaintenanceModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="Schedule Maintenance"
                      >
                        <Wrench className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Equipment</h2>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Equipment Name" placeholder="e.g., Treadmill Pro" required />
                <Input label="Brand" placeholder="e.g., LifeFitness" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Model" placeholder="e.g., X500" />
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Category <span className="text-yellow-400">*</span>
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400">
                    <option>Cardio</option>
                    <option>Strength</option>
                    <option>Flexibility</option>
                    <option>Accessories</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Input label="Quantity" type="number" placeholder="1" required />
                <Input label="Cost per Unit" placeholder="$0.00" required />
                <Input label="Purchase Date" type="date" required />
              </div>
              
              <Input label="Location" placeholder="e.g., Main Floor - Zone A" required />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Warranty Period (months)" type="number" placeholder="24" />
                <Input label="QR/Serial Code" placeholder="e.g., TRD001" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                  rows="3"
                  placeholder="Additional notes..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary">
                  Add Equipment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Schedule Maintenance
            </h2>
            <p className="text-gray-400 mb-6">Equipment: {selectedEquipment.name}</p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Maintenance Type <span className="text-yellow-400">*</span>
                </label>
                <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400">
                  <option>Routine Maintenance</option>
                  <option>Repair</option>
                  <option>Inspection</option>
                  <option>Deep Cleaning</option>
                </select>
              </div>
              
              <Input label="Scheduled Date" type="date" required />
              
              <Input label="Assigned Technician" placeholder="Enter technician name" />
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Priority
                </label>
                <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                  rows="3"
                  placeholder="Maintenance notes..."
                ></textarea>
              </div>

              {/* Maintenance History */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-3">Maintenance History</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedEquipment.maintenanceHistory.map((history, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium text-sm">{history.type}</p>
                          <p className="text-gray-400 text-xs">{history.date} - {history.technician}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-xs mt-1">{history.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowMaintenanceModal(false);
                    setSelectedEquipment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary">
                  Schedule Maintenance
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