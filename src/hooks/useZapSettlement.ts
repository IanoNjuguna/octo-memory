import { useEffect, useState, useCallback, useRef } from 'react';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

export type SettlementStatus = 'idle' | 'awaiting' | 'received' | 'expired' | 'error';

interface UseZapSettlementOptions {
  zapRequestId: string | null;
  expirySeconds?: number;
}

interface UseZapSettlementResult {
  status: SettlementStatus;
  receipt: NostrEvent | null;
  error: string | null;
  /** Manually check relays for a receipt (one-shot query). */
  checkNow: () => Promise<void>;
  /** Mark the invoice as expired. */
  expire: () => void;
  /** Reset to idle (e.g. when generating a new invoice). */
  reset: () => void;
}

export function useZapSettlement({
  zapRequestId,
  expirySeconds = 3600,
}: UseZapSettlementOptions): UseZapSettlementResult {
  const { nostr } = useNostr();
  const [status, setStatus] = useState<SettlementStatus>('idle');
  const [receipt, setReceipt] = useState<NostrEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const expiryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const cleanup = useCallback(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    if (expiryTimeoutRef.current) {
      clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setStatus('idle');
    setReceipt(null);
    setError(null);
  }, [cleanup]);

  const expire = useCallback(() => {
    cleanup();
    setStatus('expired');
  }, [cleanup]);

  const checkNow = useCallback(async () => {
    if (!zapRequestId) return;

    try {
      const events = await nostr.query(
        [{ kinds: [9735], '#e': [zapRequestId] }],
        { signal: AbortSignal.timeout(10000) },
      );

      if (events.length > 0) {
        // Use the most recent receipt
        const latest = events.reduce((a, b) =>
          (a.created_at > b.created_at ? a : b),
        );
        setReceipt(latest);
        setStatus('received');
        cleanup();
      }
    } catch (err) {
      console.warn('Zap settlement check failed:', err);
      setError('Failed to check payment status. Try again.');
    }
  }, [zapRequestId, nostr, cleanup]);

  useEffect(() => {
    if (!zapRequestId) {
      reset();
      return;
    }

    // Start awaiting and set up subscription
    setStatus('awaiting');
    setError(null);
    setReceipt(null);

    // Set expiry timer
    expiryTimeoutRef.current = setTimeout(() => {
      setStatus('expired');
    }, expirySeconds * 1000);

    // Subscribe to real-time zap receipts for this zap request
    const { unsub } = nostr.req(
      [
        {
          kinds: [9735],
          '#e': [zapRequestId],
          since: Math.floor(Date.now() / 1000),
        },
      ],
      {
        onEvent: (event: NostrEvent) => {
          setStatus('received');
          setReceipt(event);
          cleanup();
        },
        onEose: () => {
          // All stored events received. If no match yet, that's fine —
          // we wait for new events via the subscription.
        },
      },
    );

    unsubRef.current = () => unsub();

    return () => {
      // Don't clean up on unmount — let the subscription live
      // so we detect payment even if user navigates away briefly
    };
    // We intentionally only re-run when zapRequestId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zapRequestId]);

  return { status, receipt, error, checkNow, expire, reset };
}
