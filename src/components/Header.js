// Header component with a navigation and burger menu
import {AuthService} from '../services/auth.js';

export class HeaderComponent {
    constructor() {
        this.authService = new AuthService();
        this.container = document.getElementById('header-container');
        this.isMobileMenuOpen = false;
        // Store bound methods to allow proper removal
        this.boundKeydownHandler = this.handleKeydown.bind(this);
        this.boundResizeHandler = this.handleResize.bind(this);
    }

    render() {
        // Clean up existing event listeners before re-rendering
        this.removeEventListeners();
        
        const user = this.authService.getCurrentUser();
        const isLoggedIn = !!user;

        this.container.innerHTML = `
            <header class="fixed w-full bg-white shadow-lg border-b border-gray-200 rounded-bl-3xl rounded-br-3xl z-10">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center h-20">
                        <!-- Logo -->
                        <div class="flex items-center">
                            <a href="#/" class="flex items-center space-x-2">
                                <img src="/images/logo.png" alt="Cognify Logo" class="w-16 rounded-full">
                                <span class="text-2xl font-bold text-gradient-green">Cognify</span>
                            </a>
                        </div>

                        <!-- Desktop Navigation -->
                        <div class="desktop-only xl:flex items-center space-x-8">
                            ${isLoggedIn ? this.renderAuthenticatedNav() : this.renderGuestNav()}
                        </div>
                        
                        ${isLoggedIn ? `<div class="desktop-only xl:flex items-center space-x-8">
                                <div class="flex items-center space-x-4 ml-8">
                                    <span class="text-gray-700 font-semibold text-md">Bienvenido, ${this.authService.getCurrentUser()?.name || 'Usuario'}</span>
                                    <button id="logout-btn" class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-md font-semibold transition-colors duration-200">
                                        <i class="fa-solid fa-sign-out-alt mr-2"></i>Cerrar sesión
                                    </button>
                                </div>
                            </div>` : ''}

                        <!-- Mobile menu button -->
                        <div class="mobile-only">
                            <button id="mobile-menu-btn" class="inline-flex items-center justify-center p-2 rounded-md text-cyan-700 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 transition-colors duration-200">
                                <span class="sr-only">Abrir menú principal</span>
                                <!-- Hamburger icon -->
                                <svg id="hamburger-icon" class="block h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <!-- Close icon -->
                                <svg id="close-icon" class="hidden h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Mobile menu overlay -->
                <div id="mobile-menu-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden xl:hidden">
                </div>

                <!-- Mobile menu -->
                <div id="mobile-menu" class="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl z-50 transform translate-x-full transition-transform duration-300 ease-in-out xl:hidden">
                    <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                        <div class="flex items-center space-x-2">
                            <img src="/images/logo.png" alt="Cognify Logo" class="w-8 rounded-full">
                            <span class="text-xl font-bold text-gradient-green">Cognify</span>
                        </div>
                        <button id="close-mobile-menu" class="p-2 rounded-md text-cyan-700 hover:text-gray-500 hover:bg-gray-100">
                            <svg class="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div class="px-4 py-6 space-y-1">
                        ${isLoggedIn ? this.renderMobileAuthenticatedMenu(user) : this.renderMobileGuestMenu()}
                    </div>
                </div>
            </header>
        `;

        this.attachEventListeners();
    }

    renderAuthenticatedNav() {
        return `
            <nav class="flex items-center space-x-8">
                <a href="#/programs" class="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-lg font-bold transition-colors duration-200">
                    <i class="fa-solid fa-book-atlas mr-2"></i>Programas
                </a>
                <a href="#/terminal" class="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-lg font-bold transition-colors duration-200">
                    <i class="fa-solid fa-terminal mr-2"></i>Terminal
                </a>
                <a href="#/chat" class="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-lg font-bold transition-colors duration-200">
                    <i class="fa-solid fa-comment mr-2"></i>TutorIA
                </a>
            </nav>
        `;
    }

    renderGuestNav() {
        return `
            <div class="flex items-center space-x-4 ml-8">
                <a href="#/login" class="text-gray-700 hover:text-cyan-600 px-3 py-2 rounded-md text-md font-semibold transition-colors duration-200">
                    Iniciar sesión
                </a>
                <a href="#/register" class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-md font-semibold transition-colors duration-200">
                    Registrarse
                </a>
            </div>
        `;
    }

    renderMobileAuthenticatedMenu(user) {
        return `
            <!-- User Info -->
            <div class="px-3 py-4 bg-gray-50 rounded-lg mb-4">
                <div class="flex items-center space-x-3">
                    <div class="text-gradient-green text-white rounded-full w-10 h-10 flex items-center justify-center">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-700">¡Bienvenido de nuevo!</p>
                        <p class="text-md text-gray-600">${user.name}</p>
                    </div>
                </div>
            </div>

            <!-- Navigation Links -->
            <a href="#/programs" class="mobile-menu-link flex items-center px-3 py-3 rounded-md text-base font-semibold text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors duration-200">
                <i class="fa-solid fa-book-atlas mr-3 text-lg"></i>
                Programas
            </a>
            <a href="#/terminal" class="mobile-menu-link flex items-center px-3 py-3 rounded-md text-base font-semibold text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors duration-200">
                <i class="fa-solid fa-terminal mr-3 text-lg"></i>
                Terminal en Vivo
            </a>
            <a href="#/chat" class="mobile-menu-link flex items-center px-3 py-3 rounded-md text-base font-semibold text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors duration-200">
                <i class="fa-solid fa-comment mr-3 text-lg"></i>
                Chat IA
            </a>

            <!-- Divider -->
            <div class="border-t border-gray-200 my-4"></div>

            <!-- Logout Button -->
            <button id="mobile-logout-btn" class="w-full flex items-center px-3 py-3 rounded-md text-base font-semibold text-gradient-green hover:bg-gray-50 transition-colors duration-200">
                <i class="fa-solid fa-sign-out-alt mr-3 text-lg"></i>
                Cerrar sesión
            </button>
        `;
    }

    renderMobileGuestMenu() {
        return `
            <!-- Auth Buttons -->
            <a href="#/login" class="mobile-menu-link flex items-center px-3 py-3 rounded-md text-base font-semibold text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-colors duration-200">
                <i class="fa-solid fa-sign-in-alt mr-3 text-lg"></i>
                Iniciar sesión
            </a>
            <a href="#/register" class="mobile-menu-link flex items-center px-3 py-3 rounded-md text-base font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition-colors duration-200">
                <i class="fa-solid fa-user-plus mr-3 text-lg"></i>
                Registrarse
            </a>
        `;
    }

    attachEventListeners() {
        // Desktop logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
        const closeMobileMenuBtn = document.getElementById('close-mobile-menu');

        if (mobileMenuBtn && mobileMenu && mobileMenuOverlay) {
            // Open mobile menu
            mobileMenuBtn.addEventListener('click', this.toggleMobileMenu.bind(this));

            // Close the mobile menu when clicking overlay
            mobileMenuOverlay.addEventListener('click', this.closeMobileMenu.bind(this));

            // Close mobile menu when clicking close button
            if (closeMobileMenuBtn) {
                closeMobileMenuBtn.addEventListener('click', this.closeMobileMenu.bind(this));
            }

            // Close the mobile menu when clicking on navigation links
            const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
            mobileMenuLinks.forEach(link => {
                link.addEventListener('click', this.closeMobileMenu.bind(this));
            });
        }

        // Mobile logout button
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', async () => {
                this.closeMobileMenu();
                await this.handleLogout();
            });
        }

        // Close the mobile menu on an escape key - use bound method for proper cleanup
        document.addEventListener('keydown', this.boundKeydownHandler);

        // Close mobile menu on window resize if screen becomes large - use bound method for proper cleanup
        window.addEventListener('resize', this.boundResizeHandler);
    }

    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        const closeIcon = document.getElementById('close-icon');

        if (mobileMenu && mobileMenuOverlay) {
            // Show overlay
            mobileMenuOverlay.classList.remove('hidden');

            // Slide in menu
            mobileMenu.classList.remove('translate-x-full');
            mobileMenu.classList.add('translate-x-0');

            // Toggle icons
            if (hamburgerIcon && closeIcon) {
                hamburgerIcon.classList.add('hidden');
                closeIcon.classList.remove('hidden');
            }

            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            this.isMobileMenuOpen = true;
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        const closeIcon = document.getElementById('close-icon');

        if (mobileMenu && mobileMenuOverlay) {
            // Hide overlay
            mobileMenuOverlay.classList.add('hidden');

            // Slide out menu
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('translate-x-full');

            // Toggle icons
            if (hamburgerIcon && closeIcon) {
                hamburgerIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            }

            // Restore body scroll
            document.body.style.overflow = '';

            this.isMobileMenuOpen = false;
        }
    }

    async handleLogout() {
        try {
            await this.authService.logout();
            window.location.hash = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Event handler methods for proper cleanup
    handleKeydown(e) {
        if (e.key === 'Escape' && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    handleResize() {
        if (window.innerWidth >= 980 && this.isMobileMenuOpen) { // xl breakpoint
            this.closeMobileMenu();
        }
    }

    // Clean up event listeners to prevent memory leaks
    removeEventListeners() {
        document.removeEventListener('keydown', this.boundKeydownHandler);
        window.removeEventListener('resize', this.boundResizeHandler);
    }
}