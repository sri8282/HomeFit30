/**
 * authService.ts
 * Single source of truth for authentication in HomeFit 30.
 * Currently backed by localStorage; designed for seamless replacement with Supabase Auth.
 */

export interface AuthUser {
  email: string;
  loggedInAt: string;
}

const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'homefit30_auth_user',
};

/**
 * Retrieve currently logged in user session.
 */
export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch (err) {
    console.error('Failed to read auth user from storage', err);
    return null;
  }
}

/**
 * Check if a user is currently authenticated.
 */
export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

/**
 * Log in a user by email and persist session.
 */
export function login(email: string): AuthUser {
  try {
    const trimmed = email.trim().toLowerCase();
    const user: AuthUser = {
      email: trimmed,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  } catch (err) {
    console.error('Failed to save auth session', err);
    throw err;
  }
}

/**
 * Log out current user and clear auth session.
 */
export function logout(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
  } catch (err) {
    console.error('Failed to clear auth session', err);
  }
}
