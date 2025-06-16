
import { supabase } from "@/integrations/supabase/client";

/**
 * Comprehensive cleanup of all authentication state
 * Removes all Supabase auth-related keys from storage
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Secure sign out with comprehensive cleanup
 * Ensures no auth state persists after logout
 */
export const secureSignOut = async () => {
  try {
    // Clean up auth state first
    cleanupAuthState();
    
    // Attempt global sign out (fallback if it fails)
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.warn('Global sign out failed, continuing with cleanup:', err);
    }
    
    // Force page reload for a completely clean state
    window.location.href = '/auth';
  } catch (error) {
    console.error('Sign out error:', error);
    // Even if sign out fails, redirect to ensure user can't access protected content
    window.location.href = '/auth';
  }
};

/**
 * Secure sign in with proper state cleanup before authentication
 */
export const secureSignIn = async (email: string, password: string) => {
  try {
    // Clean up existing state before signing in
    cleanupAuthState();
    
    // Attempt global sign out to clear any existing sessions
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }
    
    // Sign in with email/password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Force page reload to ensure clean state
      window.location.href = '/';
    }
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Secure sign up with proper redirect configuration
 */
export const secureSignUp = async (email: string, password: string) => {
  try {
    // Clean up existing state before signing up
    cleanupAuthState();
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};
