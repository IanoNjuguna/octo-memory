import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** CORS proxy for cross-origin fetches (LNURL endpoints, etc.) */
const CORS_PROXY = 'https://proxy.shakespeare.diy/?url=';

/**
 * Fetch, trying direct first (most LNURL services support CORS),
 * falling back to the CORS proxy if the direct request is blocked.
 * Defaults to a 15-second timeout to prevent hanging loading states.
 */
export async function proxiedFetch(url: string, init?: RequestInit): Promise<Response> {
  const signal = init?.signal ?? AbortSignal.timeout(15000);
  const opts = { ...init, signal };

  // Try direct first — Alby, LNbits, and most LNURL services have CORS headers
  try {
    const direct = await fetch(url, opts);
    if (direct.ok || direct.status >= 400) return direct;
  } catch (err) {
    // If already aborted (timeout), rethrow
    if (signal.aborted) throw err;
    // Direct fetch blocked (likely CORS) — fall through to proxy
  }

  // Fall back to CORS proxy
  return fetch(`${CORS_PROXY}${encodeURIComponent(url)}`, opts);
}

/**
 * Generate a Gravatar identicon URL for a Nostr pubkey.
 * Uses the first 32 chars of the hex pubkey as the Gravatar hash,
 * which generates a consistent, unique identicon for every pubkey.
 *
 * If a profile picture URL is provided, it's returned directly instead.
 */
export function getAvatarUrl(pubkey: string, pictureUrl?: string | null, size = 80): string {
  if (pictureUrl) return pictureUrl;

  // Gravatar treats any 32-char hex string as an MD5 hash.
  // Nostr pubkeys are 64 hex chars — take the first 32.
  const hash = pubkey.length >= 32 ? pubkey.slice(0, 32) : pubkey;
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}
