import {ChallengeService} from '../services/challengeService.js';
import Swal from 'sweetalert2';

export class ChallengeListPage {
    constructor(userId) {
        this.userId = userId;
        this.challengeService = new ChallengeService();
        this.container = document.getElementById('main-content');
    }

    async render(programId) {
        // Check inscriptions
        const enrolled = await this.challengeService.getUserEnrollment(this.userId, programId);
        if (!enrolled) {
            this.container.innerHTML = `
                <div class="text-center py-20">
                    <h2 class="text-2xl text-white font-bold mb-4">Debes estar inscrito en este programa para ver los retos.</h2>
                </div>
            `;
            return;
        }

        const challenges = await this.challengeService.getChallengesByProgram(programId);
        
        // Get completion status for each challenge
        const challengesWithStatus = await Promise.all(
            challenges.map(async (challenge) => {
                try {
                    const lastSubmission = await this.challengeService.getLastSubmission(challenge.challenge_id, this.userId);
                    return {
                        ...challenge,
                        isCompleted: lastSubmission && lastSubmission.passed
                    };
                } catch (error) {
                    return {
                        ...challenge,
                        isCompleted: false
                    };
                }
            })
        );

        this.container.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-blue-600 via-sky-400 to-green-500 py-12">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                    <!-- Header -->
                    <div class="text-center mb-12">
                        <h1 class="text-4xl font-bold text-white mb-4">
                            <i class="fa-solid fa-code mr-3 text-white"></i>
                            Retos de Programación
                        </h1>
                        <p class="text-lg text-white max-w-3xl mx-auto">
                            Pon a prueba tus habilidades con estos desafíos de programación diseñados para mejorar tu lógica y conocimientos.
                        </p>
                    </div>

                    <!-- Challenges Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${challengesWithStatus.map(ch => this.renderChallengeCard(ch, programId)).join('')}
                    </div>

                    <!-- Back Button -->
                    <div class="text-center mt-12">
                        <a href="#/programs" class="inline-flex items-center bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                            <i class="fa-solid fa-arrow-left mr-2"></i>Volver a Programas
                        </a>
                    </div>
                </div>
            </div>
        `;

        this.container.querySelectorAll('[data-challenge-id]').forEach(card => {
            card.addEventListener('click', () => {
                const challengeId = card.getAttribute('data-challenge-id');
                window.location.hash = `/challenge/${challengeId}?program=${programId}`;
            });
        });
    }

    renderChallengeCard(challenge, programId) {
        const difficultyColors = {
            'Fácil': 'bg-green-100 text-green-800 border-green-200',
            'Medio': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Difícil': 'bg-red-100 text-red-800 border-red-200'
        };

        const difficultyIcons = {
            'Fácil': 'fa-star',
            'Medio': 'fa-star-half-alt',
            'Difícil': 'fa-fire'
        };

        const difficultyClass = difficultyColors[challenge.difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
        const difficultyIcon = difficultyIcons[challenge.difficulty] || 'fa-code';

        return `
            <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 ${challenge.isCompleted ? 'border-green-500' : 'border-cyan-500'} cursor-pointer relative"
                 data-challenge-id="${challenge.challenge_id}">
                ${challenge.isCompleted ? `
                    <div class="absolute top-3 right-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                        <i class="fa-solid fa-check-circle mr-1"></i>Completado
                    </div>
                ` : ''}
                <div class="p-6 ${challenge.isCompleted ? 'pr-24' : ''}">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-lg font-semibold text-gray-900">${challenge.title}</h3>
                        <i class="fa-solid fa-code ${challenge.isCompleted ? 'text-green-600' : 'text-cyan-600'}"></i>
                    </div>
                    
                    <p class="text-gray-600 text-sm mb-4 line-clamp-3">${challenge.description}</p>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${difficultyClass}">
                                <i class="fa-solid ${difficultyIcon} mr-1"></i>
                                ${challenge.difficulty}
                            </span>
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 border border-cyan-200">
                                <i class="fa-solid fa-laptop-code mr-1"></i>
                                ${challenge.type || 'Algoritmo'}
                            </span>
                        </div>
                        <i class="fa-solid fa-arrow-right ${challenge.isCompleted ? 'text-green-600' : 'text-cyan-600'}"></i>
                    </div>
                </div>
            </div>
        `;
    }
}