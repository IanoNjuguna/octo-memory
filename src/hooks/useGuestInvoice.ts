import { useState, useCallback } from 'react';
import { proxiedFetch } from '@/lib/utils';

interface LNURLPayMetadata {
  callback: string;
  maxSendable: number;
  minSendable: number;
  metadata: string;
  tag: 'payRequest';
}

interface GuestInvoiceState {
  invoice: string | null;
  paymentHash: string | null;
  isLoading: boolean;
  error: string | null;
}

interface UseGuestInvoiceReturn extends GuestInvoiceState {
  generate: (lud16: string, amountSats: number) => Promise<void>;
  reset: () => void;
  confirmPayment: () => void;
  isConfirmed: boolean;
}

function parseLud16(lud16: string): { name: string; domain: string } | null {
  const trimmed = lud16.trim().toLowerCase();
  if (!trimmed.includes('@')) return null;
  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { name: parts[0], domain: parts[1] };
}

/** LNURL-pay invoice generator — used by the embed page. */
export function useGuestInvoice(): UseGuestInvoiceReturn {
  const [state, setState] = useState<GuestInvoiceState>({
    invoice: null, paymentHash: null, isLoading: false, error: null,
  });
  const [isConfirmed, setIsConfirmed] = useState(false);

  const generate = useCallback(async (lud16: string, amountSats: number) => {
    setState({ invoice: null, paymentHash: null, isLoading: true, error: null });
    setIsConfirmed(false);

    try {
      const parsed = parseLud16(lud16);
      if (!parsed) throw new Error('Invalid Lightning address format.');

      // Resolve LNURL-pay endpoint
      const lnurlpUrl = `https://${parsed.domain}/.well-known/lnurlp/${parsed.name}`;
      const res = await proxiedFetch(lnurlpUrl);
      if (!res.ok) throw new Error(`Lightning address not found (HTTP ${res.status}).`);
      const data = await res.json();
      if (data.status === 'ERROR') throw new Error(data.reason || 'Service error.');

      const metadata: LNURLPayMetadata = data;
      const msats = amountSats * 1000;
      if (msats < metadata.minSendable) throw new Error(`Minimum is ${Math.ceil(metadata.minSendable / 1000)} sats.`);
      if (msats > metadata.maxSendable) throw new Error(`Maximum is ${Math.floor(metadata.maxSendable / 1000)} sats.`);

      // Get invoice
      const invRes = await proxiedFetch(`${metadata.callback}?amount=${msats}`);
      if (!invRes.ok) throw new Error(`Failed to create invoice (HTTP ${invRes.status}).`);
      const invData = await invRes.json();
      if (invData.status === 'ERROR') throw new Error(invData.reason || 'Invoice creation failed.');
      if (!invData.pr) throw new Error('No invoice returned.');

      setState({ invoice: invData.pr, paymentHash: invData.payment_hash || null, isLoading: false, error: null });
    } catch (err) {
      setState({ invoice: null, paymentHash: null, isLoading: false, error: err instanceof Error ? err.message : 'Unexpected error.' });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ invoice: null, paymentHash: null, isLoading: false, error: null });
    setIsConfirmed(false);
  }, []);

  const confirmPayment = useCallback(() => setIsConfirmed(true), []);

  return { ...state, generate, reset, confirmPayment, isConfirmed };
}