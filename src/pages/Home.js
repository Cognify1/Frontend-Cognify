// Home component
export class HomePage {
    constructor() {
        this.container = document.getElementById('main-content');
    }

    render() {
        this.container.innerHTML = `
            <div class="bg-gradient-to-br from-blue-600 via-sky-400 to-green-500 min-h-screen">
                <!-- Section Hero -->
                <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div class="text-center">
                        <!-- Badge -->
                        <div class="inline-flex items-center px-4 py-2 border border-white text-white rounded-full text-sm font-bold mb-8 mt-20">
                            <i class="fa-solid fa-brain mr-2"></i>
                            Plataforma de Aprendizaje con IA
                        </div>

                        <!-- Title -->
                        <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">
                            <span class="text-gradient-green">Cognify:</span> Aprende, practica y lidera, todo en un solo lugar.
                        </h1>

                        <!-- Description -->
                        <p class="text-lg md:text-xl text-white mb-12 max-w-3xl mx-auto">
                            Domina conceptos técnicos con explicaciones personalizadas, ejercicios prácticos y un mentor IA que se adapta a tu nivel de conocimiento.
                        </p>
                    </div>

                    <!-- Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                        <!-- Programs Card -->
                        <a href="#/programs" class="block perspective-1000 group cursor-pointer">
                            <div class="relative w-full h-64 transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
                                <!-- Front Face -->
                                <div class="absolute inset-0 w-full h-full rounded-lg shadow-lg bg-white/10 backdrop-blur-md border-2 border-white/30 backface-hidden flex flex-col items-center justify-center text-center p-8">
                                    <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/20">
                                        <i class="fa-solid fa-book-atlas text-white text-3xl"></i>
                                    </div>
                                    <h3 class="text-2xl font-bold text-white">Programas</h3>
                                </div>
                                <!-- Back Face -->
                                <div class="absolute inset-0 w-full h-full rounded-lg shadow-lg bg-white/10 backdrop-blur-md border-2 border-white/30 backface-hidden rotate-y-180 flex flex-col items-center justify-center text-center p-8">
                                    <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/20">
                                        <i class="fa-solid fa-book-atlas text-white text-3xl"></i>
                                    </div>
                                    <h3 class="text-xl font-bold text-white mb-4">Programas de Aprendizaje</h3>
                                    <p class="text-white text-sm">
                                        Explora programas de formación estructurados en diferentes tecnologías. Inscríbete, sigue tus lecciones paso a paso y mide tu progreso fácilmente.
                                    </p>
                                </div>
                            </div>
                        </a>

                        <!-- Terminal Card -->
                        <a href="#/terminal" class="block perspective-1000 group cursor-pointer">
                            <div class="relative w-full h-64 transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
                                <!-- Front Face -->
                                <div class="absolute inset-0 w-full h-full rounded-lg shadow-lg bg-white/10 backdrop-blur-md border-2 border-white/30 backface-hidden flex flex-col items-center justify-center text-center p-8">
                                    <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/20">
                                        <i class="fa-solid fa-terminal text-white text-3xl"></i>
                                    </div>
                                    <h3 class="text-2xl font-bold text-white">Terminal</h3>
                                </div>
                                <!-- Back Face -->
                                <div class="absolute inset-0 w-full h-full rounded-lg shadow-lg bg-white/10 backdrop-blur-md border-2 border-white/30 backface-hidden rotate-y-180 flex flex-col items-center justify-center text-center p-8">
                                    <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/20">
                                        <i class="fa-solid fa-terminal text-white text-3xl"></i>
                                    </div>
                                    <h3 class="text-xl font-bold text-white mb-4">Terminal Interactivo</h3>
                                    <p class="text-white text-sm">
                                        Practica en tiempo real con nuestra terminal integrada. Pon a prueba tus conocimientos sin necesidad de instalar nada adicional.
                                    </p>
                                </div>
                            </div>
                        </a>

                        <!-- Chat IA Card -->
                        <a href="#/chat" class="block perspective-1000 group cursor-pointer">
                            <div class="relative w-full h-64 transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
                                <!-- Front Face -->
                                <div class="absolute inset-0 w-full h-full rounded-lg shadow-lg bg-white/10 backdrop-blur-md border-2 border-white/30 backface-hidden flex flex-col items-center justify-center text-center p-8">
                                    <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/20">
                                        <i class="fa-solid fa-comment text-white text-3xl"></i>
                                    </div>
                                    <h3 class="text-2xl font-bold text-white">TutorIA</h3>
                                </div>
                                <!-- Back Face -->
                                <div class="absolute inset-0 w-full h-full rounded-lg shadow-lg bg-white/10 backdrop-blur-md border-2 border-white/30 backface-hidden rotate-y-180 flex flex-col items-center justify-center text-center p-8">
                                    <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/20">
                                        <i class="fa-solid fa-comment text-white text-3xl"></i>
                                    </div>
                                    <h3 class="text-xl font-bold text-white mb-4">IA Personalizada</h3>
                                    <p class="text-white text-sm">
                                        Cuenta con un mentor inteligente 24/7. Haz preguntas, recibe explicaciones personalizadas y resuelve tus dudas al instante.
                                    </p>
                                </div>
                            </div>
                        </a>
                    </div>

                </section>
            </div>
        `;
    }
}