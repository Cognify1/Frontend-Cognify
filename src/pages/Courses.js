// Courses page component - Redesigned for program-specific access
import {CourseService} from '../services/courseService.js';
import {AuthService} from '../services/auth.js';
import {DataUtils} from '../utils/data.js';
import Swal from 'sweetalert2';

export class CoursesPage {
    constructor() {
        this.container = document.getElementById('main-content');
        this.courseService = new CourseService();
        this.authService = new AuthService();

        // Add programId dependency for filtering
        this.programId = null;
        this.courses = [];
        this.lessons = {};  // Store lessons grouped by course_id
        this.progress = [];
        this.currentLesson = null;
        this.expandedCourses = new Set();
    }

    async render(programId = null) {
        this.programId = programId;
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
            // Load courses for a specific program if programId is provided
            if (this.programId) {
                this.courses = await this.courseService.getCoursesByProgram(this.programId);
                
                // Use optimized progress for a program-specific view
                this.progress = await this.courseService.getProgressByProgram(this.programId);
            } else {
                // Fallback to all courses if no program specified
                this.courses = await this.courseService.getAllCourses();
                
                // Load user progress for a general view
                this.progress = await this.courseService.getUserProgress();
            }

            // Only load lessons if we have courses
            if (this.courses.length > 0) {
                await this.loadAllLessons();
            }

        } catch (error) {
            console.error('CoursesPage: Error in loadData:', error);
            throw new Error('Error loading data: ' + error.message);
        }
    }

    async loadAllLessons() {
        try {
            // Simple approach: load lessons for each course
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
            <div class="min-h-screen bg-gradient-to-br from-blue-600 via-sky-400 to-green-500 flex items-center justify-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-14 w-14 border-b-4 border-white mx-auto mb-4"></div>
                    <p class="text-white text-xl">Cargando cursos disponibles...</p>
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
                    <button onclick="location.reload()" class="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                        <i class="fa-solid fa-refresh mr-2"></i>Reintentar
                    </button>
                </div>
            </div>
        `;
    }

    renderContent() {
        // Clean up existing event listeners before re-rendering to prevent duplicates
        this.removeEventListeners();
        
        // Calculate overall progress for the current program
        const allLessons = Object.values(this.lessons).flat();
        const progressPercentage = this.courseService.calculateProgramProgress(allLessons, this.progress);

        this.container.innerHTML = `
            <div class="bg-gray-50">
                <div class="flex flex-col md:flex-row mt-20">
                    <!-- Sidebar -->
                    <div id="sidebar" class="sidebar w-full md:w-80 bg-white shadow-lg overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200 transition-all duration-300">
                        ${this.renderSidebar()}
                    </div>
                    <!-- Main Content Area -->
                    <div class="flex-1 flex flex-col">
                        <!-- Header -->
                        <div class="bg-white shadow-sm border-b px-4 md:px-6 py-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h1 class="text-2xl font-bold text-gray-900">
                                        <i class="fa-solid fa-book mr-3 text-cyan-600"></i>
                                        ${this.programId ? 'Cursos del Programa' : 'Explorar Cursos'}
                                    </h1>
                                    <p id="progress-header-text" class="text-gray-600">
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
                                        <div class="bg-gradient-to-r from-cyan-600 to-green-600 h-3 rounded-full transition-all duration-300" 
                                             style="width: ${progressPercentage}%"></div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Video Content -->
                        <div class="flex-1 p-4 md:p-6 bg-gradient-to-br from-blue-600 via-sky-400 to-green-500" id="video-content">
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
                        <i class="fa-solid fa-book mr-2 text-cyan-600"></i>
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
                    <i class="fa-solid fa-book mr-2 text-cyan-600"></i>
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
            return lessonProgress && lessonProgress.completed === true;
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
                <div class="lessons-list px-2 mb-1 overflow-hidden transition-all duration-300 ease-in-out" 
                    style="max-height: ${isExpanded ? '1000px' : '0'}; opacity: ${isExpanded ? '1' : '0'};">
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
            <div class="lesson-item border-t border-gray-100 bg-white shadow-lg ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-100'} cursor-pointer transition-colors duration-200 rounded-lg my-1"
             data-lesson='${JSON.stringify(lesson)}'>
            <div class="p-3 pl-6 flex items-center space-x-3">
                ${this.authService.isAuthenticated() ? `
                    <label class="flex items-center cursor-pointer" onclick="event.stopPropagation()">
                        <input type="checkbox"
                               class="lesson-checkbox rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                               data-lesson-id="${lesson.lesson_id}"
                               ${isCompleted ? 'checked' : ''}>
                        <span class="ml-2"></span>
                    </label>
                ` : `
                    <div class="w-4 h-4 bg-cyan-100 rounded flex items-center justify-center">
                        <i class="fa-solid fa-play text-cyan-600 text-xs"></i>
                    </div>
                `}
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">${lesson.title}</p>
                    <p class="text-xs text-gray-500">${DataUtils.formatDuration(lesson.duration)}</p>
                </div>
                <div class="flex-shrink-0">
                    <i class="fa-solid fa-play text-cyan-600 text-sm"></i>
                </div>
            </div>
        </div>
        `;
    }

    renderDefaultContent() {
        return `
            <div class="max-w-4xl mx-auto flex items-center justify-center h-1/2 bg-gray-100 rounded-lg">
                <div class="text-center">
                    <i class="fa-solid fa-play-circle text-6xl text-gray-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Selecciona una lección para comenzar</h3>
                    <p class="text-gray-500">Expande cualquier curso del sidebar y haz clic en una lección para ver el contenido</p>
                </div>
            </div>
        `;
    }

    renderVideoContent(lesson) {
        // Extract YouTube video ID from URL
        const videoId = this.extractYouTubeVideoId(lesson.video_url);
        
        return `
            <div class="max-w-4xl mx-auto">
                <!-- Video Player -->
                <div class="bg-black rounded-lg overflow-hidden shadow-lg mb-6">
                    <div class="aspect-w-16 aspect-h-9">
                                                 ${videoId ? `
                             <div id="youtube-player-${lesson.lesson_id}" class="w-full h-96"></div>
                         ` : `
                             <div class="w-full h-96 bg-gray-800 flex items-center justify-center rounded-lg">
                                 <div class="text-center text-white">
                                     <i class="fa-solid fa-video-slash text-4xl mb-3 text-gray-400"></i>
                                     <h3 class="text-lg font-semibold mb-2">Video no disponible</h3>
                                     <p class="text-sm text-gray-300 mb-3">No se pudo cargar el video de esta lección</p>
                                     <div class="text-xs text-gray-400">
                                         <p>• Verifica que la URL del video sea válida</p>
                                         <p>• Asegúrate de que sea un enlace de YouTube</p>
                                     </div>
                                 </div>
                             </div>
                         `}
                    </div>
                </div>

                <!-- Lesson Info -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-bold text-gray-900">${lesson.title}</h2>
                        <span class="bg-gray-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-semibold">
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
                                           class="lesson-checkbox-main rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 mr-2"
                                           data-lesson-id="${lesson.lesson_id}"
                                           ${this.progress.find(p => p.lesson_id === lesson.lesson_id && p.completed) ? 'checked' : ''}>
                                    <span class="text-sm font-medium text-gray-700">Marcar como completada</span>
                                </label>
                            </div>
                                                         ${this.extractYouTubeVideoId(lesson.video_url) ? `
                                 <div class="mt-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                                     <div class="flex items-center text-cyan-800">
                                         <i class="fa-solid fa-info-circle mr-2"></i>
                                         <span class="text-sm">
                                             <strong>Auto-completado:</strong> Esta lección se marcará automáticamente como completada cuando veas el video completo.
                                         </span>
                                     </div>
                                 </div>
                             ` : lesson.video_url ? `
                                 <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                     <div class="flex items-center text-yellow-800">
                                         <i class="fa-solid fa-exclamation-triangle mr-2"></i>
                                         <span class="text-sm">
                                             <strong>Video no compatible:</strong> La URL del video no es compatible con YouTube. 
                                             <a href="${lesson.video_url}" target="_blank" class="underline hover:text-yellow-900">
                                                 Ver video externo
                                             </a>
                                         </span>
                                     </div>
                                 </div>
                             ` : `
                                 <div class="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                     <div class="flex items-center text-gray-600">
                                         <i class="fa-solid fa-info-circle mr-2"></i>
                                         <span class="text-sm">
                                             <strong>Sin video:</strong> Esta lección no incluye contenido de video.
                                         </span>
                                     </div>
                                 </div>
                             `}
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
        const courseElement = event.currentTarget.closest('.border');
        const lessonsList = courseElement.querySelector('.lessons-list');
        const chevronIcon = courseElement.querySelector('.fa-chevron-down, .fa-chevron-up');

        if (this.expandedCourses.has(courseId)) {
            // Collapse
            this.expandedCourses.delete(courseId);
            lessonsList.style.maxHeight = '0';
            lessonsList.style.opacity = '0';
            chevronIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        } else {
            // Expand
            this.expandedCourses.add(courseId);
            lessonsList.style.maxHeight = lessonsList.scrollHeight + 'px';
            lessonsList.style.opacity = '1';
            chevronIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        }
    }

    handleLessonSelect(event) {
        const lessonData = JSON.parse(event.currentTarget.dataset.lesson);
        this.currentLesson = lessonData;

        // Update video content
        const videoContent = document.getElementById('video-content');
        videoContent.innerHTML = this.renderVideoContent(lessonData);

        // Update sidebar selection
        document.querySelectorAll('.lesson-item').forEach(item => {
            item.classList.remove('bg-gray-100');
            item.classList.add('hover:bg-gray-50');
        });
        event.currentTarget.classList.add('bg-gray-100');
        event.currentTarget.classList.remove('hover:bg-gray-50');

        // Important: Only attach event listeners for the new video content
        // Get all checkboxes in the video content area
        const videoContentCheckboxes = videoContent.querySelectorAll('.lesson-checkbox-main');
        videoContentCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.handleProgressUpdate.bind(this));
        });

        // Initialize YouTube player if this is a YouTube video
        const videoId = this.extractYouTubeVideoId(lessonData.video_url);
        if (videoId) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                this.initializeYouTubePlayer(lessonData.lesson_id, videoId);
            }, 100);
        }
    }

    async handleProgressUpdate(event) {
        if (!this.authService.isAuthenticated()) {
            return; // Don't handle progress if not authenticated
        }

        const checkbox = event.currentTarget;
        const lessonId = parseInt(checkbox.dataset.lessonId);
        const completed = checkbox.checked;

        // Prevent multiple rapid clicks - add debounce protection
        if (checkbox.dataset.updating === 'true') {
            return; // Already processing this checkbox
        }
        
        // Mark as updating
        checkbox.dataset.updating = 'true';
        checkbox.disabled = true;

        try {
            // Update progress on server - pass existing progress data to avoid unnecessary API calls
            await this.courseService.updateLessonProgress(lessonId, completed, this.progress);

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
        } finally {
            // Always clean up the updating state
            checkbox.dataset.updating = 'false';
            checkbox.disabled = false;
        }
    }

    updateProgressDisplay() {
        // Recalculate and update the progress bar for the current program
        const allLessons = Object.values(this.lessons).flat();
        const progressPercentage = this.courseService.calculateProgramProgress(allLessons, this.progress);

        // Update progress bar
        const progressBar = document.querySelector('.bg-gradient-to-r');
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }

        // Update header text (now using id)
        const headerText = document.getElementById('progress-header-text');
        if (headerText) {
            const programText = this.programId ? ` del programa actual` : '';
            headerText.textContent = `${this.courses.length} cursos disponibles • ${allLessons.length} lecciones totales${this.authService.isAuthenticated() ? ` • Progreso${programText}: ${progressPercentage}%` : ''}`;
        }

        // Re-render the sidebar to update per-course and per-lesson progress numbers
        const sidebar = document.querySelector('#sidebar');
        if (sidebar) {
            sidebar.innerHTML = this.renderSidebar();
            this.attachEventListeners();
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

    // Clean up event listeners to prevent duplicates and memory leaks
    removeEventListeners() {
        // Clean up YouTube players to prevent memory leaks
        if (this.youtubePlayers) {
            Object.values(this.youtubePlayers).forEach(player => {
                if (player && typeof player.destroy === 'function') {
                    player.destroy();
                }
            });
            this.youtubePlayers = {};
        }

        // Remove event listeners from existing elements before re-rendering
        const existingToggles = document.querySelectorAll('.course-toggle');
        existingToggles.forEach(toggle => {
            const newToggle = toggle.cloneNode(true);
            toggle.parentNode.replaceChild(newToggle, toggle);
        });

        const existingItems = document.querySelectorAll('.lesson-item');
        existingItems.forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
        });

        const existingCheckboxes = document.querySelectorAll('.lesson-checkbox, .lesson-checkbox-main');
        existingCheckboxes.forEach(checkbox => {
            const newCheckbox = checkbox.cloneNode(true);
            checkbox.parentNode.replaceChild(newCheckbox, checkbox);
        });
    }

    // Extract YouTube video ID from various YouTube URL formats
    extractYouTubeVideoId(url) {
        if (!url) return null;
        
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/,
            /youtube\.com\/watch\?.*&v=([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        
        return null;
    }

    // Initialize YouTube Player for a specific lesson
    initializeYouTubePlayer(lessonId, videoId) {
        // Check if YouTube API is loaded
        if (typeof YT === 'undefined' || !YT.Player) {
            // Load YouTube API if not already loaded
            this.loadYouTubeAPI().then(() => {
                this.createYouTubePlayer(lessonId, videoId);
            });
        } else {
            this.createYouTubePlayer(lessonId, videoId);
        }
    }

    // Load YouTube API
    loadYouTubeAPI() {
        return new Promise((resolve) => {
            if (window.YT) {
                resolve();
                return;
            }

            // Create a script tag for YouTube API
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // Set up callback for when API is ready
            window.onYouTubeIframeAPIReady = () => {
                resolve();
            };
        });
    }

    // Create a YouTube Player instance
    createYouTubePlayer(lessonId, videoId) {
        const playerElement = document.getElementById(`youtube-player-${lessonId}`);
        if (!playerElement) return;

        // Destroy an existing player if it exists
        if (this.youtubePlayers && this.youtubePlayers[lessonId]) {
            this.youtubePlayers[lessonId].destroy();
        }

        // Initialize a player object if it doesn't exist
        if (!this.youtubePlayers) {
            this.youtubePlayers = {};
        }

        // Create a new player
        this.youtubePlayers[lessonId] = new YT.Player(`youtube-player-${lessonId}`, {
            height: '384',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'rel': 0,
                'modestbranding': 1
            },
            events: {
                'onStateChange': async (event) => await this.onPlayerStateChange(event, lessonId)
            }
        });
    }

    // Handle YouTube player state changes
    async onPlayerStateChange(event, lessonId) {
        const playerElement = document.getElementById(`youtube-player-${lessonId}`);
        if (!playerElement) return;

        // YT.PlayerState.PLAYING = 1, YT.PlayerState.ENDED = 0
        if (event.data === 1) {
            // Video started playing - show progress indicator
            this.showVideoProgressIndicator(lessonId, true);
        } else if (event.data === 0) {
            // Video ended - mark lesson as completed
            this.showVideoProgressIndicator(lessonId, false);
            await this.autoCompleteLesson(lessonId);
        }
    }

    // Show/hide video progress indicator
    showVideoProgressIndicator(lessonId, isPlaying) {
        const playerElement = document.getElementById(`youtube-player-${lessonId}`);
        if (!playerElement) return;

        // Remove the existing indicator
        const existingIndicator = playerElement.querySelector('.video-progress-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        if (isPlaying) {
            // Add progress indicator
            const indicator = document.createElement('div');
            indicator.className = 'video-progress-indicator absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10';
            indicator.innerHTML = '<i class="fa-solid fa-play mr-1"></i>Reproduciendo...';
            playerElement.style.position = 'relative';
            playerElement.appendChild(indicator);
        }
    }

    // Automatically mark a lesson as completed when the video ends
    async autoCompleteLesson(lessonId) {
        try {
            // Check if a lesson is not already completed
            const existingProgress = this.progress.find(p => p.lesson_id === lessonId);
            if (existingProgress && existingProgress.completed) {
                return; // Already completed
            }

            // Update progress on server
            await this.courseService.updateLessonProgress(lessonId, true, this.progress);

            // Update local progress
            if (existingProgress) {
                existingProgress.completed = true;
            } else {
                this.progress.push({
                    lesson_id: lessonId,
                    completed: true
                });
            }

            // Update all checkboxes for this lesson
            const allCheckboxes = document.querySelectorAll(`[data-lesson-id="${lessonId}"]`);
            allCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
            });

            // Update progress display
            this.updateProgressDisplay();

            // Show success feedback
            await this.showProgressFeedback('¡Lección completada!', 'success');

        } catch (error) {
            console.error('Error auto-completing lesson:', error);
            await this.showProgressFeedback('No se pudo marcar la lección como completada', 'error');
        }
    }
}