// Programs page component
import {ProgramService} from '../services/programService.js';
import {CourseService} from '../services/courseService.js';
import {AuthService} from '../services/auth.js';
import {ProgressTracker} from '../components/Progress.js';
import Swal from 'sweetalert2';

export class ProgramsPage {
    constructor() {
        this.container = document.getElementById('main-content');
        this.programService = new ProgramService();
        this.courseService = new CourseService();
        this.authService = new AuthService();
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
                const progress = await this.courseService.getUserProgress();

                return {
                    programId: enrollment.program_id,
                    lessons: lessons,
                    progress: progress
                };
            });

            const progressResults = await Promise.all(progressPromises);

            // Store progress data
            progressResults.forEach(result => {
                this.programsProgress[result.programId] = {
                    lessons: result.lessons,
                    progress: result.progress
                };
            });
        } catch (error) {
            console.error('Error loading progress data:', error);
            // Don't throw - progress data is optional
        }
    }

    showLoading() {
        this.container.innerHTML = `
            <div class="min-h-screen bg-gray-50 flex items-center justify-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-gray-600">Cargando programas...</p>
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
        this.container.innerHTML = `
            <div class="min-h-screen bg-gray-50 py-12">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <!-- Debug Info (remove in production) -->
                    <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                        <p><strong>Debug Info:</strong></p>
                        <p>Usuario actual: ${JSON.stringify(this.authService.getCurrentUser())}</p>
                        <p>Programas cargados: ${this.programs.length}</p>
                        <p>Inscripciones del usuario: ${this.enrollments.length}</p>
                        <p>Inscripciones: ${JSON.stringify(this.enrollments)}</p>
                        <button onclick="localStorage.clear(); location.reload();" class="bg-red-500 text-white px-3 py-1 rounded mt-2">
                            Limpiar Caché y Recargar
                        </button>
                        <button onclick="console.log('Current user:', JSON.parse(localStorage.getItem('cognify_user')));" class="bg-blue-500 text-white px-3 py-1 rounded mt-2 ml-2">
                            Log User Data
                        </button>
                    </div>

                    <!-- Header -->
                    <div class="text-center mb-12">
                        <h1 class="text-4xl font-bold text-gray-900 mb-4">
                            <i class="fa-solid fa-book-atlas mr-3 text-blue-600"></i>
                            Programas de Aprendizaje
                        </h1>
                        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
                            Descubre nuestros programas especializados diseñados para llevarte desde principiante hasta experto 
                            en las tecnologías más demandadas del mercado.
                        </p>
                        
                        <!-- User Info -->
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 max-w-md mx-auto">
                            <p class="text-blue-800">
                                <i class="fa-solid fa-user mr-2"></i>
                                Sesión activa: <strong>${this.authService.getCurrentUser()?.name || 'Usuario'}</strong>
                            </p>
                            <p class="text-blue-600 text-sm">
                                ${this.authService.getCurrentUser()?.email || 'Sin email'}
                            </p>
                        </div>
                    </div>

                    <!-- Programs Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        console.log('ProgramsPage: Rendering card for program:', program.program_id);

        const isEnrolled = this.enrollments.some(enrollment =>
            enrollment.program_id === program.program_id
        );

        return `
        <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <!-- Card Header -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div class="flex items-center justify-between">
                    <div class="bg-white/20 rounded-full p-3">
                        <i class="fa-solid fa-graduation-cap text-2xl text-white"></i>
                    </div>
                    ${isEnrolled ? `
                        <span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
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
                            onclick="window.location.hash = '#/courses'"
                            class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200"
                        >
                            <i class="fa-solid fa-play mr-2"></i>Ver Cursos
                        </button>
                    ` : `
                        <button
                            data-program-id="${program.program_id}"
                            data-program-title="${program.title}"
                            class="enroll-btn flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200"
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
                <h2 class="text-2xl font-bold text-gray-900 mb-8">
                    <i class="fa-solid fa-user-graduate mr-2 text-green-600"></i>
                    Mis Programas Activos
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${enrolledPrograms.map(program => this.renderEnrolledProgramCard(program)).join('')}
                </div>
            </div>
        `;
    }

    renderEnrolledProgramCard(program) {
        const progressData = this.programsProgress[program.program_id];
        let progressContent = '';

        if (progressData) {
            progressContent = this.progressTracker.renderCompactProgress(
                progressData.lessons,
                progressData.progress
            );
        }

        return `
            <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-green-500">
                <div class="p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">${program.title}</h3>
                    <p class="text-gray-600 text-sm mb-4">${program.description}</p>
                    
                    ${progressContent ? `<div class="mb-4">${progressContent}</div>` : ''}
                    
                    <button 
                        onclick="window.location.hash = '#/courses'"
                        class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
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

        console.log('ProgramsPage: Handling enrollment for program:', programId);
        console.log('ProgramsPage: Current user:', this.authService.getCurrentUser());

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
                console.log('ProgramsPage: User confirmed enrollment');

                // Enroll user
                const enrollmentResult = await this.programService.enrollInProgram(programId);
                console.log('ProgramsPage: Enrollment successful:', enrollmentResult);

                // Show a success message
                await Swal.fire({
                    title: '¡Inscripción exitosa!',
                    text: `Te has inscrito correctamente al programa "${programTitle}".`,
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'Continuar'
                });

                // Reload page to update enrollment status
                console.log('ProgramsPage: Reloading page to show updated status');
                await this.render();
            } else {
                console.log('ProgramsPage: User cancelled enrollment');
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