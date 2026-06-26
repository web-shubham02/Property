import { createClient } from '@supabase/supabase-js';

// Replace these placeholders with your actual Supabase URL and Anon Key
// found in Supabase -> Project Settings -> API
const SUPABASE_URL = 'https://vcbapqeshvjgkovehxkv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjYmFwcWVzaHZqZ2tvdmVoeGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzMzNjQsImV4cCI6MjA5NzYwOTM2NH0.nKc1l2NockK25pqkpHqhTaiQACu-75zTKlF9tuYdwBU';

const isPlaceholder = 
  SUPABASE_URL === 'YOUR_SUPABASE_URL' || 
  SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' ||
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY;

if (isPlaceholder) {
  console.warn(
    'DharaSetu: Supabase client is using placeholder keys. ' +
    'To connect your live database, replace the placeholders in src/supabaseClient.js with your Supabase credentials.'
  );
}

export const supabase = isPlaceholder 
  ? null 
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isSupabaseConfigured = !isPlaceholder;

/**
 * Dynamically constructs absolute redirect URLs (e.g. for Google OAuth or email verification)
 * that correctly adapt to subdirectory hosting or relative path configurations.
 * 
 * @param {string} subpath - The subpath to redirect to (e.g. '/properties' or '/reset-password')
 * @returns {string} The fully qualified absolute redirect URL.
 */
export const getRedirectUrl = (subpath = '') => {
  const pathname = window.location.pathname;
  // Clean path by removing trailing index.html or pages like signup/login
  const cleanPath = pathname
    .replace(/\/index\.html$/, '')
    .replace(/\/(signup|login)\/?$/, '');
  
  // Ensure we don't end up with duplicate slashes
  const basePath = cleanPath === '/' ? '' : cleanPath;
  const targetPath = subpath.startsWith('/') ? subpath : '/' + subpath;
  
  // Combine origin, base path, and the target subpath
  return (window.location.origin + basePath + targetPath).replace(/([^:]\/)\/+/g, '$1');
};

/**
 * Validates a phone number using strong format rules to catch obvious fakes.
 * Strips spaces, dashes, parentheses, and the optional '+91' country code.
 * Rejects numbers that are not exactly 10 digits, do not start with 6-9,
 * contain all identical digits, or have sequential digit sequences.
 * 
 * @param {string} phone - The phone number to validate
 * @returns {object} { valid: boolean, reason: string | null }
 */
export function isValidPhoneNumber(phone) {
  if (!phone) {
    return { valid: false, reason: 'Phone number is required.' };
  }

  // Strip spaces, dashes, parentheses, +91 country code
  const cleaned = phone.replace(/[\s\-()]/g, '').replace(/^\+?91/, '');

  // Must be exactly 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    return { valid: false, reason: 'Phone number must be exactly 10 digits.' };
  }

  // Indian mobile numbers always start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(cleaned)) {
    return { valid: false, reason: 'Please enter a valid mobile number.' };
  }

  // Reject if all digits are identical (0000000000, 1111111111, etc.)
  if (/^(\d)\1{9}$/.test(cleaned)) {
    return { valid: false, reason: 'Please enter a valid phone number.' };
  }

  // Reject simple sequential patterns (ascending or descending)
  const isAscending = '0123456789'.includes(cleaned);
  const isDescending = '9876543210'.includes(cleaned);
  if (isAscending || isDescending) {
    return { valid: false, reason: 'Please enter a valid phone number.' };
  }

  return { valid: true, reason: null };
}
