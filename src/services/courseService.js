// Course service for managing courses and lessons
import {ApiService} from './api.js';

export class CourseService extends ApiService {
    constructor() {
        super();
    }

    // Get all courses available (without filtering by program)
    async getAllCourses() {
        try {
            const response = await this.get('/courses');
            return response.data || [];
        } catch (error) {
            console.error('CourseService: Error fetching all courses:', error);
            if (error.response?.status === 404) {
                return []; // No courses found
            }
            throw new Error('No se pudieron cargar los cursos');
        }
    }

    // Get all courses for a specific program (keep existing functionality)
    async getCoursesByProgram(programId) {
        try {
            const response = await this.get(`/courses/program/${programId}`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching courses:', error);
            if (error.response?.status === 404) {
                return []; // No courses found
            }
            throw new Error('No se pudieron cargar los cursos');
        }
    }

    // Get all lessons for a specific course
    async getLessonsByCourse(courseId) {
        try {
            const response = await this.get(`/lessons/course/${courseId}`);
            return response.data || [];
        } catch (error) {
            console.error('CourseService: Error fetching lessons:', error);
            if (error.response?.status === 404) {
                return []; // No lessons found
            }
            throw new Error('No se pudieron cargar las lecciones');
        }
    }

    // Get progress for a specific program (simple optimized version)
    async getProgressByProgram(programId) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('cognify_user') || '{}');
            
            if (!currentUser.user_id) {
                return [];
            }

            // Simple optimized request to get progress for this program only
            const response = await this.get(`/progress/user/${currentUser.user_id}/program/${programId}`);
            return response.data || [];
        } catch (error) {
            console.error('CourseService: Error fetching progress by program:', error);
            if (error.response?.status === 404) {
                return []; // No progress yet
            }
            return [];
        }
    }

    // Get user progress (keep for backward compatibility)
    async getUserProgress() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('cognify_user') || '{}');

            if (!currentUser.user_id) {
                return [];
            }

            // Use the correct existing backend endpoint to get user progress
            const response = await this.get(`/progress/user/${currentUser.user_id}`);

            return response.data || [];
        } catch (error) {
            console.error('CourseService: Error fetching progress:', error);
            if (error.response?.status === 404) {
                return []; // No progress yet
            }
            return []; // Return empty array instead of throwing
        }
    }

    // Update lesson completion status - optimized to avoid unnecessary API calls
    async updateLessonProgress(lessonId, completed, existingProgressData = null) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('cognify_user') || '{}');

            if (!currentUser.user_id) {
                throw new Error('Usuario no encontrado');
            }

            // Use provided progress data or fetch minimal data if needed
            let existingProgress = null;
            
            if (existingProgressData && Array.isArray(existingProgressData)) {
                // Use the progress data that was passed in (from the page component)
                existingProgress = existingProgressData.find(p =>
                    p.lesson_id === lessonId && p.user_id === currentUser.user_id
                );
            } else {
                // Only fetch if we don't have the data - this should be rare
                const allProgress = await this.getUserProgress();
                if (!Array.isArray(allProgress)) {
                    throw new Error('Error al obtener el progreso del usuario');
                }
                existingProgress = allProgress.find(p =>
                    p.lesson_id === lessonId && p.user_id === currentUser.user_id
                );
            }

            let response;
            if (existingProgress && existingProgress.progress_id) {
                // Actualizar progreso existente
                response = await this.put(`/progress/${existingProgress.progress_id}`, {
                    completed: completed
                });
            } else {
                // Crear nuevo progreso
                response = await this.post('/progress', {
                    user_id: currentUser.user_id,
                    lesson_id: lessonId,
                    completed: completed
                });
            }

            return response.data;
        } catch (error) {
            console.error('Error updating progress:', error);
            throw new Error('No se pudo actualizar el progreso');
        }
    }

    // Calculate progress percentage for a specific program
    calculateProgramProgress(lessons, progressData) {
        if (!lessons || lessons.length === 0) return 0;

        const completedLessons = lessons.filter(lesson => {
            const progress = progressData.find(p => p.lesson_id === lesson.lesson_id);
            return progress && progress.completed;
        });

        return Math.round((completedLessons.length / lessons.length) * 100);
    }
}