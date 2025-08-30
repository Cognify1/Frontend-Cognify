// Courses page component - Redesigned for open access
import {CourseService} from '../services/courseService.js';
import {AuthService} from '../services/auth.js';
import {DataUtils} from '../utils/data.js';
import Swal from 'sweetalert2';

export class CoursesPage {
    constructor() {
        this.container = document.getElementById('main-content');
        this.courseService = new CourseService();
        this.authService = new AuthService();

        // Remove programId dependency - we'll load all courses
        this.courses = [];
        this.lessons = {};  // Store lessons grouped by course_id
        this.progress = [];
        this.currentLesson = null;
        this.expandedCourses = new Set();
    }

    async render() {
        this.showLoading();

        try {
            await this.loadData();
            this.renderContent();
        } catch (error) {
            console.error('Error rendering courses page:', error);
            this.showError('No se pudieron cargar los cursos. Por favor, inténtalo de nuevo.');
        }
    }

    async loadData() {
        try {
            // Load all courses available
            this.courses = await this.courseService.getAllCourses();

            // Load user progress (optional)
            try {
                this.progress = await this.courseService.getUserProgress();
            } catch (progressError) {
                console.warn('CoursesPage: Could not load progress (user may not be logged in):', progressError);
                this.progress = [];
            }

            // Load lessons for each course
            await this.loadAllLessons();

        } catch (error) {
            console.error('CoursesPage: Error in loadData:', error);
            throw new Error('Error loading data: ' + error.message);
        }
    }

    async loadAllLessons() {
        try {
            // Load lessons for each course
            const lessonsPromises = this.courses.map(async (course) => {
                const lessons = await this.courseService.getLessonsByCourse(course.course_id);
                return {
                    courseId: course.course_id,
                    lessons: lessons.sort((a, b) => a.order_index - b.order_index)
                };
            });

            const lessonsResults = await Promise.all(lessonsPromises);

            // Group lessons by course_id
            this.lessons = {};
            lessonsResults.forEach(result => {
                this.lessons[result.courseId] = result.lessons;
            });

        } catch (error) {
            console.error('CoursesPage: Error loading lessons:', error);
            this.lessons = {};
        }
    }

    showLoading() {
        this.container.innerHTML = `
            <div class="min-h-screen bg-gray-50 flex items-center justify-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-gray-600">Cargando cursos disponibles...</p>
                </div>
            </div>
        `;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="min-h-screen bg-gray-50 flex items-center justify-center">
                <div class="text-center">
                    <div class="mb-8">
                        <i class="fa-solid fa-exclamation-triangle text-6xl text-red-600"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">Error al cargar</h1>
                    <p class="text-gray-600 mb-8">${message}</p>
                    <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                        <i class="fa-solid fa-refresh mr-2"></i>Reintentar
                    </button>
                </div>
            </div>
        `;
    }

    renderContent() {
        // Calculate overall progress
        const allLessons = Object.values(this.lessons).flat();
        const progressPercentage = this.courseService.calculateProgramProgress(allLessons, this.progress);

        this.container.innerHTML = `
            <div class="min-h-screen bg-gray-50">
                <!-- Debug Info -->
                <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 text-sm">
                    <strong>Debug Cursos:</strong> 
                    Cursos disponibles: ${this.courses.length} | 
                    Lecciones totales: ${allLessons.length} | 
                    Progreso: ${this.progress.length} items |
                    Usuario: ${this.authService.getCurrentUser()?.user_id || 'No logueado'}
                </div>

                <div class="flex h-screen">
                    <!-- Sidebar -->
                    <div class="w-80 bg-white shadow-lg overflow-y-auto">
                        ${this.renderSidebar()}
                    </div>

                    <!-- Main Content Area -->
                    <div class="flex-1 flex flex-col">
                        <!-- Header -->
                        <div class="bg-white shadow-sm border-b px-6 py-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h1 class="text-2xl font-bold text-gray-900">
                                        <i class="fa-solid fa-book mr-3 text-blue-600"></i>
                                        Explorar Cursos
                                    </h1>
                                    <p class="text-gray-600">
                                        ${this.courses.length} cursos disponibles • 
                                        ${allLessons.length} lecciones totales
                                        ${this.authService.isAuthenticated() ? ` • Progreso: ${progressPercentage}%` : ''}
                                    </p>
                                </div>
                                <a href="#/programs" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                                    <i class="fa-solid fa-arrow-left mr-2"></i>Volver a Programas
                                </a>
                            </div>
                            
                            <!-- Progress Bar (only if the user is authenticated) -->
                            ${this.authService.isAuthenticated() && allLessons.length > 0 ? `
                                <div class="mt-4">
                                    <div class="w-full bg-gray-200 rounded-full h-3">
                                        <div class="bg-gradient-to-r from-blue-600 to-green-600 h-3 rounded-full transition-all duration-300" 
                                             style="width: ${progressPercentage}%"></div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Video Content -->
                        <div class="flex-1 p-6" id="video-content">
                            ${this.renderDefaultContent()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderSidebar() {
        if (this.courses.length === 0) {
            return `
                <div class="p-4">
                    <h2 class="text-lg font-bold text-gray-900 mb-4">
                        <i class="fa-solid fa-book mr-2 text-blue-600"></i>
                        Cursos Disponibles
                    </h2>
                    <div class="text-center py-8">
                        <i class="fa-solid fa-book text-3xl text-gray-400 mb-3"></i>
                        <p class="text-gray-500">No se encontraron cursos disponibles.</p>
                        <p class="text-gray-400 text-sm mt-2">Contacta al administrador para agregar contenido.</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="p-4">
                <h2 class="text-lg font-bold text-gray-900 mb-4">
                    <i class="fa-solid fa-book mr-2 text-blue-600"></i>
                    Cursos Disponibles (${this.courses.length})
                </h2>

                <div class="space-y-2">
                    ${this.courses.map(course => this.renderCourseItem(course)).join('')}
                </div>
            </div>
        `;
    }

    renderCourseItem(course) {
        const courseLessons = this.lessons[course.course_id] || [];
        const completedLessons = courseLessons.filter(lesson => {
            const lessonProgress = this.progress.find(p => p.lesson_id === lesson.lesson_id);
            return lessonProgress && lessonProgress.completed;
        });
        const progressPercent = courseLessons.length > 0 ? Math.round((completedLessons.length / courseLessons.length) * 100) : 0;
        const isExpanded = this.expandedCourses.has(course.course_id);

        return `
            <div class="border border-gray-200 rounded-lg">
                <!-- Course Header -->
                <button 
                    class="course-toggle w-full p-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200"
                    data-course-id="${course.course_id}"
                >
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-900 text-sm">${course.title}</h3>
                            <p class="text-xs text-gray-600 mt-1">
                                ${courseLessons.length} lecciones
                                ${this.authService.isAuthenticated() && courseLessons.length > 0 ? ` • ${progressPercent}% completado` : ''}
                            </p>
                            <p class="text-xs text-gray-500 mt-1">${course.description}</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            ${this.authService.isAuthenticated() && courseLessons.length > 0 ? `
                                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span class="text-xs font-semibold text-gray-600">${progressPercent}%</span>
                                </div>
                            ` : ''}
                            <i class="fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400"></i>
                        </div>
                    </div>
                </button>

                <!-- Lessons List -->
                <div class="lessons-list ${isExpanded ? 'block' : 'hidden'}">
                    ${courseLessons.length > 0 ? 
                        courseLessons.map(lesson => this.renderLessonItem(lesson)).join('') :
                        '<div class="p-4 text-center text-gray-500 text-sm">No hay lecciones disponibles para este curso</div>'
                    }
                </div>
            </div>
        `;
    }

    renderLessonItem(lesson) {
        const lessonProgress = this.progress.find(p => p.lesson_id === lesson.lesson_id);
        const isCompleted = lessonProgress && lessonProgress.completed;
        const isSelected = this.currentLesson && this.currentLesson.lesson_id === lesson.lesson_id;

        return `
            <div class="lesson-item border-t border-gray-100 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} cursor-pointer transition-colors duration-200"
                 data-lesson='${JSON.stringify(lesson)}'>
                <div class="p-3 pl-8">
                    <div class="flex items-center space-x-3">
                        <!-- Completion Checkbox (only if the user is authenticated) -->
                        ${this.authService.isAuthenticated() ? `
                            <label class="flex items-center cursor-pointer" onclick="event.stopPropagation()">
                                <input type="checkbox" 
                                       class="lesson-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                       data-lesson-id="${lesson.lesson_id}"
                                       ${isCompleted ? 'checked' : ''}>
                                <span class="ml-2"></span>
                            </label>
                        ` : `
                            <div class="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                <i class="fa-solid fa-play text-blue-600 text-xs"></i>
                            </div>
                        `}

                        <!-- Lesson Info -->
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 truncate">${lesson.title}</p>
                            <p class="text-xs text-gray-500">${DataUtils.formatDuration(lesson.duration)}</p>
                        </div>

                        <!-- Play Icon -->
                        <div class="flex-shrink-0">
                            <i class="fa-solid fa-play text-blue-600 text-sm"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDefaultContent() {
        return `
            <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                <div class="text-center">
                    <i class="fa-solid fa-play-circle text-6xl text-gray-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Selecciona una lección para comenzar</h3>
                    <p class="text-gray-500">Expande cualquier curso del sidebar y haz clic en una lección para ver el contenido</p>
                </div>
            </div>
        `;
    }

    renderVideoContent(lesson) {
        return `
            <div class="max-w-4xl mx-auto">
                <!-- Video Player -->
                <div class="bg-black rounded-lg overflow-hidden shadow-lg mb-6">
                    <div class="aspect-w-16 aspect-h-9">
                        <iframe 
                            src="${lesson.video_url}" 
                            title="${lesson.title}"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowfullscreen
                            class="w-full h-96"
                        ></iframe>
                    </div>
                </div>

                <!-- Lesson Info -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-bold text-gray-900">${lesson.title}</h2>
                        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            ${DataUtils.formatDuration(lesson.duration)}
                        </span>
                    </div>
                    
                    <div class="prose max-w-none">
                        <p class="text-gray-700 leading-relaxed">${lesson.content}</p>
                    </div>

                    <!-- Progress actions (only if authenticated) -->
                    ${this.authService.isAuthenticated() ? `
                        <div class="mt-6 pt-4 border-t border-gray-200">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-600">¿Completaste esta lección?</span>
                                <label class="flex items-center">
                                    <input type="checkbox" 
                                           class="lesson-checkbox-main rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                           data-lesson-id="${lesson.lesson_id}"
                                           ${this.progress.find(p => p.lesson_id === lesson.lesson_id && p.completed) ? 'checked' : ''}>
                                    <span class="text-sm font-medium text-gray-700">Marcar como completada</span>
                                </label>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Course toggle buttons
        const courseToggles = document.querySelectorAll('.course-toggle');
        courseToggles.forEach(toggle => {
            toggle.addEventListener('click', this.handleCourseToggle.bind(this));
        });

        // Lesson items
        const lessonItems = document.querySelectorAll('.lesson-item');
        lessonItems.forEach(item => {
            item.addEventListener('click', this.handleLessonSelect.bind(this));
        });

        // Lesson checkboxes (if the user is authenticated)
        if (this.authService.isAuthenticated()) {
            const lessonCheckboxes = document.querySelectorAll('.lesson-checkbox, .lesson-checkbox-main');
            lessonCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', this.handleProgressUpdate.bind(this));
            });
        }
    }

    handleCourseToggle(event) {
        const courseId = parseInt(event.currentTarget.dataset.courseId);

        if (this.expandedCourses.has(courseId)) {
            this.expandedCourses.delete(courseId);
        } else {
            this.expandedCourses.add(courseId);
        }

        // Re-render sidebar
        const sidebar = document.querySelector('.w-80');
        sidebar.innerHTML = this.renderSidebar();
        this.attachEventListeners();
    }

    handleLessonSelect(event) {
        const lessonData = JSON.parse(event.currentTarget.dataset.lesson);
        this.currentLesson = lessonData;

        // Update video content
        const videoContent = document.getElementById('video-content');
        videoContent.innerHTML = this.renderVideoContent(lessonData);

        // Update sidebar selection
        document.querySelectorAll('.lesson-item').forEach(item => {
            item.classList.remove('bg-blue-50');
            item.classList.add('hover:bg-gray-50');
        });
        event.currentTarget.classList.add('bg-blue-50');
        event.currentTarget.classList.remove('hover:bg-gray-50');

        // Re-attach event listeners for the new content
        this.attachEventListeners();
    }

    async handleProgressUpdate(event) {
        if (!this.authService.isAuthenticated()) {
            return; // Don't handle progress if not authenticated
        }

        const checkbox = event.currentTarget;
        const lessonId = parseInt(checkbox.dataset.lessonId);
        const completed = checkbox.checked;

        try {
            // Update progress on server
            await this.courseService.updateLessonProgress(lessonId, completed);

            // Update local progress
            const existingProgress = this.progress.find(p => p.lesson_id === lessonId);
            if (existingProgress) {
                existingProgress.completed = completed;
            } else {
                this.progress.push({
                    lesson_id: lessonId,
                    completed: completed
                });
            }

            // Sync all checkboxes for this lesson
            const allCheckboxes = document.querySelectorAll(`[data-lesson-id="${lessonId}"]`);
            allCheckboxes.forEach(cb => {
                if (cb !== checkbox) {
                    cb.checked = completed;
                }
            });

            // Update progress display
            this.updateProgressDisplay();

            // Show feedback
            if (completed) {
                await this.showProgressFeedback('¡Lección completada!', 'success');
            }

        } catch (error) {
            console.error('Error updating progress:', error);
            // Revert checkbox state
            checkbox.checked = !completed;
            await this.showProgressFeedback('No se pudo actualizar el progreso', 'error');
        }
    }

    updateProgressDisplay() {
        // Recalculate and update progress bar
        const allLessons = Object.values(this.lessons).flat();
        const progressPercentage = this.courseService.calculateProgramProgress(allLessons, this.progress);

        // Update progress bar
        const progressBar = document.querySelector('.bg-gradient-to-r');
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }

        // Update header text
        const headerText = document.querySelector('.text-gray-600');
        if (headerText) {
            headerText.textContent = `${this.courses.length} cursos disponibles • ${allLessons.length} lecciones totales • Progreso: ${progressPercentage}%`;
        }
    }

    async showProgressFeedback(message, type) {
        const toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });

        await toast.fire({
            icon: type,
            title: message
        });
    }
}