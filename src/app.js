// Main application class
import {Router} from './router/router.js';
import {AuthService} from './services/auth.js';
import {HeaderComponent} from './components/Header.js';
import {FooterComponent} from './components/Footer.js';

export class App {
    constructor() {
        this.router = new Router();
        this.authService = new AuthService();
        this.headerComponent = new HeaderComponent();
        this.footerComponent = new FooterComponent();
    }

    init() {
        // Initialize components
        this.initComponents();

        // Initialize router
        this.router.init();

        // Listen for auth state changes
        this.setupAuthListeners();
    }

    initComponents() {
        // Render header and footer
        this.headerComponent.render();
        this.footerComponent.render();
    }

    setupAuthListeners() {
        // Listen for login/logout events
        window.addEventListener('auth-changed', () => {
            this.headerComponent.render();
        });
    }
}