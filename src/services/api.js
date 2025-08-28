// API service for HTTP requests
import axios from "axios";

export class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:4000/api'; // Adjust based on your backend URL
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
                // Add an auth token if available (for future JWT implementation)
                const user = localStorage.getItem('cognify_user');
                if (user) {
                    const userData = JSON.parse(user);
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
            (response) => response,
            (error) => {
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

    async delete(url, config = {}) {
        return await axios.delete(url, config);
    }

    async patch(url, data = {}, config = {}) {
        return await axios.patch(url, data, config);
    }
}