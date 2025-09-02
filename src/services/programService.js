// Program service for managing programs and enrollments
import {ApiService} from './api.js';

export class ProgramService extends ApiService {
    constructor() {
        super();
    }

    // Get all available programs
    async getAllPrograms() {
        try {
            const response = await this.get('/programs');
            return response.data;
        } catch (error) {
            console.error('ProgramService: Error fetching programs:', error);
            throw new Error('No se pudieron cargar los programas');
        }
    }

    // Enroll a user in a program
    async enrollInProgram(programId) {
        try {
            // Get the current user to make sure we're authenticated
            const currentUser = JSON.parse(localStorage.getItem('cognify_user') || '{}');

            if (!currentUser.user_id) {
                throw new Error('Usuario no autenticado correctamente');
            }

            const response = await this.post('/enrollments', {
                program_id: programId,
                user_id: currentUser.user_id // Explicitly send user_id
            });



            return response.data;
        } catch (error) {
            console.error('ProgramService: Error enrolling in program:', error);
            throw new Error('No se pudo realizar la inscripción: ' + (error.response?.data?.message || error.message));
        }
    }

    // Get user enrollments - optimized to use specific endpoint
    async getUserEnrollments() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('cognify_user') || '{}');

            if (!currentUser.user_id) {
                console.log('ProgramService: No user ID found, returning empty array');
                return [];
            }

            // Use optimized endpoint to get enrollments for a specific user
            const response = await this.get(`/enrollments/user/${currentUser.user_id}`);
            return response.data || [];
        } catch (error) {
            console.error('ProgramService: Error fetching enrollments:', error);

            // If it's a 404, the user has no enrollments
            if (error.response?.status === 404) {
                console.log('ProgramService: No enrollments found (404), returning empty array');
                return [];
            }

            console.error('ProgramService: Unexpected error, returning empty array');
            return []; // Return empty array instead of throwing
        }
    }
}