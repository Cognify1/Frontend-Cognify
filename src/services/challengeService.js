import {ApiService} from './api.js';

export class ChallengeService {
    constructor() {
        this.api = new ApiService();
    }

    async getChallengesByProgram(programId) {
        // Use optimized endpoint to get challenges for a specific program only
        const res = await this.api.get(`/challenges/program/${programId}`);
        return res.data || [];
    }

    async getChallengeById(challengeId) {
        const res = await this.api.get(`/challenges/${challengeId}`);
        return res.data;
    }

    async getUserEnrollment(userId, programId) {
        try {
            // Use optimized endpoint to get user enrollments only
            const res = await this.api.get(`/enrollments/user/${userId}`);
            const userEnrollments = res.data || [];
            
            // Check if a user is enrolled in this specific program
            return userEnrollments.some(enrollment => enrollment.program_id === parseInt(programId));
        } catch (error) {
            console.error('Error checking user enrollment:', error);
            return false;
        }
    }

    async getLastSubmission(challengeId, userId) {
        try {
            const res = await this.api.get(`/submissions/${challengeId}?user_id=${userId}`);
            return res.data;
        } catch (e) {
            return null;
        }
    }

    async submitSolution(challengeId, userId, solution_code) {
        const res = await this.api.post(`/submissions/${challengeId}`, {user_id: userId, solution_code});
        return res.data;
    }
}