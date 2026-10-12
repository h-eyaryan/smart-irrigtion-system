/**
 * AquaSmart IoT - User Authentication & Session Management
 * Handles Registration, Login, Session Persistence, User Profile,
 * and Role-Based Access Control (Farmer, Technician, Admin).
 */

(function () {
  'use strict';

  const USERS_STORAGE_KEY = 'aqua_smart_users_v2';
  const CURRENT_USER_KEY = 'aqua_smart_active_user_v2';

  // Seeded Demo Accounts for Farmer, Technician, and Admin roles
  const DEFAULT_USERS = [
    {
      id: 'user_farmer_101',
      fullName: 'Farmer John Miller',
      email: 'demo@farm.com',
      passwordHash: btoa('farm123'),
      role: 'farmer',
      farmName: 'Greenfield Eco Farm',
      location: 'Central Valley, California',
      cropType: 'Tomatoes & Sweet Peppers',
      soilType: 'Loam Soil',
      irrigationType: 'Precision Drip System',
      fieldSize: '15.5 Acres',
      zonesCount: 4,
      status: 'Active',
      createdAt: '2026-01-15T08:00:00Z',
      avatar: '👨‍🌾'
    },
    {
      id: 'user_tech_202',
      fullName: 'Alex Vance',
      email: 'tech@farm.com',
      passwordHash: btoa('tech123'),
      role: 'technician',
      title: 'Lead IoT Systems Specialist',
      assignedHubs: 'Hub 01, Hub 04, Node-Gateway-A',
      location: 'Field Engineering District 3',
      specialty: 'Telemetry Calibration & Solenoid Actuators',
      certifications: 'Cisco IoT, IEEE Embedded Systems',
      status: 'Active',
      createdAt: '2026-02-10T11:00:00Z',
      avatar: '🔧'
    },
    {
      id: 'user_admin_303',
      fullName: 'Sarah Connor',
      email: 'admin@farm.com',
      passwordHash: btoa('admin123'),
      role: 'admin',
      title: 'Chief Operations & Network Director',
      location: 'Headquarters Operations Center',
      permissions: 'Full Superadmin (Root)',
      status: 'Active',
      createdAt: '2026-01-01T09:00:00Z',
      avatar: '👑'
    },
    {
      id: 'user_farmer_102',
      fullName: 'William Davis',
      email: 'william@vineyard.com',
      passwordHash: btoa('farm123'),
      role: 'farmer',
      farmName: 'Golden Valley Vineyards',
      location: 'Napa County, California',
      cropType: 'Pinot Noir & Chardonnay Grapes',
      soilType: 'Gravelly Loam',
      irrigationType: 'Subsurface Drip Lines',
      fieldSize: '42.0 Acres',
      zonesCount: 6,
      status: 'Active',
      createdAt: '2026-03-02T14:30:00Z',
      avatar: '🍇'
    },
    {
      id: 'user_farmer_103',
      fullName: 'Elena Rostova',
      email: 'elena@orchards.com',
      passwordHash: btoa('farm123'),
      role: 'farmer',
      farmName: 'Cascade Ridge Orchards',
      location: 'Hood River, Oregon',
      cropType: 'Apples & Sweet Cherries',
      soilType: 'Volcanic Sandy Loam',
      irrigationType: 'Micro-Sprinklers',
      fieldSize: '28.0 Acres',
      zonesCount: 5,
      status: 'Active',
      createdAt: '2026-03-14T10:15:00Z',
      avatar: '🍎'
    }
  ];

  class AuthService {
    constructor() {
      this.initStorage();
    }

    initStorage() {
      // Seed demo users into localStorage if not already present
      if (!localStorage.getItem(USERS_STORAGE_KEY)) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      }
      // NOTE: Do NOT auto-login any user here.
      // The app always starts on the login page unless the user
      // previously checked "Remember me" (which saves CURRENT_USER_KEY).
    }

    getAllUsers() {
      try {
        const data = localStorage.getItem(USERS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.error('Failed to parse users storage:', e);
        return [];
      }
    }

    saveUsers(users) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    getCurrentUser() {
      try {
        const saved = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY);
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        console.error('Failed to get current user:', e);
        return null;
      }
    }

    isLoggedIn() {
      return this.getCurrentUser() !== null;
    }

    getUserRole() {
      const user = this.getCurrentUser();
      return user ? user.role : null;
    }

    isAdmin() {
      const user = this.getCurrentUser();
      return user && user.role === 'admin';
    }

    isTechnician() {
      const user = this.getCurrentUser();
      return user && (user.role === 'technician' || user.role === 'admin');
    }

    register(userData) {
      const { fullName, email, password, role, farmName, location, cropType, soilType, irrigationType, fieldSize } = userData;

      if (!fullName || !email || !password) {
        return { success: false, message: 'Please fill in all required fields (Name, Email, Password).' };
      }

      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
      }

      const users = this.getAllUsers();
      const normalizedEmail = email.trim().toLowerCase();

      if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
        return { success: false, message: 'An account with this email already exists. Please log in.' };
      }

      const assignedRole = role || 'farmer';
      let avatarIcon = '👨‍🌾';
      if (assignedRole === 'technician') avatarIcon = '🔧';
      if (assignedRole === 'admin') avatarIcon = '👑';

      const newUser = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash: btoa(password),
        role: assignedRole,
        farmName: farmName ? farmName.trim() : (assignedRole === 'farmer' ? 'My Smart Farm' : 'IoT Operations Network'),
        location: location ? location.trim() : 'Central Region',
        cropType: cropType || (assignedRole === 'farmer' ? 'Mixed Crops' : 'N/A (Technical/Admin)'),
        soilType: soilType || 'Loam Soil',
        irrigationType: irrigationType || 'Drip Irrigation',
        fieldSize: fieldSize || '10 Acres',
        zonesCount: 4,
        status: 'Active',
        createdAt: new Date().toISOString(),
        avatar: avatarIcon
      };

      users.push(newUser);
      this.saveUsers(users);

      this.setCurrentUser(newUser, true);

      return {
        success: true,
        message: `Account created successfully! Welcome, ${newUser.fullName}.`,
        user: newUser
      };
    }

    login(email, password, rememberMe = true) {
      if (!email || !password) {
        return { success: false, message: 'Please provide both email and password.' };
      }

      const normalizedEmail = email.trim().toLowerCase();
      const users = this.getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

      if (!user) {
        return { success: false, message: 'No registered user found with this email.' };
      }

      if (user.passwordHash !== btoa(password)) {
        return { success: false, message: 'Invalid password. Please try again.' };
      }

      this.setCurrentUser(user, rememberMe);

      return {
        success: true,
        message: `Welcome back, ${user.fullName} (${user.role.toUpperCase()})!`,
        user: user
      };
    }

    setCurrentUser(user, rememberMe = true) {
      const sanitized = { ...user };
      delete sanitized.passwordHash;

      const serialized = JSON.stringify(sanitized);
      if (rememberMe) {
        localStorage.setItem(CURRENT_USER_KEY, serialized);
        sessionStorage.removeItem(CURRENT_USER_KEY);
      } else {
        sessionStorage.setItem(CURRENT_USER_KEY, serialized);
        localStorage.removeItem(CURRENT_USER_KEY);
      }

      // Mark that this session was set by an explicit user login action
      localStorage.setItem('aqua_smart_explicit_login', '1');

      window.dispatchEvent(new CustomEvent('aqua:auth-change', { detail: { user: sanitized } }));
    }

    logout() {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem('aqua_smart_explicit_login');
      sessionStorage.removeItem(CURRENT_USER_KEY);
      window.dispatchEvent(new CustomEvent('aqua:auth-change', { detail: { user: null } }));
      return { success: true, message: 'Logged out successfully.' };
    }

    updateProfile(updatedFields) {
      const current = this.getCurrentUser();
      if (!current) return { success: false, message: 'Not logged in.' };

      const users = this.getAllUsers();
      const index = users.findIndex(u => u.id === current.id);
      if (index === -1) return { success: false, message: 'User not found in registry.' };

      const updatedUser = { ...users[index], ...updatedFields };
      if (updatedFields.newPassword && updatedFields.newPassword.length >= 6) {
        updatedUser.passwordHash = btoa(updatedFields.newPassword);
        delete updatedFields.newPassword;
      }

      users[index] = updatedUser;
      this.saveUsers(users);
      this.setCurrentUser(updatedUser, true);

      return { success: true, message: 'Profile updated successfully.', user: updatedUser };
    }

    // Admin User Management Methods
    deleteUser(userId) {
      const current = this.getCurrentUser();
      if (!current || current.role !== 'admin') {
        return { success: false, message: 'Unauthorized. Admin permissions required.' };
      }

      let users = this.getAllUsers();
      if (userId === current.id) {
        return { success: false, message: 'Cannot delete your own active admin account.' };
      }

      users = users.filter(u => u.id !== userId);
      this.saveUsers(users);
      return { success: true, message: 'User removed from network successfully.' };
    }

    toggleUserStatus(userId) {
      const current = this.getCurrentUser();
      if (!current || current.role !== 'admin') {
        return { success: false, message: 'Unauthorized. Admin permissions required.' };
      }

      const users = this.getAllUsers();
      const target = users.find(u => u.id === userId);
      if (!target) return { success: false, message: 'User not found.' };

      target.status = target.status === 'Active' ? 'Suspended' : 'Active';
      this.saveUsers(users);
      return { success: true, message: `User status changed to ${target.status}.`, newStatus: target.status };
    }

    changeUserRole(userId, newRole) {
      const current = this.getCurrentUser();
      if (!current || current.role !== 'admin') {
        return { success: false, message: 'Unauthorized. Admin permissions required.' };
      }

      const users = this.getAllUsers();
      const target = users.find(u => u.id === userId);
      if (!target) return { success: false, message: 'User not found.' };

      target.role = newRole;
      this.saveUsers(users);
      return { success: true, message: `Role updated to ${newRole}.` };
    }
  }

  window.AuthService = new AuthService();
})();
