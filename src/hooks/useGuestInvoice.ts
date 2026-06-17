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

export function useGuestInvoice(): UseGuestInvoiceReturn {
  const [state, setState] = useState<GuestInvoiceState>({
    invoice: null,
    paymentHash: null,
    isLoading: false,
    error: null,
  });
  const [isConfirmed, setIsConfirmed] = useState(false);

  const generate = useCallback(async (lud16: string, amountSats: number) => {
    setState({ invoice: null, paymentHash: null, isLoading: true, error: null });
    setIsConfirmed(false);

    try {
      // Step 1: parse lud16
      const parsed = parseLud16(lud16);
      if (!parsed) {
        throw new Error(
          'Invalid Lightning address format. Use the format name@domain.com (e.g., you@getalby.com)',
        );
      }

      // Step 2: resolve LNURL-pay endpoint
      const lnurlpUrl = `https://${parsed.domain}/.well-known/lnurlp/${parsed.name}`;
      let metadata: LNURLPayMetadata;
      try {
        const res = await proxiedFetch(lnurlpUrl);
        if (!res.ok) {
          const hint = res.status === 404
            ? `"${parsed.name}@${parsed.domain}" could not be found. Make sure this is your real Lightning address (e.g., from Alby or LNbits), not the placeholder.`
            : `Check that your address is correct (HTTP ${res.status}).`;
          throw new Error(hint);
        }
        const data = await res.json();
        if (data.status === 'ERROR') {
          throw new Error(data.reason || 'Lightning service returned an error.');
        }
        metadata = data;
      } catch (err) {
        if (err instanceof Error && err.message.startsWith('Lightning')) throw err;
        throw new Error(
          'Could not resolve Lightning address. Make sure the domain supports LNURL-pay.',
        );
      }

      // Step 3: validate amount against limits
      const amountMillisats = amountSats * 1000;
      if (amountMillisats < metadata.minSendable) {
        const min = Math.ceil(metadata.minSendable / 1000);
        throw new Error(`Amount too small. Minimum is ${min} sats for this address.`);
      }
      if (amountMillisats > metadata.maxSendable) {
        const max = Math.floor(metadata.maxSendable / 1000);
        throw new Error(`Amount too large. Maximum is ${max} sats for this address.`);
      }

      // Step 4: request invoice from callback
      const invoiceUrl = `${metadata.callback}?amount=${amountMillisats}`;
      const invRes = await proxiedFetch(invoiceUrl);
      if (!invRes.ok) {
        throw new Error(`Failed to create invoice (HTTP ${invRes.status}).`);
      }
      const invData = await invRes.json();
      if (invData.status === 'ERROR') {
        throw new Error(invData.reason || 'Failed to create invoice.');
      }
      if (!invData.pr || typeof invData.pr !== 'string') {
        throw new Error('Lightning service did not return a valid invoice.');
      }

      setState({
        invoice: invData.pr,
        paymentHash: invData.payment_hash || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState({
        invoice: null,
        paymentHash: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ invoice: null, paymentHash: null, isLoading: false, error: null });
    setIsConfirmed(false);
  }, []);

  const confirmPayment = useCallback(() => {
    setIsConfirmed(true);
  }, []);

  return {
    ...state,
    generate,
    reset,
    confirmPayment,
    isConfirmed,
  };
}
