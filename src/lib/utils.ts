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
