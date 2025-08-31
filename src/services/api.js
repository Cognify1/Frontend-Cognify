
// API service for HTTP requests
import axios from "axios";

export class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:4000/api';
        this.setupAxiosDefaults();
    }

    setupAxiosDefaults() {
        // Set default base URL
        axios.defaults.baseURL = this.baseURL;

        // Set default headers
        axios.defaults.headers.common['Content-Type'] = 'application/json';

        // Request interceptor to add auth token if needed
        axios.interceptors.request.use(
            (config) => {
                // Add debugging to see what user data we have
                const user = localStorage.getItem('cognify_user');

                if (user) {
                    const userData = JSON.parse(user);

                    // Add user identification to requests (adjust based on your backend authentication)
                    if (userData.user_id) {
                        config.headers['X-User-ID'] = userData.user_id;
                    }

                    if (userData.email) {
                        config.headers['X-User-Email'] = userData.email;
                    }

                    // If you have a JWT token
                    if (userData.token) {
                        config.headers.Authorization = `Bearer ${userData.token}`;
                    }
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        axios.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                console.error('API Error - Status:', error.response?.status);
                console.error('API Error - Data:', error.response?.data);
                console.error('API Error - Full error:', error);

                if (error.response?.status === 401) {
                    // Handle unauthorized access
                    this.handleUnauthorized();
                }
                return Promise.reject(error);
            }
        );
    }

    handleUnauthorized() {
        // Clear user data and redirect to log in
        localStorage.removeItem('cognify_user');
        window.location.hash = '/login';
    }

    // HTTP methods
    async get(url, config = {}) {
        return await axios.get(url, config);
    }

    async post(url, data = {}, config = {}) {
        return await axios.post(url, data, config);
    }

    async put(url, data = {}, config = {}) {
        return await axios.put(url, data, config);
    }
}