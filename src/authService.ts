import { supabase } from './lib/supabase';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

export interface AuthUser {
  email: string;
  id: string;
}

/**
 * Check if an error from Supabase / network is a timeout / 504 / context deadline exceeded.
 */
export function isTimeoutError(err: any): boolean {
  if (!err) return false;
  const status = err.status ?? err.statusCode ?? err.code;
  if (status === 504 || status === '504') return true;
  const msg = (err.message || err.error_description || String(err)).toLowerCase();
  return (
    msg.includes('504') ||
    msg.includes('context deadline exceeded') ||
    msg.includes('deadline exceeded') ||
    msg.includes('gateway timeout') ||
    msg.includes('gateway time-out') ||
    msg.includes('upstream request timeout') ||
    msg.includes('timed out') ||
    msg.includes('timeout')
  );
}

/**
 * Send email OTP code via Supabase auth.
 */
export async function sendCode(email: string) {
  const trimmed = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      shouldCreateUser: true,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Verify 6-digit email OTP token via Supabase auth.
 */
export async function verifyCode(email: string, code: string) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedCode = code.trim();
  const { data, error } = await supabase.auth.verifyOtp({
    email: trimmedEmail,
    token: trimmedCode,
    type: 'email',
  });
  if (error) throw error;
  return data;
}

/**
 * Retrieve current authenticated Supabase user.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data) return null;
  return data.user;
}

/**
 * Retrieve current Supabase session.
 */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data) return null;
  return data.session;
}

/**
 * Sign out current session in Supabase auth.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Register onAuthStateChange listener with Supabase.
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}

// Backward-compatibility wrappers
export function isAuthenticated(): boolean {
  return false;
}

export function logout(): Promise<void> {
  return signOut();
}
