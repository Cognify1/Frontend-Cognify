// Simple hash router
import {AuthService} from '../services/auth.js';
import {HomePage} from '../pages/Home.js';
import {LoginPage} from '../pages/Login.js';
import {RegisterPage} from '../pages/Register.js';
import {ProgramsPage} from '../pages/Programs.js';
import {CoursesPage} from '../pages/Courses.js';
import {ProgramService} from '../services/programService.js';
import {ChatPage} from '../pages/Chat.js';
import {TerminalPage} from '../pages/Terminal.js';
import {ChallengeListPage} from '../pages/ChallengeListPage.js';
import {ChallengeDetailPage} from '../pages/ChallengeDetailPage.js';
import Swal from 'sweetalert2';

export class Router {
    constructor() {
        this.authService = new AuthService();
        this.programService = new ProgramService();
        this.routes = this.defineRoutes();
    }

    defineRoutes() {
        return {
            '/': {
                component: HomePage,
                requiresAuth: false,
                title: 'Inicio - Cognify'
            },
            '/login': {
                component: LoginPage,
                requiresAuth: false,
                guestOnly: true,
                title: 'Iniciar Sesión - Cognify'
            },
            '/register': {
                component: RegisterPage,
                requiresAuth: false,
                guestOnly: true,
                title: 'Registro - Cognify'
            },
            '/programs': {
                component: ProgramsPage,
                requiresAuth: true,
                title: 'Programas - Cognify'
            },
            '/courses': {
                component: CoursesPage,
                requiresAuth: true,
                title: 'Cursos - Cognify'
            },
            '/terminal': {
                component: TerminalPage,
                requiresAuth: true,
                title: 'Terminal - Cognify'
            },
            '/chat': {
                component: ChatPage,
                requiresAuth: true,
                title: 'Chat IA - Cognify'
            },
            '/challenges/program/:programId': {
                component: ChallengeListPage,
                requiresAuth: true,
                title: 'Retos - Cognify'
            },
            '/challenge/:challengeId': {
                component: ChallengeDetailPage,
                requiresAuth: true,
                title: 'Detalle del Reto - Cognify'
            },
        };
    }

    async init() {
        // Handle the initial route
        await this.handleRouteChange();

        // Listen to changes in route
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        // Listen to authentication changes
        window.addEventListener('auth-changed', () => {
            this.handleRouteChange();
        });
    }

    async handleRouteChange() {
        const hash = window.location.hash.slice(1) || '/';
        let route = this.routes[hash];
        let params = {};

        // Check for dynamic routes
        if (!route) {
            // Check for /courses/program/:programId pattern
            if (hash.startsWith('/courses/program/')) {
                const programId = hash.split('/')[3];
                if (programId && !isNaN(programId)) {
                    route = this.routes['/courses'];
                    params = {programId: parseInt(programId)};
                }
            }
            if (hash.startsWith('/challenges/program/')) {
                const programId = hash.split('/')[3];
                route = this.routes['/challenges/program/:programId'];
                params = {programId: parseInt(programId)};
            }
            if (hash.startsWith('/challenge/')) {
                const challengeId = hash.split('/')[2].split('?')[0];
                route = this.routes['/challenge/:challengeId'];
                params = {challengeId: parseInt(challengeId)};
            }
        }

        if (!route) {
            this.redirect('/');
            return;
        }

        // Verify auth requirements
        if (route.requiresAuth && !this.authService.isAuthenticated()) {
            this.redirect('/login');
            return;
        }

        // Verify guest routes
        if (route.guestOnly && this.authService.isAuthenticated()) {
            this.redirect('/');
            return;
        }

        // Verify enrollment if required
        if (hash.startsWith('/courses')) {
            try {
                const enrollments = await this.programService.getUserEnrollments();
                if (enrollments.length === 0) {
                    await Swal.fire({
                        title: 'Acceso Denegado',
                        text: 'Debes estar inscrito en al menos un programa para ver los cursos.',
                        icon: 'warning',
                        confirmButtonColor: '#3b82f6'
                    });
                    this.redirect('/programs');
                    return;
                }
            } catch (error) {
                console.error('Error verificando inscripciones:', error);
                this.redirect('/');
                return;
            }
        }

        // Update title
        document.title = route.title;

        // Render component
        this.renderRoute(route, params);
    }

    renderRoute(route, params = {}) {
        try {
            // Handle pages "próximamente"
            if (route.component === 'coming-soon') {
                this.renderComingSoon(route.featureName);
                return;
            }

            // Handle normal components
            if (typeof route.component === 'function') {
                const user = JSON.parse(localStorage.getItem('cognify_user'));
                const userId = user?.user_id;
                const componentInstance = new route.component(userId);
                if (params.programId) {
                    componentInstance.render(params.programId);
                } else if (params.challengeId) {
                    componentInstance.render(params.challengeId);
                } else {
                    componentInstance.render();
                }
            }
        } catch (error) {
            console.error('Error al renderizar la ruta:', error);
            this.renderError('No se pudo cargar la página. Por favor, inténtalo de nuevo.');
        }
    }

    renderComingSoon(featureName) {
        const container = document.getElementById('main-content');
        container.innerHTML = `
            <div class="min-h-screen bg-gray-50 flex items-center justify-center">
                <div class="text-center">
                    <div class="mb-8">
                        <i class="fa-solid fa-cog fa-spin text-6xl text-cyan-600"></i>
                    </div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">${featureName}</h1>
                    <p class="text-lg text-gray-600 mb-8">¡Esta función llegará pronto! Estamos trabajando para traerla para ti.</p>
                    <a href="#/" class="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                        <i class="fa-solid fa-arrow-left mr-2"></i>Volver al Inicio
                    </a>
                </div>
            </div>
        `;
    }

    renderError(message) {
        const container = document.getElementById('main-content');
        container.innerHTML = `
            <div class="min-h-screen bg-gray-50 flex items-center justify-center">
                <div class="text-center">
                    <div class="mb-8">
                        <i class="fa-solid fa-exclamation-triangle text-6xl text-red-600"></i>
                    </div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">¡Ups! Algo salió mal</h1>
                    <p class="text-lg text-gray-600 mb-8">${message}</p>
                    <button onclick="location.reload()" class="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                        <i class="fa-solid fa-refresh mr-2"></i>Recargar Página
                    </button>
                </div>
            </div>
        `;
    }

    redirect(path) {
        window.location.hash = path;
    }
}