import { ChallengeService } from '../services/challengeService.js';
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

        this.container.innerHTML = `
            <div class="bg-gradient-to-br from-blue-600 via-sky-400 to-green-500 min-h-screen mx-auto px-10 py-12">
                <div class="bg-white/10 rounded-lg p-8 border-2 border-white/30">
                    <h2 class="text-3xl font-bold text-white mb-4">${challenge.title}</h2>
                    <p class="text-white mb-4">${challenge.description}</p>
                    <div class="mb-4">
                        <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mr-2">${challenge.difficulty}</span>
                        <span class="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">${challenge.type}</span>
                    </div>
                    ${passed ? `
                        <div class="flex items-center mb-6">
                            <span class="inline-block bg-yellow-400 text-white px-4 py-2 rounded-full font-bold mr-2">
                                <i class="fa-solid fa-medal mr-2"></i>¡Reto completado!
                            </span>
                        </div>
                    ` : ''}
                    <div class="mb-6">
                        <label class="block text-white font-bold mb-2">Tu solución (define una función <code>solve</code>):</label>
                        <textarea id="solution-code" class="w-full h-48 p-4 rounded bg-black/80 text-green-200 font-mono text-base border-2 border-white/20 focus:border-white/60 transition" placeholder="function solve(...) { ... }" ${passed ? 'disabled' : ''}></textarea>
                    </div>
                    <button id="submit-solution" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition" ${passed ? 'disabled' : ''}>
                        Enviar solución
                    </button>
                    <div id="challenge-feedback" class="mt-6"></div>
                </div>
            </div>
        `;

        if (!passed) {
            document.getElementById('submit-solution').addEventListener('click', () => this.handleSubmit(challenge));
        }
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

            // Feedback
            const feedbackDiv = document.getElementById('challenge-feedback');
            feedbackDiv.innerHTML = `
                <div class="bg-black/60 rounded p-4 text-white">
                    <h4 class="font-bold mb-2">Resultados:</h4>
                    <ul>
                        ${data.results.map(tc => `
                            <li class="mb-1">
                                <span class="font-mono">Entrada: ${JSON.stringify(tc.input)}</span> |
                                <span class="font-mono">Esperado: ${JSON.stringify(tc.expected)}</span> |
                                <span class="font-mono">Salida: ${JSON.stringify(tc.output)}</span>
                                <span class="ml-2 ${tc.pass ? 'text-green-400' : 'text-red-400'}">
                                    ${tc.pass ? '✔️' : '❌'}
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;

            if (data.passed) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Reto completado!',
                    text: '¡Felicidades! Has pasado todos los casos de prueba.',
                    confirmButtonColor: '#3085d6'
                }).then(() => this.render(challenge.challenge_id));
            } else if (this.attempts >= this.maxAttempts) {
                await Swal.fire({
                    icon: 'info',
                    title: 'Pista',
                    text: challenge.hint || 'Intenta analizar el problema nuevamente.',
                    confirmButtonColor: '#3085d6'
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
}