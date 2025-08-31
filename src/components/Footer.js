// Footer component
export class FooterComponent {
    constructor() {
        this.container = document.getElementById('footer-container');
    }

    render() {
        this.container.innerHTML = `
            <footer class="bg-gray-800 text-white">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <!-- Company info -->
                        <div class="col-span-1 md:col-span-2">
                            <div class="flex items-center space-x-2 mb-4">
                                <img src="/Frontend-Cognify/images/logo.png" alt="Cognify Logo" class="h-12 w-12 rounded-full">
                                <span class="text-xl font-bold">Cognify</span>
                            </div>
                            <p class="text-gray-400 mb-4">
                                Plataforma de aprendizaje con IA que te ayuda a dominar conceptos de programación con explicaciones personalizadas y ejercicios prácticos.
                            </p>
                            <div class="flex space-x-4">
                                <a href="https://github.com/Cognify1" target="_blank" class="text-gray-400 hover:text-white transition-colors duration-200">
                                    <i class="fab fa-github text-3xl"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Quick link -->
                        <div>
                            <h3 class="text-lg font-bold mb-4">Enlaces Rápidos</h3>
                            <ul class="space-y-2">
                                <li><a href="#/programs" class="text-gray-400 hover:text-white font-medium transition-colors duration-200">Programas</a></li>
                                <li><a href="#/terminal" class="text-gray-400 hover:text-white font-medium transition-colors duration-200">Terminal</a></li>
                                <li><a href="#/chat" class="text-gray-400 hover:text-white font-medium transition-colors duration-200">Chat IA</a></li>
                            </ul>
                        </div>
                    </div>

                    <div class="border-t border-gray-700 pt-8 mt-8 text-center text-white">
                        <p>&copy; 2024 Cognify. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}