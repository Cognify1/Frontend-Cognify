// Main application entry point
import {App} from './app.js';

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.init();
});