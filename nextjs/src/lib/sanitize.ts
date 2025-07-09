import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input The user input to sanitize
 * @returns The sanitized input
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input.trim());
}

/**
 * Sanitizes URL to prevent javascript: protocol exploits
 * @param url The URL to sanitize
 * @returns The sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
    if (typeof url !== 'string') return '';
    
    try {
        const urlObj = new URL(url);
        const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
        
        if (!safeProtocols.includes(urlObj.protocol)) {
            return '';
        }
        
        return DOMPurify.sanitize(url);
    } catch (e) {
        // If it's not a valid URL, return empty string
        return '';
    }
}

/**
 * Sanitizes an array of strings
 * @param arr The array to sanitize
 * @returns The sanitized array
 */
export function sanitizeArray(arr: string[]): string[] {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => typeof item === 'string' ? sanitizeInput(item) : '').filter(Boolean);
}

/**
 * Validates and sanitizes email addresses
 * @param email The email to validate and sanitize
 * @returns The sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';
    
    const sanitized = sanitizeInput(email);
    // Basic email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitizes social media URLs
 * @param socialUrls Record of social media platforms and their URLs
 * @returns The sanitized social media URLs object
 */
export function sanitizeSocialUrls(socialUrls: Record<string, string>): Record<string, string> {
    if (typeof socialUrls !== 'object' || socialUrls === null) return {};
    
    const sanitized: Record<string, string> = {};
    
    for (const [platform, url] of Object.entries(socialUrls)) {
        if (typeof url === 'string' && url.trim()) {
            sanitized[sanitizeInput(platform)] = sanitizeUrl(url);
        }
    }
    
    return sanitized;
}
