/**
 * Authentication utility functions for client-side session management
 */

export interface User {
    id: string;
    email: string;
    name: string;
}

/**
 * Check if user is authenticated by verifying localStorage
 */
export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    try {
        const user = localStorage.getItem('user');
        return user !== null;
    } catch {
        return false;
    }
}

/**
 * Get current user data from localStorage
 */
export function getUser(): User | null {
    if (typeof window === 'undefined') return null;

    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        return JSON.parse(userStr) as User;
    } catch {
        return null;
    }
}

/**
 * Clear user session and redirect to login
 */
export function logout(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem('user');
        window.location.href = '/login';
    } catch (error) {
        console.error('Error during logout:', error);
    }
}
