// Login Component
import {AuthService} from '../services/auth.js';
import {ValidationUtils} from '../utils/validation.js';
import Swal from "sweetalert2";

export class LoginPage {
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
                        <h2 class="mt-6 text-3xl font-bold text-white">Inicia sesión en tu cuenta</h2>
                        <p class="mt-2 text-sm text-white">
                            ¿No tienes una cuenta?
                            <a href="#/register" class="font-medium text-cyan-800 hover:text-cyan-600">
                                Regístrate aquí
                            </a>
                        </p>
                    </div>
                </div>

                <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form id="login-form" class="space-y-6">
                            <!-- Email -->
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
                                        placeholder="Ingresa tu correo"
                                    >
                                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <i class="fa-solid fa-envelope text-gray-400"></i>
                                    </div>
                                </div>
                                <div id="email-error" class="text-red-600 text-sm mt-1 hidden"></div>
                            </div>

                            <!-- Password -->
                            <div>
                                <label for="password" class="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <div class="mt-1 relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autocomplete="current-password"
                                        required
                                        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                        placeholder="Ingresa tu contraseña"
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
                            </div>

                            <!-- Submit -->
                            <div>
                                <button
                                    type="submit"
                                    id="login-button"
                                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-200"
                                >
                                    <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <i class="fa-solid fa-sign-in-alt text-white group-hover:text-cyan-200"></i>
                                    </span>
                                    Ingresar
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
        const form = document.getElementById('login-form');
        const togglePassword = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password');

        // Send form
        form.addEventListener('submit', this.handleSubmit.bind(this));

        // Show/hide password
        togglePassword.addEventListener('click', () => {
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';

            const icon = togglePassword.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });

        // Validation
        document.getElementById('email').addEventListener('blur', this.validateEmail.bind(this));
        document.getElementById('password').addEventListener('blur', this.validatePassword.bind(this));
    }

    validateEmail() {
        const email = document.getElementById('email').value;
        const errorElement = document.getElementById('email-error');

        if (!ValidationUtils.isValidEmail(email)) {
            errorElement.textContent = 'Por favor ingresa un correo válido';
            errorElement.classList.remove('hidden');
            return false;
        }

        errorElement.classList.add('hidden');
        return true;
    }

    validatePassword() {
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('password-error');

        if (password.length < 6) {
            errorElement.textContent = 'La contraseña debe tener al menos 6 caracteres';
            errorElement.classList.remove('hidden');
            return false;
        }

        errorElement.classList.add('hidden');
        return true;
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate form
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        const button = document.getElementById('login-button');
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Ingresando...';

        try {
            await this.authService.login(loginData);

            // Success message
            await Swal.fire({
                title: '¡Éxito!',
                text: '¡Logueado exitosamente!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            // Redirect to home after a short delay
            setTimeout(() => {
                window.location.hash = '/';
            }, 1500);

        } catch (error) {
            console.error('Error en login:', error);

            await Swal.fire({
                title: 'Error de inicio de sesión',
                text: error.message || 'Credenciales inválidas. Inténtalo nuevamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        } finally {
            button.disabled = false;
            button.innerHTML = `
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                    <i class="fa-solid fa-sign-in-alt text-cyan-500 group-hover:text-cyan-400"></i>
                </span>
                Ingresar
            `;
        }
    }
}