// Chat service for managing chat interactions
import { ApiService } from './api.js';

export class ChatService extends ApiService {
    constructor() {
        super();
        // Get user ID from localStorage
        const userData = localStorage.getItem('cognify_user');
        this.sessionId = userData ? JSON.parse(userData).user_id : "guest";
    }

    // Send a message to the chat API
    async sendMessage(message) {
        try {
            // Update sessionId before sending in case user has changed
            this.updateSessionId();

            const response = await this.post("/chat", {
                message,
                sessionId: this.sessionId
            });

            if (!response.data?.content) {
                throw new Error('Invalid server response');
            }

            return response.data;
        } catch (error) {
            console.error('ChatService: Error sending message:', error);
            throw new Error('Error connecting to server');
        }
    }

    // Update the chat session ID
    setSessionId(newSessionId) {
        this.sessionId = newSessionId;
    }

    // Get the current session ID
    getSessionId() {
        return this.sessionId;
    }

    // Method to update sessionId with current user ID
    updateSessionId() {
        const userData = localStorage.getItem('cognify_user');
        if (userData) {
            const user = JSON.parse(userData);
            this.sessionId = user.user_id;
        } else {
            this.sessionId = "guest";
        }
    }
}