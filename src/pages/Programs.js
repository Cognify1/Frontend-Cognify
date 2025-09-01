// Programs page component
import {ProgramService} from '../services/programService.js';
import {CourseService} from '../services/courseService.js';
import {ProgressTracker} from '../components/Progress.js';
import Swal from 'sweetalert2';

export class ProgramsPage {
    constructor() {
        this.container = document.getElementById('main-content');
        this.programService = new ProgramService();
        this.courseService = new CourseService();
        this.progressTracker = new ProgressTracker();
        this.programs = [];
        this.enrollments = [];
        this.programsProgress = {}; // Store progress for each program
    }

    async render() {
        this.showLoading();

        try {
            // Load programs and user enrollments
            await this.loadData();
            this.renderContent();
        } catch (error) {
            console.error('Error rendering programs page:', error);
            this.showError('No se pudieron cargar los programas. Por favor, inténtalo de nuevo.');
        }
    }

    async loadData() {
        try {
            // Load programs first
            this.programs = await this.programService.getAllPrograms();

            // Load enrollments separately with error handling
            try {
                this.enrollments = await this.programService.getUserEnrollments();
            } catch (enrollmentError) {
                console.warn('ProgramsPage: Could not load enrollments:', enrollmentError);
                this.enrollments = []; // Set an empty array if you can't load enrollments
            }

            // Load progress data for enrolled programs
            if (this.enrollments.length > 0) {
                await this.loadProgressData();
            }
        } catch (error) {
            console.error('ProgramsPage: Error in loadData:', error);
            throw new Error('Error loading data: ' + error.message);
        }
    }

    async loadProgressData() {
        try {
            const progressPromises = this.enrollments.map(async (enrollment) => {
                const courses = await this.courseService.getCoursesByProgram(enrollment.program_id);
                const lessonsPromises = courses.map(course =>
                    this.courseService.getLessonsByCourse(course.course_id)
                );
                const lessonsArrays = await Promise.all(lessonsPromises);
                const lessons = lessonsArrays.flat();
                // Get progress specifically for this program
                const progress = await this.courseService.getUserProgressByProgram(enrollment.program_id);
                const badges = this.progressTracker.getAchievementBadges(lessons, progress);

                return {
                    programId: enrollment.program_id,
                    lessons: lessons,
                    progress: progress,
                    badges: badges
                };
            });

            const progressResults = await Promise.all(progressPromises);

            // Store progress data
            progressResults.forEach(result => {
                this.programsProgress[result.programId] = {
                    lessons: result.lessons,
                    progress: result.progress,
                    badges: result.badges
                };
            });
        } catch (error) {
            console.error('Error loading progress data:', error);
        }
    }

    showLoading() {
        this.container.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-blue-600 via-sky-400 to-green-500 flex items-center justify-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-14 w-14 border-b-4 border-white mx-auto mb-4"></div>
                    <p class="text-white text-xl">Cargando programas...</p>
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
        this.container.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-blue-600 via-sky-400 to-green-500 py-12">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">

                    <!-- Header -->
                    <div class="text-center mb-12">
                        <h1 class="text-4xl font-bold text-white mb-4">
                            <i class="fa-solid fa-book-atlas mr-3 text-white"></i>
                            Programas de Aprendizaje
                        </h1>
                        <p class="text-lg text-white max-w-3xl mx-auto">
                            Descubre nuestros programas especializados diseñados para llevarte desde principiante hasta experto 
                            en las tecnologías más demandadas del mercado.
                        </p>
                    </div>

                    <!-- Programs Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-8">
                        ${this.renderPrograms()}
                    </div>

                    <!-- Enrolled Programs Section -->
                    ${this.enrollments.length > 0 ? this.renderEnrolledPrograms() : this.renderNoEnrollments()}
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderNoEnrollments() {
        return `
            <div class="mt-16">
                <div class="text-center bg-gray-100 rounded-lg p-8">
                    <i class="fa-solid fa-graduation-cap text-4xl text-gray-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Aún no tienes inscripciones</h3>
                    <p class="text-gray-500">Inscríbete en un programa para comenzar tu aprendizaje</p>
                </div>
            </div>
        `;
    }

    renderPrograms() {
        if (!this.programs || this.programs.length === 0) {
            return `
                <div class="col-span-full text-center py-12">
                    <i class="fa-solid fa-book text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-500">No hay programas disponibles en este momento.</p>
                </div>
            `;
        }

        return this.programs.map(program => this.renderProgramCard(program)).join('');
    }

    renderProgramCard(program) {

        const isEnrolled = this.enrollments.some(enrollment =>
            enrollment.program_id === program.program_id
        );

        return `
        <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <!-- Card Header -->
            <div class="bg-gradient-to-r from-blue-600 to-green-600 p-6">
                <div class="flex items-center justify-between">
                    <div class="bg-white/20 rounded-full p-3">
                        <i class="fa-solid fa-graduation-cap text-2xl text-white"></i>
                    </div>
                    ${isEnrolled ? `
                        <span class="bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            <i class="fa-solid fa-check mr-1"></i>Inscrito
                        </span>
                    ` : `
                        <span class="bg-gray-500/20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            <i class="fa-solid fa-plus mr-1"></i>Disponible
                        </span>
                    `}
                </div>
            </div>

            <!-- Card Content -->
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3">${program.title}</h3>
                <p class="text-gray-600 mb-6 line-clamp-3">${program.description}</p>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                    ${isEnrolled ? `
                        <button
                            onclick="window.location.hash = '#/courses/program/${program.program_id}'"
                            class="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200"
                        >
                            <i class="fa-solid fa-play mr-2"></i>Ver Cursos
                        </button>
                    ` : `
                        <button
                            data-program-id="${program.program_id}"
                            data-program-title="${program.title}"
                            class="enroll-btn flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200"
                        >
                            <i class="fa-solid fa-user-plus mr-2"></i>Inscribirme
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
    }

    renderEnrolledPrograms() {
        const enrolledPrograms = this.programs.filter(program =>
            this.enrollments.some(enrollment => enrollment.program_id === program.program_id)
        );

        return `
            <div class="mt-16">
                <h2 class="text-center text-2xl font-bold text-white mb-8">
                    <i class="fa-solid fa-user-graduate mr-2 text-white"></i>
                    Mis Programas Activos
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-6">
                    ${enrolledPrograms.map(program => this.renderEnrolledProgramCard(program)).join('')}
                </div>
            </div>
        `;
    }

    renderEnrolledProgramCard(program) {
        const progressData = this.programsProgress[program.program_id];
        let progressContent = '';
        let badgesContent = '';

        if (progressData) {
            progressContent = this.progressTracker.renderCompactProgress(
                progressData.lessons,
                progressData.progress
            );
            badgesContent = this.progressTracker.renderAchievementBadges(progressData.badges);
        }

        return `
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-cyan-500">
            <div class="p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${program.title}</h3>
                <p class="text-gray-600 text-sm mb-4">${program.description}</p>

                ${progressContent ? `<div class="mb-4">${progressContent}</div>` : ''}
                ${badgesContent ? `<div class="mb-4">${badgesContent}</div>` : ''}

                <button
                    onclick="window.location.hash = '#/courses/program/${program.program_id}'"
                    class="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                    <i class="fa-solid fa-arrow-right mr-2"></i>Ver Cursos
                </button>
            </div>
        </div>
    `;
    }

    attachEventListeners() {
        // Enroll buttons
        const enrollBtns = document.querySelectorAll('.enroll-btn');
        enrollBtns.forEach(btn => {
            btn.addEventListener('click', this.handleEnrollment.bind(this));
        });
    }

    async handleEnrollment(event) {
        const button = event.currentTarget;
        const programId = parseInt(button.dataset.programId);
        const programTitle = button.dataset.programTitle;

        // Disable button to prevent double clicks
        button.disabled = true;
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Procesando...';

        try {
            // Show confirmation dialog
            const result = await Swal.fire({
                title: '¿Inscribirse al programa?',
                text: `¿Estás seguro que quieres inscribirte al programa "${programTitle}"?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Sí, inscribirme',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {

                // Enroll user
                await this.programService.enrollInProgram(programId);

                // Show a success message
                await Swal.fire({
                    title: '¡Inscripción exitosa!',
                    text: `Te has inscrito correctamente al programa "${programTitle}".`,
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'Continuar'
                });

                // Reload page to update enrollment status
                await this.render();
            } else {
                // Re-enable button if cancelled
                button.disabled = false;
                button.innerHTML = originalContent;
            }

        } catch (error) {
            console.error('ProgramsPage: Enrollment error:', error);

            // Show error message
            await Swal.fire({
                title: 'Error en la inscripción',
                text: error.message || 'No se pudo completar la inscripción. Por favor, inténtalo de nuevo.',
                icon: 'error',
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Entendido'
            });

            // Re-enable button
            button.disabled = false;
            button.innerHTML = originalContent;
        }
    }
}