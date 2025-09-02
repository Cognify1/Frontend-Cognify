// Progress tracker component for displaying user progress
import {CourseService} from '../services/courseService.js';

export class ProgressTracker {
    constructor() {
        this.courseService = new CourseService();
    }

    // Render a compact progress indicator
    renderCompactProgress(lessons, progress) {
        const progressPercentage = this.courseService.calculateProgramProgress(lessons, progress);

        return `
            <div class="flex items-center space-x-3">
                <div class="flex-1">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-600">Progreso</span>
                        <span class="font-semibold text-gray-900">${progressPercentage}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-cyan-600 h-2 rounded-full transition-all duration-300" 
                             style="width: ${progressPercentage}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Calculate achievement badges based on progress (optimized version)
    getAchievementBadgesFromProgress(progressData) {
        if (!progressData || progressData.length === 0) {
            return [];
        }

        // Calculate percentage from progress data directly
        const completedCount = progressData.filter(p => p.completed).length;
        const totalCount = progressData.length;
        const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        const badges = [];

        if (progressPercentage >= 25) {
            badges.push({
                name: 'Principiante',
                icon: 'fa-star',
                color: 'blue',
                description: '25% del programa completado'
            });
        }

        if (progressPercentage >= 50) {
            badges.push({
                name: 'En Progreso',
                icon: 'fa-medal',
                color: 'yellow',
                description: '50% del programa completado'
            });
        }

        if (progressPercentage >= 75) {
            badges.push({
                name: 'Avanzado',
                icon: 'fa-trophy',
                color: 'orange',
                description: '75% del programa completado'
            });
        }

        if (progressPercentage === 100) {
            badges.push({
                name: 'Completado',
                icon: 'fa-crown',
                color: 'green',
                description: 'Programa completado al 100%'
            });
        }

        return badges;
    }

    // Calculate achievement badges based on progress (legacy method - kept for compatibility)
    getAchievementBadges(lessons, progress) {
        const progressPercentage = this.courseService.calculateProgramProgress(lessons, progress);
        const badges = [];

        if (progressPercentage >= 25) {
            badges.push({
                name: 'Principiante',
                icon: 'fa-star',
                color: 'blue',
                description: '25% del programa completado'
            });
        }

        if (progressPercentage >= 50) {
            badges.push({
                name: 'En Progreso',
                icon: 'fa-medal',
                color: 'yellow',
                description: '50% del programa completado'
            });
        }

        if (progressPercentage >= 75) {
            badges.push({
                name: 'Avanzado',
                icon: 'fa-trophy',
                color: 'orange',
                description: '75% del programa completado'
            });
        }

        if (progressPercentage === 100) {
            badges.push({
                name: 'Completado',
                icon: 'fa-crown',
                color: 'green',
                description: 'Programa completado al 100%'
            });
        }

        return badges;
    }

    // Render achievement badges
    renderAchievementBadges(badges) {
        if (!badges || badges.length === 0) {
            return '';
        }

        return `
            <div class="mt-6">
                <h4 class="text-sm font-semibold text-gray-700 mb-3">Logros Obtenidos</h4>
                <div class="flex flex-wrap gap-2">
                    ${badges.map(badge => `
                        <div class="achievement-badge bg-${badge.color}-100 text-${badge.color}-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center"
                             title="${badge.description}">
                            <i class="fa-solid ${badge.icon} mr-1"></i>
                            ${badge.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}