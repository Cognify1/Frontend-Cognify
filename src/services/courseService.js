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

    // Get user progress for a specific program (legacy method - kept for compatibility)
    async getUserProgressByProgram(programId) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('cognify_user') || '{}');
            
            if (!currentUser.user_id) {
                return [];
            }

            // Use existing backend endpoint to get user progress
            const response = await this.get(`/progress/${currentUser.user_id}`);
            const userProgress = response.data || [];

            // If no program specified, return all user progress
            if (!programId) {
                return userProgress;
            }

            // Get courses for this program
            const courses = await this.getCoursesByProgram(programId);
            const courseIds = courses.map(course => course.course_id);
            
            // Get lessons for these courses
            const lessonsPromises = courseIds.map(courseId => 
                this.getLessonsByCourse(courseId)
            );
            const lessonsArrays = await Promise.all(lessonsPromises);
            const programLessonIds = lessonsArrays.flat().map(lesson => lesson.lesson_id);
            
            // Filter progress to only include lessons from this program
            return userProgress.filter(progress => 
                programLessonIds.includes(progress.lesson_id)
            );
        } catch (error) {
            console.error('CourseService: Error fetching progress by program:', error);
            if (error.response?.status === 404) {
                return []; // No progress yet
            }
            return []; // Return empty array instead of throwing
        }
    }

    // Get user progress (keep for backward compatibility)
    async getUserProgress() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('cognify_user') || '{}');

            if (!currentUser.user_id) {
                return [];
            }

            // Use correct existing backend endpoint to get user progress
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

    // Update lesson completion status
    async updateLessonProgress(lessonId, completed) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('cognify_user') || '{}');

            if (!currentUser.user_id) {
                throw new Error('Usuario no encontrado');
            }

            // Obtener todos los progresos del usuario
            const allProgress = await this.getUserProgress();

            // Validar que allProgress sea un array
            if (!Array.isArray(allProgress)) {
                throw new Error('Error al obtener el progreso del usuario');
            }

            // Buscar el progreso específico para esta lección
            const existingProgress = allProgress.find(p =>
                p.lesson_id === lessonId && p.user_id === currentUser.user_id
            );

            let response;
            if (existingProgress) {
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

    // Calculate progress percentage for a specific course
    calculateCourseProgress(courseLessons, progressData) {
        if (!courseLessons || courseLessons.length === 0) return 0;

        const completedLessons = courseLessons.filter(lesson => {
            const progress = progressData.find(p => p.lesson_id === lesson.lesson_id);
            return progress && progress.completed;
        });

        return Math.round((completedLessons.length / courseLessons.length) * 100);
    }
}