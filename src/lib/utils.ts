import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** CORS proxy for cross-origin fetches (LNURL endpoints, etc.) */
const CORS_PROXY = 'https://proxy.shakespeare.diy/?url=';

/**
 * Fetch through the CORS proxy. Use for cross-origin LNURL/API calls
 * that may not have CORS headers configured.
 */
export function proxiedFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(`${CORS_PROXY}${encodeURIComponent(url)}`, init);
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
