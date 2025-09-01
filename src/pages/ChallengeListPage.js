import { ChallengeService } from '../services/challengeService.js';
import Swal from 'sweetalert2';

export class ChallengeListPage {
    constructor(userId) {
        this.userId = userId;
        this.challengeService = new ChallengeService();
        this.container = document.getElementById('main-content');
    }

    async render(programId) {
        // Checks inscriptions
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

        this.container.innerHTML = `
            <div class="bg-gradient-to-br from-blue-600 via-sky-400 to-green-500 min-h-screen mx-auto px-4 py-12">
                <h2 class="text-3xl font-bold text-white mb-8 text-center">Retos del Programa</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${challenges.map(ch => `
                        <div class="rounded-lg shadow-lg p-6 bg-white/10 border-2 border-white/30 hover:border-white/60 cursor-pointer transition"
                             data-challenge-id="${ch.challenge_id}">
                            <h3 class="text-xl font-bold text-white mb-2">${ch.title}</h3>
                            <p class="text-white mb-2">${ch.description.substring(0, 80)}...</p>
                            <span class="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">${ch.difficulty}</span>
                        </div>
                    `).join('')}
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
}