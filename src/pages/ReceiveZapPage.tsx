import { useState, useCallback, useEffect } from 'react';
import { Zap, Copy, Check, ExternalLink, Sparkle, Sparkles, Star, Rocket, ArrowLeft, RefreshCw } from 'lucide-react';
import { useSeoMeta } from '@unhead/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useToast } from '@/hooks/useToast';
import { useNostr } from '@nostrify/react';
import { useZaps } from '@/hooks/useZaps';
import { useWallet } from '@/hooks/useWallet';
import { useZapSettlement } from '@/hooks/useZapSettlement';
import { PaymentStatusOverlay } from '@/components/PaymentStatusOverlay';
import { LoginArea } from '@/components/auth/LoginArea';
import type { Event } from 'nostr-tools';
import QRCode from 'qrcode';

const presetAmounts = [
  { amount: 1, icon: Sparkle, label: '1' },
  { amount: 50, icon: Sparkles, label: '50' },
  { amount: 100, icon: Zap, label: '100' },
  { amount: 250, icon: Star, label: '250' },
  { amount: 1000, icon: Rocket, label: '1k' },
];

export default function ReceiveZapPage() {
  useSeoMeta({
    title: 'Receive Zaps — ZapQR',
    description: 'Generate a Lightning invoice QR code and receive Bitcoin micropayments instantly.',
  });

  const { user } = useCurrentUser();
  const { data: author, isLoading: authorLoading } = useAuthor(user?.pubkey ?? '');
  const { toast } = useToast();
  const { nostr } = useNostr();
  const { webln, activeNWC } = useWallet();

  const [amount, setAmount] = useState<number | string>(100);
  const [comment, setComment] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [zapRequestId, setZapRequestId] = useState<string | null>(null);

  // Create a stable minimal target for useZaps — it uses the author's kind-0
  // for LNURL resolution, so we just need the pubkey.
  const targetEvent: Event = {
    pubkey: user?.pubkey ?? '',
    id: user?.pubkey ?? '', // non-empty so useZaps doesn't think target is null
    kind: 0,
    content: '',
    tags: [],
    created_at: Math.floor(Date.now() / 1000),
    sig: '',
  };

  // useZaps handles invoice generation via LNURL-pay
  const { zap, isZapping, invoice, resetInvoice } = useZaps(
    user ? targetEvent : [],
    webln,
    activeNWC,
  );

  // Real-time settlement detection
  const {
    status: settlementStatus,
    receipt,
    error: settlementError,
    checkNow,
    expire: expireSettlement,
    reset: resetSettlement,
  } = useZapSettlement({ zapRequestId });

  // Generate QR code when invoice changes
  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      if (!invoice) {
        setQrCodeUrl('');
        return;
      }
      try {
        const url = await QRCode.toDataURL(invoice.toUpperCase(), {
          width: 512,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        });
        if (!cancelled) setQrCodeUrl(url);
      } catch (err) {
        console.error('QR generation failed:', err);
      }
    };

    generate();
    return () => { cancelled = true; };
  }, [invoice]);

  const handleGenerate = useCallback(async () => {
    const sats = typeof amount === 'string' ? parseInt(amount, 10) : amount;
    if (!sats || sats <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount in satoshis.',
        variant: 'destructive',
      });
      return;
    }

    // Store zap request ID for settlement tracking
    // useZaps internally creates the zap request and calls LNURL endpoint
    // We hook into it by calling zap() and then watching for the invoice
    resetSettlement();
    setZapRequestId(null);
    setQrCodeUrl('');

    // The zap function calls the LNURL endpoint, sets the invoice
    // We need to extract the zap request ID from what useZaps does internally.
    // Since useZaps doesn't expose the zap request ID directly, we track it
    // via a side-channel: we'll re-derive it from the user's signer in a useEffect
    await zap(sats, comment || 'Zap via ZapQR');
  }, [amount, comment, zap, resetSettlement, toast]);

  // After invoice is created, query relays for the signed zap request (kind-9734).
  // The LNURL service publishes the zap request to relays, and we need its event ID
  // to subscribe to kind-9735 receipts. We look for the most recent kind-9734 from
  // the current user created in the last 60 seconds.
  useEffect(() => {
    if (!invoice || !user?.pubkey || !nostr || zapRequestId) return;

    let cancelled = false;

    const lookup = async () => {
      try {
        const events = await nostr.query(
          [{
            kinds: [9734],
            authors: [user.pubkey],
            since: Math.floor(Date.now() / 1000) - 60,
            limit: 5,
          }],
          { signal: AbortSignal.timeout(10000) },
        );

        if (cancelled) return;

        // Pick the most recent zap request
        if (events.length > 0) {
          const latest = events.reduce((a, b) => (a.created_at > b.created_at ? a : b));
          setZapRequestId(latest.id);
        }
      } catch (err) {
        console.warn('Could not find zap request on relays:', err);
        // Fallback: still allow settlement checking via polling
      }
    };

    lookup();
    return () => { cancelled = true; };
  }, [invoice, user?.pubkey, nostr, zapRequestId]);

  const handleCopy = async () => {
    if (!invoice) return;
    await navigator.clipboard.writeText(invoice);
    setCopied(true);
    toast({ title: 'Invoice copied', description: 'Paste it into any Lightning wallet to pay.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWallet = () => {
    if (!invoice) return;
    window.open(`lightning:${invoice}`, '_blank');
  };

  const handleReset = () => {
    resetInvoice();
    resetSettlement();
    setZapRequestId(null);
    setQrCodeUrl('');
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center border-dashed">
          <CardHeader>
            <CardTitle>Log in to Receive Zaps</CardTitle>
            <CardDescription>
              You need a Nostr account with a Lightning address to generate payment QR codes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <LoginArea className="w-full max-w-60" />
            <p className="text-xs text-muted-foreground">
              New to Nostr? Create an account and set up a Lightning address (like Alby or LNbits) to start receiving payments.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading profile
  if (authorLoading) {
    return (
      <div className="min-h-screen max-w-lg mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // No Lightning address configured
  if (!author?.metadata?.lud16 && !author?.metadata?.lud06) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center border-dashed">
          <CardHeader>
            <CardTitle>Lightning Address Required</CardTitle>
            <CardDescription>
              You need a Lightning address (lud16) in your Nostr profile to generate payment invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set up a free Lightning address with{' '}
              <a
                href="https://getalby.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary hover:text-primary/80"
              >
                Alby
              </a>
              {' '}or{' '}
              <a
                href="https://lnbits.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary hover:text-primary/80"
              >
                LNbits
              </a>
              , then update your Nostr profile.
            </p>
            <Button variant="outline" asChild>
              <a href="/settings" rel="nofollow">Edit Profile</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-8 md:py-12 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Receive Zaps</h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Generate a Lightning invoice QR code. Anyone with a Lightning wallet can scan and pay instantly.
        </p>
      </div>

      {/* Invoice Display (when active) */}
      {invoice ? (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Back button */}
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </div>

            {/* Amount */}
            <div className="text-center">
              <p className="text-3xl font-bold">{amount} sats</p>
              {comment && (
                <p className="text-sm text-muted-foreground mt-1">{comment}</p>
              )}
            </div>

            <Separator />

            {/* QR Code */}
            <div className="flex justify-center">
              <Card className="p-3 max-w-[85vw] md:max-w-[320px]">
                <CardContent className="p-0 flex justify-center">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="Lightning Invoice QR Code"
                      className="w-full h-auto aspect-square object-contain rounded"
                    />
                  ) : (
                    <Skeleton className="w-full aspect-square rounded" />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={invoice}
                  readOnly
                  className="font-mono text-xs flex-1 truncate"
                  onClick={(e) => e.currentTarget.select()}
                  aria-label="Lightning invoice"
                />
                <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="outline" onClick={handleOpenWallet} className="w-full" size="lg">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Lightning Wallet
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Scan the QR code or copy the invoice to pay with any Lightning wallet.
              </p>
            </div>

            {/* Settlement Status */}
            <PaymentStatusOverlay
              status={settlementStatus}
              amount={typeof amount === 'string' ? parseInt(amount, 10) : amount}
              error={settlementError}
              onReset={handleReset}
              onCheckNow={checkNow}
            />

            {/* Receipt details */}
            {receipt && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
                <CardContent className="pt-4 text-sm space-y-1">
                  <p className="font-medium text-green-900 dark:text-green-100">Receipt</p>
                  <p className="text-muted-foreground">
                    <span className="font-mono text-xs break-all">{receipt.id}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(receipt.created_at * 1000).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Zap Generation Form */
        <Card>
          <CardHeader>
            <CardTitle>Create Zap Invoice</CardTitle>
            <CardDescription>
              Choose an amount below or enter a custom one. The payer scans the QR to send sats.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Amount Presets */}
            <ToggleGroup
              type="single"
              value={String(amount)}
              onValueChange={(v) => v && setAmount(parseInt(v, 10))}
              className="grid grid-cols-5 gap-1"
            >
              {presetAmounts.map(({ amount: p, icon: Icon, label }) => (
                <ToggleGroupItem
                  key={p}
                  value={String(p)}
                  className="flex flex-col h-auto min-w-0 text-xs px-1 py-2"
                  aria-label={`${label} satoshis`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span>{label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-muted" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-muted" />
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Input
                id="custom-amount"
                type="number"
                placeholder="Custom amount (sats)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                className="w-full"
              />
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Textarea
                id="comment"
                placeholder="Add a message (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full resize-none"
                rows={2}
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isZapping}
              className="w-full"
              size="lg"
            >
              {isZapping ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Your Lightning address:{' '}
              <code className="font-mono text-primary">
                {author?.metadata?.lud16 || author?.metadata?.lud06}
              </code>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
