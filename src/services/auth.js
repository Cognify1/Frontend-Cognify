// Authentication service
import {ApiService} from './api.js';
import Swal from "sweetalert2";

export class AuthService {
    constructor() {
        this.apiService = new ApiService();
        this.currentUser = this.getCurrentUser();
    }

    // Get the current user from localStorage
    getCurrentUser() {
        try {
            const user = localStorage.getItem('cognify_user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Check if the user is authenticated
    isAuthenticated() {
        return !!this.getCurrentUser();
    }

    // Login user
    async login(credentials) {
        try {
            const response = await this.apiService.post('/auth/login', credentials);
            const userData = response.data;

            // Save user to localStorage
            localStorage.setItem('cognify_user', JSON.stringify(userData.user));
            this.currentUser = userData.user;

            // Trigger auth change event
            this.triggerAuthChange();

            return userData;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
        }
    }

    // Register new user
    async register(userData) {
        try {
            const response = await this.apiService.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Error en el registro');
        }
    }

    // Logout user
    async logout() {
        try {
            // Clear localStorage
            localStorage.removeItem('cognify_user');
            this.currentUser = null;

            // Trigger auth change event
            this.triggerAuthChange();

            // Show a logout message
            await Swal.fire({
                title: 'Sesión cerrada',
                text: 'Has cerrado sesión exitosamente.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Trigger authentication state change event
    triggerAuthChange() {
        window.dispatchEvent(new CustomEvent('auth-changed', {
            detail: {user: this.currentUser}
        }));
    }

    // Get user role
    getUserRole() {
        return this.currentUser?.role || null;
    }

    // Check if a user has a specific role
    hasRole(role) {
        return this.getUserRole() === role;
    }
}