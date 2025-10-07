const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add auth token if exists
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Try to get error message from response
        const errorMessage = data.error || data.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyEmail(token) {
    return this.request(`/auth/verify-email/${token}`, {
      method: 'GET',
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Member endpoints
  async getMembers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/members/?${queryString}` : '/api/members/';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getMember(memberId) {
    return this.request(`/api/members/${memberId}`, {
      method: 'GET',
    });
  }

  async createMember(memberData) {
    return this.request('/api/members/', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateMember(memberId, memberData) {
    return this.request(`/api/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async deleteMember(memberId) {
    return this.request(`/api/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  async addPhysicalMetrics(memberId, metrics) {
    return this.request(`/api/members/${memberId}/metrics`, {
      method: 'POST',
      body: JSON.stringify(metrics),
    });
  }

  async getMembershipPlanNames() {
    return this.request('/api/members/membership-plans', {
      method: 'GET',
    });
  }

  async getAttendanceStats() {
    return this.request('/api/attendance/overall-stats', {
      method: 'GET',
    });
  }

  // Trainer endpoints
  async getTrainers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/trainers/?${queryString}` : '/api/trainers/';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getTrainer(trainerId) {
    return this.request(`/api/trainers/${trainerId}`, {
      method: 'GET',
    });
  }

  async createTrainer(trainerData) {
    return this.request('/api/trainers/', {
      method: 'POST',
      body: JSON.stringify(trainerData),
    });
  }

  async updateTrainer(trainerId, trainerData) {
    return this.request(`/api/trainers/${trainerId}`, {
      method: 'PUT',
      body: JSON.stringify(trainerData),
    });
  }

  async updateTrainerSalary(trainerId, salary) {
    return this.request(`/api/trainers/${trainerId}/salary`, {
      method: 'PUT',
      body: JSON.stringify({ salary }),
    });
  }

  async getTrainerSpecialties() {
    return this.request('/api/trainers/specialties', {
      method: 'GET',
    });
  }

  async getTrainerStats() {
    return this.request('/api/trainers/stats', {
      method: 'GET',
    });
  }

  // Membership Plan endpoints
  async getMembershipPlans() {
    return this.request('/api/memberships/plans', {
      method: 'GET',
    });
  }

  async createMembershipPlan(planData) {
    return this.request('/api/memberships/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updateMembershipPlan(planId, planData) {
    return this.request(`/api/memberships/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async deleteMembershipPlan(planId) {
    return this.request(`/api/memberships/plans/${planId}`, {
      method: 'DELETE',
    });
  }

  // Membership endpoints
  async getMemberships(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/memberships?${queryString}` : '/api/memberships';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async createMembership(membershipData) {
    return this.request('/api/memberships', {
      method: 'POST',
      body: JSON.stringify(membershipData),
    });
  }

  async updateMembership(membershipId, membershipData) {
    return this.request(`/api/memberships/${membershipId}`, {
      method: 'PUT',
      body: JSON.stringify(membershipData),
    });
  }

  async getMembershipStats() {
    return this.request('/api/memberships/stats', {
      method: 'GET',
    });
  }

  // Equipment endpoints
  async getEquipment(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/equipment?${queryString}` : '/api/equipment';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getEquipmentDetails(equipmentId) {
    return this.request(`/api/equipment/${equipmentId}`, {
      method: 'GET',
    });
  }

  async createEquipment(equipmentData) {
    return this.request('/api/equipment', {
      method: 'POST',
      body: JSON.stringify(equipmentData),
    });
  }

  async updateEquipment(equipmentId, equipmentData) {
    return this.request(`/api/equipment/${equipmentId}`, {
      method: 'PUT',
      body: JSON.stringify(equipmentData),
    });
  }

  async deleteEquipment(equipmentId) {
    return this.request(`/api/equipment/${equipmentId}`, {
      method: 'DELETE',
    });
  }

  async recordMaintenance(equipmentId, maintenanceData) {
    return this.request(`/api/equipment/${equipmentId}/maintenance`, {
      method: 'POST',
      body: JSON.stringify(maintenanceData),
    });
  }

  async getEquipmentCategories() {
    return this.request('/api/equipment/categories', {
      method: 'GET',
    });
  }

  async getEquipmentStats() {
    return this.request('/api/equipment/stats', {
      method: 'GET',
    });
  }

  // Attendance endpoints
  async getAttendanceRecords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/attendance?${queryString}` : '/api/attendance';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async checkIn(checkInData) {
    return this.request('/api/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(checkInData),
    });
  }

  async checkOut(checkOutData) {
    return this.request('/api/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify(checkOutData),
    });
  }

  async getCurrentAttendance() {
    return this.request('/api/attendance/current', {
      method: 'GET',
    });
  }

  async getAttendanceStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/attendance/stats?${queryString}` : '/api/attendance/stats';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getAttendanceReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/attendance/report?${queryString}` : '/api/attendance/report';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  // Payment endpoints
  async getPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/payments?${queryString}` : '/api/payments';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async createPayment(paymentData) {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentDetails(paymentId) {
    return this.request(`/api/payments/${paymentId}`, {
      method: 'GET',
    });
  }

  async getPaymentStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/payments/stats?${queryString}` : '/api/payments/stats';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getPaymentModes() {
    return this.request('/api/payments/modes', {
      method: 'GET',
    });
  }
}

export default new ApiService();