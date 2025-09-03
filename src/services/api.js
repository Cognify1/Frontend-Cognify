
// API service for HTTP requests
import axios from "axios";

export class ApiService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL;
        this.setupAxiosDefaults();
    }

    setupAxiosDefaults() {
        // Set default base URL
        axios.defaults.baseURL = this.baseURL;
    }

    // HTTP methods
    async get(url) {
        return await axios.get(url);
    }

    async post(url, data = {}) {
        return await axios.post(url, data);
    }

    async put(url, data = {}) {
        return await axios.put(url, data);
    }
}