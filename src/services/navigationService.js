// Navigation service for handling program and course navigation
export class NavigationService {
    constructor() {
        this.currentProgramId = null;
        this.currentCourseId = null;
    }

    // Navigate to a specific program's courses
    navigateToProgramCourses(programId) {
        this.currentProgramId = programId;
        window.location.hash = `#/courses/program/${programId}`;
    }

    // Navigate to a specific course's lessons
    navigateToCourseLessons(courseId) {
        this.currentCourseId = courseId;
        // This could be expanded later for a dedicated lessons page
        // For now, we'll just expand the course in the sidebar
        return courseId;
    }

    // Get current program ID
    getCurrentProgramId() {
        return this.currentProgramId;
    }

    // Get current course ID
    getCurrentCourseId() {
        return this.currentCourseId;
    }

    // Navigate back to programs
    navigateToPrograms() {
        this.currentProgramId = null;
        this.currentCourseId = null;
        window.location.hash = '#/programs';
    }

    // Navigate to home
    navigateToHome() {
        this.currentProgramId = null;
        this.currentCourseId = null;
        window.location.hash = '#/';
    }
}
