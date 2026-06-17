import { useCallback } from 'react';
import { CheckmarkCircle01Icon, Clock01Icon, Alert01Icon, CancelCircleIcon, Loading02Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import type { SettlementStatus } from '@/hooks/useZapSettlement';

interface PaymentStatusOverlayProps {
  status: SettlementStatus;
  amount: number;
  error: string | null;
  onReset: () => void;
  onCheckNow: () => void;
  className?: string;
}

export function PaymentStatusOverlay({
  status,
  amount,
  error,
  onReset,
  onCheckNow,
  className,
}: PaymentStatusOverlayProps) {
  if (status === 'idle') return null;

  return (
    <div
      className={cn(
        'rounded-xl border p-6 text-center transition-all duration-300',
        status === 'awaiting' && 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50',
        status === 'received' && 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/50',
        status === 'expired' && 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/50',
        status === 'error' && 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {/* Awaiting Payment */}
      {status === 'awaiting' && (
        <div className="flex flex-col items-center gap-3">
          <Loading02Icon className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Awaiting Payment
            </p>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              {amount} sats — scan the QR code with your Lightning wallet
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <Clock01Icon className="inline h-3 w-3 mr-1" />
            Invoice expires in ~1 hour
          </p>
        </div>
      )}

      {/* Payment Received */}
      {status === 'received' && (
        <div className="flex flex-col items-center gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95">
          <CheckmarkCircle01Icon className="h-12 w-12 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-xl font-bold text-green-900 dark:text-green-100">
              Zap Received!
            </p>
            <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-300">
              {amount} sats
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="mt-3 text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-300 dark:hover:text-green-200 underline underline-offset-2"
          >
            Generate another
          </button>
        </div>
      )}

      {/* Expired */}
      {status === 'expired' && (
        <div className="flex flex-col items-center gap-3">
          <CancelCircleIcon className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
              Invoice Expired
            </p>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              This invoice is no longer valid. Generate a new one to try again.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
          >
            Generate New Invoice
          </button>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="flex flex-col items-center gap-3">
          <Alert01Icon className="h-10 w-10 text-red-600 dark:text-red-400" />
          <div>
            <p className="text-lg font-semibold text-red-900 dark:text-red-100">
              Something went wrong
            </p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {error || 'Failed to check payment status.'}
            </p>
          </div>
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={onCheckNow}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
