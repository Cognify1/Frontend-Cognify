import { ApiService } from './api.js';

export class ChallengeService {
    constructor() {
        this.api = new ApiService();
    }

    async getChallengesByProgram(programId) {
        const res = await this.api.get(`/challenges`);
        // Filter by program
        return res.data.filter(ch => ch.program_id === programId);
    }

    async getChallengeById(challengeId) {
        const res = await this.api.get(`/challenges/${challengeId}`);
        return res.data;
    }

    async getUserEnrollment(userId, programId) {
        const res = await this.api.get(`/enrollments?user_id=${userId}&program_id=${programId}`);
        return res.data && res.data.length > 0;
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
        const res = await this.api.post(`/submissions/${challengeId}`, { user_id: userId, solution_code });
        return res.data;
    }
}