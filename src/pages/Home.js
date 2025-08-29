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
                            Aprende a <span class="text-gradient-green">Programar</span> con Inteligencia Artificial
                        </h1>

                        <!-- Description -->
                        <p class="text-lg md:text-xl text-white mb-12 max-w-3xl mx-auto">
                            Domina conceptos técnicos con explicaciones personalizadas, ejercicios prácticos y un mentor IA que se adapta a tu nivel de conocimiento.
                        </p>
                    </div>

                    <!-- Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                        <div class="rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300 bg-white/10 backdrop-blur-md border-2 border-white/30 transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:border-white/60">
                            <div class="bg-blue-0 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i class="fa-solid fa-code text-white text-2xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-white mb-4">Terminal</h3>
                            <p class="text-white">
                                Practica código en tiempo real con retroalimentación inmediata y guía de nuestro sistema IA.
                            </p>
                        </div>

                        <div class="rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300 bg-white/10 backdrop-blur-md border-2 border-white/30 transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:border-white/60">
                            <div class="bg-green-0 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i class="fa-solid fa-brain text-white text-2xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-white mb-4">IA Personalizada</h3>
                            <p class="text-white">
                                Mentor IA que adapta las lecciones a tu progreso y estilo de aprendizaje para obtener resultados óptimos.
                            </p>
                        </div>

                        <div class="rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300 bg-white/10 backdrop-blur-md border-2 border-white/30 transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:border-white/60">
                            <div class="bg-purple-0 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i class="fa-solid fa-bolt text-white text-2xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-white mb-4">Aprendizaje Rápido</h3>
                            <p class="text-white">
                                Conceptos estructurados diseñados para maximizar tu progreso y minimizar el tiempo de aprendizaje.
                            </p>
                        </div>
                    </div>

                </section>
            </div>
        `;
    }
}