import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ZapIcon } from '@hugeicons/core-free-icons';
import { useGuestInvoice } from '@/hooks/useGuestInvoice';
import { Skeleton } from '@/components/ui/skeleton';
import QRCode from 'qrcode';

export default function EmbedPage() {
  const [searchParams] = useSearchParams();
  const lud16 = searchParams.get('lud16') || '';
  const amountParam = searchParams.get('amount') || '100';
  const amount = parseInt(amountParam, 10) || 100;

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const { invoice, isLoading, error, generate, isConfirmed } = useGuestInvoice();

  // Auto-generate invoice on mount
  useEffect(() => {
    if (lud16 && !hasGenerated) {
      setHasGenerated(true);
      generate(lud16, amount);
    }
  }, [lud16, amount, generate, hasGenerated]);

  // Generate QR when invoice is ready
  useEffect(() => {
    let cancelled = false;
    const gen = async () => {
      if (!invoice) { setQrCodeUrl(''); return; }
      try {
        const url = await QRCode.toDataURL(invoice.toUpperCase(), {
          width: 400,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        });
        if (!cancelled) setQrCodeUrl(url);
      } catch { /* ignore */ }
    };
    gen();
    return () => { cancelled = true; };
  }, [invoice]);

  const containerClass = 'flex flex-col items-center justify-center min-h-[320px] p-4 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans';

  // Missing params
  if (!lud16) {
    return (
      <div className={containerClass}>
        <p className="text-sm text-zinc-500">Missing Lightning address. Add <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">?lud16=you@getalby.com</code> to the URL.</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className={containerClass}>
        <div className="text-center space-y-2 max-w-xs">
          <div className="text-red-500 text-sm font-medium">Could not generate invoice</div>
          <p className="text-xs text-zinc-500 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading || !hasGenerated) {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center gap-4 w-full max-w-[260px]">
          <Skeleton className="w-full aspect-square rounded-xl" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  // Confirmed
  if (isConfirmed) {
    return (
      <div className={containerClass}>
        <div className="text-center space-y-3">
          <div className="text-green-500 text-4xl">✓</div>
          <p className="text-lg font-semibold">{amount} sats received!</p>
          <p className="text-xs text-zinc-400">Thank you ⚡</p>
        </div>
      </div>
    );
  }

  // QR Display
  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4 w-full max-w-[280px]">
        {/* QR */}
        <div className="w-full aspect-square bg-white rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt={`Lightning invoice for ${amount} sats`}
              className="w-full h-full object-contain"
            />
          ) : (
            <Skeleton className="w-full h-full rounded-lg" />
          )}
        </div>

        {/* Amount */}
        <div className="text-center">
          <p className="text-2xl font-bold tabular-nums tracking-tight">{amount.toLocaleString()}</p>
          <p className="text-sm text-zinc-500">sats</p>
        </div>

        {/* Instructions */}
        <p className="text-xs text-zinc-400 text-center">
          Scan with any Lightning wallet to pay
        </p>

        {/* Powered by */}
        <a
          href="https://octo-pay.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-500 transition-colors mt-2"
        >
          <ZapIcon className="h-3 w-3" />
          ZapQR
        </a>
      </div>
    </div>
  );
}
