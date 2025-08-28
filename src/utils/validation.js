// Validation utilities
export class ValidationUtils {
    // Email validation
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password validation
    static isValidPassword(password) {
        return password && password.length >= 6;
    }

    // Name validation
    static isValidName(name) {
        return name && name.trim().length >= 2;
    }

    // Generic required field validation
    static isRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }

    // Phone number validation (basic)
    static isValidPhone(phone) {
        const phoneRegex = /^[+]?[1-9]\d{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // URL validation
    static isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Sanitize HTML to prevent XSS
    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
}