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

            console.log('Login response:', userData);

            // Validate that we have all required user data
            if (!userData.user || !userData.user.id) {
                throw new Error('Respuesta de login inválida: falta ID de usuario');
            }

            if (!userData.user.email) {
                throw new Error('Respuesta de login inválida: falta email de usuario');
            }

            // Save user to localStorage - make sure to save all necessary data
            const userToSave = {
                user_id: userData.user.id,
                email: userData.user.email,
                name: userData.user.name
            };

            // Validate that we're saving a valid user_id
            if (!userToSave.user_id) {
                throw new Error('No se pudo obtener un ID válido del usuario');
            }

            localStorage.setItem('cognify_user', JSON.stringify(userToSave));
            this.currentUser = userToSave;

            // Trigger auth change event
            this.triggerAuthChange();

            return userData;
        } catch (error) {
            console.error('AuthService: Login error:', error);
            throw new Error(error.response?.data?.error || error.message || 'Error al iniciar sesión');
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
}