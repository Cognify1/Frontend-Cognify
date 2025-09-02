import {ChallengeService} from '../services/challengeService.js';
import Swal from 'sweetalert2';

export class ChallengeDetailPage {
    constructor(userId) {
        this.userId = userId;
        this.challengeService = new ChallengeService();
        this.container = document.getElementById('main-content');
        this.attempts = 0;
        this.maxAttempts = 3;
    }

    async render(challengeId) {
        const challenge = await this.challengeService.getChallengeById(challengeId);
        if (!challenge) {
            this.container.innerHTML = `<div class="text-center py-20 text-white">Reto no encontrado.</div>`;
            return;
        }

        const lastSubmission = await this.challengeService.getLastSubmission(challengeId, this.userId);
        const passed = lastSubmission && lastSubmission.passed;

        // Get program ID from URL for back navigation
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const programId = urlParams.get('program');

        this.container.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-blue-600 via-sky-400 to-green-500 py-2">
                <!-- Header -->
                <div class="bg-white/10 backdrop-blur-sm border-b border-white/20">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-20">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <h1 class="text-3xl font-bold text-white">${challenge.title}</h1>
                            </div>
                            ${passed ? `
                                <div class="flex items-center bg-green-500/70 text-green-100 px-4 py-2 rounded-lg border border-green-400/30">
                                    <i class="fa-solid fa-check-circle mr-2"></i>
                                    <span class="font-semibold">Completado</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        <!-- Problem Description -->
                        <div class="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                            <div class="p-6">
                                <div class="flex items-center justify-between mb-4">
                                    <h2 class="text-xl font-semibold text-gray-900">Descripción del Problema</h2>
                                    <div class="flex items-center space-x-2">
                                        ${this.renderDifficultyBadge(challenge.difficulty)}
                                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                                            <i class="fa-solid fa-code mr-1"></i>
                                            ${challenge.type || 'Algoritmo'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="prose max-w-none">
                                    <p class="text-gray-700 leading-relaxed">${challenge.description}</p>
                                </div>

                                ${challenge.hint ? `
                                    <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <h3 class="text-sm font-semibold text-yellow-800 mb-2">
                                            <i class="fa-solid fa-lightbulb mr-1"></i>Pista
                                        </h3>
                                        <p class="text-yellow-700 text-sm">${challenge.hint}</p>
                                    </div>
                                ` : ''}

                                ${challenge.solution_url ? `
                                    <div class="mt-6">
                                        <a href="${challenge.solution_url}" target="_blank" class="inline-flex items-center text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                                            <i class="fa-solid fa-external-link-alt mr-1"></i>
                                            Ver solución de referencia
                                        </a>
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Code Editor -->
                        <div class="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                            <div class="border-b border-white/20 px-6 py-4">
                                <div class="flex items-center justify-between">
                                    <h2 class="text-xl font-semibold text-gray-900">Editor de Código</h2>
                                    <div class="flex items-center space-x-2">
                                        <i class="fa-solid fa-code text-cyan-500 text-lg"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="p-6">
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Tu solución (define una función <code class="bg-gray-100 px-1 rounded">solve</code>):
                                    </label>
                                    <div class="relative">
                                        <textarea 
                                            id="solution-code" 
                                            class="w-full h-64 p-4 rounded-lg bg-gray-900 text-green-400 font-mono text-sm border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all resize-none" 
                                            placeholder="function solve(param1, param2) {
    // Tu código aquí
    return resultado;
}"
                                            spellcheck="false"
                                        >${lastSubmission ? lastSubmission.solution_code || '' : ''}</textarea>
                                        <div class="absolute top-2 right-2">
                                            <button onclick="document.getElementById('solution-code').value = ''" class="text-gray-400 hover:text-gray-600 p-1" title="Limpiar código">
                                                <i class="fa-solid fa-eraser"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex items-center justify-between">
                                    <div class="text-sm text-gray-500">
                                        <i class="fa-solid fa-info-circle mr-1"></i>
                                        ${passed ? 'Puedes seguir editando y probando tu solución' : 'Escribe tu código y haz clic en "Ejecutar"'}
                                    </div>
                                    <button 
                                        id="submit-solution" 
                                        class="inline-flex items-center px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                                    >
                                        <i class="fa-solid fa-play mr-2"></i>
                                        Ejecutar Código
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Results Section -->
                    <div id="challenge-feedback" class="mt-6"></div>

                    <!-- Back Button -->
                    ${programId ? `
                        <div class="text-center mt-12">
                            <a href="#/challenges/program/${programId}" class="inline-flex items-center bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                                <i class="fa-solid fa-arrow-left mr-2"></i>Volver a Retos
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Always allow editing and submitting, even after completion
        document.getElementById('submit-solution').addEventListener('click', () => this.handleSubmit(challenge));
    }

    async handleSubmit(challenge) {
        const code = document.getElementById('solution-code').value;
        if (!code.trim()) {
            await Swal.fire('Error', 'Debes ingresar tu solución.', 'error');
            return;
        }

        try {
            const data = await this.challengeService.submitSolution(challenge.challenge_id, this.userId, code);
            this.attempts += 1;

            // Feedback with improved UI
            const feedbackDiv = document.getElementById('challenge-feedback');
            const passedTests = data.results.filter(tc => tc.pass).length;
            const totalTests = data.results.length;
            
            feedbackDiv.innerHTML = `
                <div class="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-semibold text-gray-900">Resultados de Ejecución</h3>
                            <div class="flex items-center space-x-2">
                                <span class="text-sm text-gray-600">${passedTests}/${totalTests} casos pasados</span>
                                ${data.passed ? 
                                    '<i class="fa-solid fa-check-circle text-green-500 text-xl"></i>' : 
                                    '<i class="fa-solid fa-times-circle text-red-500 text-xl"></i>'
                                }
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            ${data.results.map((tc, index) => `
                                <div class="border rounded-lg p-4 ${tc.pass ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}">
                                    <div class="flex items-center justify-between mb-2">
                                        <h4 class="font-semibold text-gray-900">Caso de Prueba ${index + 1}</h4>
                                        <span class="flex items-center ${tc.pass ? 'text-green-600' : 'text-red-600'}">
                                            <i class="fa-solid ${tc.pass ? 'fa-check' : 'fa-times'} mr-1"></i>
                                            ${tc.pass ? 'Correcto' : 'Incorrecto'}
                                        </span>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span class="font-medium text-gray-700">Entrada:</span>
                                            <code class="block mt-1 p-2 bg-gray-100 rounded font-mono">${JSON.stringify(tc.input)}</code>
                                        </div>
                                        <div>
                                            <span class="font-medium text-gray-700">Esperado:</span>
                                            <code class="block mt-1 p-2 bg-gray-100 rounded font-mono">${JSON.stringify(tc.expected)}</code>
                                        </div>
                                        <div>
                                            <span class="font-medium text-gray-700">Tu salida:</span>
                                            <code class="block mt-1 p-2 bg-gray-100 rounded font-mono">${JSON.stringify(tc.output)}</code>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        ${data.passed ? `
                            <div class="mt-6 p-4 bg-green-100 border border-green-200 rounded-lg">
                                <div class="flex items-center">
                                    <i class="fa-solid fa-trophy text-green-600 text-xl mr-3"></i>
                                    <div>
                                        <h4 class="font-semibold text-green-800">¡Felicidades!</h4>
                                        <p class="text-green-700 text-sm">Has completado este reto exitosamente. Puedes seguir editando tu código para optimizarlo.</p>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            if (data.passed) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Reto completado!',
                    text: '¡Felicidades! Has pasado todos los casos de prueba. Puedes seguir optimizando tu código.',
                    confirmButtonColor: '#0891b2'
                });
            } else if (this.attempts >= this.maxAttempts) {
                await Swal.fire({
                    icon: 'info',
                    title: 'Pista',
                    text: challenge.hint || 'Intenta analizar el problema nuevamente.',
                    confirmButtonColor: '#0891b2'
                });
            }
        } catch (e) {
            await Swal.fire('Error', `
            <div class="text-lg text-gray-700 mb-3">
              Tu sintaxis está incorrecta, debes seguir la siguiente sintaxis:
            </div>
            <pre class="bg-gray-900 text-green-500 font-mono text-lg font-medium p-3 rounded-md overflow-auto whitespace-pre">
                <code>function solve(argumentos) {
                  //Tu lógica para resolver el reto
                  return ...;
                }</code>
            </pre>
            `, 'error');
        }
    }

    renderDifficultyBadge(difficulty) {
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

        const difficultyClass = difficultyColors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
        const difficultyIcon = difficultyIcons[difficulty] || 'fa-code';

        return `
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${difficultyClass}">
                <i class="fa-solid ${difficultyIcon} mr-1"></i>
                ${difficulty}
            </span>
        `;
    }
}