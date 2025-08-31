// Register page component
import {AuthService} from '../services/auth.js';
import {ValidationUtils} from '../utils/validation.js';
import Swal from "sweetalert2";

export class RegisterPage {
    constructor() {
        this.container = document.getElementById('main-content');
        this.authService = new AuthService();
    }

    render() {
        this.container.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-cyan-600 via-sky-400 to-green-500 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div class="sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="text-center">
                        <img src="/Frontend-Cognify/images/logo.png" alt="Cognify Logo" class="mx-auto h-12 w-12 rounded-full">
                        <h2 class="mt-6 text-3xl font-bold text-white">Crea tu cuenta</h2>
                        <p class="mt-2 text-sm text-white">
                            ¿Ya tienes una cuenta?
                            <a href="#/login" class="font-medium text-cyan-800 hover:text-cyan-600">
                                Inicia sesión aquí
                            </a>
                        </p>
                    </div>
                </div>

                <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form id="register-form" class="space-y-6">
                            <!-- Name Field -->
                            <div>
                                <label for="name" class="block text-sm font-medium text-gray-700">
                                    Nombre completo
                                </label>
                                <div class="mt-1 relative">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autocomplete="name"
                                        required
                                        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                        placeholder="Ingresa tu nombre completo"
                                    >
                                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <i class="fa-solid fa-user text-gray-400"></i>
                                    </div>
                                </div>
                                <div id="name-error" class="text-red-600 text-sm mt-1 hidden"></div>
                            </div>

                            <!-- Email Field -->
                            <div>
                                <label for="email" class="block text-sm font-medium text-gray-700">
                                    Correo electrónico
                                </label>
                                <div class="mt-1 relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autocomplete="email"
                                        required
                                        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                        placeholder="Ingresa tu correo electrónico"
                                    >
                                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <i class="fa-solid fa-envelope text-gray-400"></i>
                                    </div>
                                </div>
                                <div id="email-error" class="text-red-600 text-sm mt-1 hidden"></div>
                            </div>

                            <!-- Password Field -->
                            <div>
                                <label for="password" class="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <div class="mt-1 relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autocomplete="new-password"
                                        required
                                        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                        placeholder="Crea una contraseña"
                                    >
                                    <button
                                        type="button"
                                        id="toggle-password"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <i class="fa-solid fa-eye text-gray-400"></i>
                                    </button>
                                </div>
                                <div id="password-error" class="text-red-600 text-sm mt-1 hidden"></div>
                                <div class="text-xs text-gray-500 mt-1">
                                    La contraseña debe tener al menos seis caracteres
                                </div>
                            </div>

                            <!-- Confirm Password Field -->
                            <div>
                                <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                                    Confirmar contraseña
                                </label>
                                <div class="mt-1 relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autocomplete="new-password"
                                        required
                                        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                        placeholder="Confirma tu contraseña"
                                    >
                                    <button
                                        type="button"
                                        id="toggle-confirm-password"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <i class="fa-solid fa-eye text-gray-400"></i>
                                    </button>
                                </div>
                                <div id="confirm-password-error" class="text-red-600 text-sm mt-1 hidden"></div>
                            </div>

                            <!-- Submit Button -->
                            <div>
                                <button
                                    type="submit"
                                    id="register-button"
                                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-200"
                                >
                                    <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <i class="fa-solid fa-user-plus text-white group-hover:text-cyan-200"></i>
                                    </span>
                                    Crear cuenta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const form = document.getElementById('register-form');
        const togglePassword = document.getElementById('toggle-password');
        const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        // Form submission
        form.addEventListener('submit', this.handleSubmit.bind(this));

        // Toggle password visibility
        togglePassword.addEventListener('click', () => {
            this.togglePasswordVisibility(passwordInput, togglePassword);
        });

        toggleConfirmPassword.addEventListener('click', () => {
            this.togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword);
        });

        // Real-time validation
        document.getElementById('name').addEventListener('blur', this.validateName.bind(this));
        document.getElementById('email').addEventListener('blur', this.validateEmail.bind(this));
        document.getElementById('password').addEventListener('blur', this.validatePassword.bind(this));
        document.getElementById('confirmPassword').addEventListener('blur', this.validateConfirmPassword.bind(this));
    }

    togglePasswordVisibility(input, button) {
        input.type = input.type === 'password' ? 'text' : 'password';

        const icon = button.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }

    validateName() {
        const name = document.getElementById('name').value.trim();
        const errorElement = document.getElementById('name-error');

        if (name.length < 2) {
            errorElement.textContent = 'El nombre debe tener al menos 2 caracteres';
            errorElement.classList.remove('hidden');
            return false;
        }

        errorElement.classList.add('hidden');
        return true;
    }

    validateEmail() {
        const email = document.getElementById('email').value;
        const errorElement = document.getElementById('email-error');

        if (!ValidationUtils.isValidEmail(email)) {
            errorElement.textContent = 'Por favor ingresa un correo electrónico válido';
            errorElement.classList.remove('hidden');
            return false;
        }

        errorElement.classList.add('hidden');
        return true;
    }

    validatePassword() {
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('password-error');

        if (!ValidationUtils.isValidPassword(password)) {
            errorElement.textContent = 'La contraseña debe tener al menos 6 caracteres';
            errorElement.classList.remove('hidden');
            return false;
        }

        errorElement.classList.add('hidden');
        return true;
    }

    validateConfirmPassword() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorElement = document.getElementById('confirm-password-error');

        if (password !== confirmPassword) {
            errorElement.textContent = 'Las contraseñas no coinciden';
            errorElement.classList.remove('hidden');
            return false;
        }

        errorElement.classList.add('hidden');
        return true;
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate all fields
        const isNameValid = this.validateName();
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        const isConfirmPasswordValid = this.validateConfirmPassword();

        if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            return;
        }

        const formData = new FormData(e.target);
        const registerData = {
            name: formData.get('name').trim(),
            email: formData.get('email'),
            password: formData.get('password')
        };

        const button = document.getElementById('register-button');
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Creando cuenta...';

        try {
            await this.authService.register(registerData);

            // Show a success message
            Swal.fire({
                title: '¡Éxito!',
                text: '¡Cuenta creada con éxito! Por favor inicia sesión.',
                icon: 'success',
                confirmButtonText: 'Ir al login'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.hash = '/login';
                }
            });

        } catch (error) {
            console.error('Registration error:', error);

            await Swal.fire({
                title: 'Registro fallido',
                text: error.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            button.disabled = false;
            button.innerHTML = `
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                    <i class="fa-solid fa-user-plus text-cyan-500 group-hover:text-cyan-400"></i>
                </span>
                Crear cuenta
            `;
        }
    }
}