import { useState, useCallback, useEffect } from 'react';
import { ZapIcon, Copy01Icon, Tick01Icon, ExternalLinkIcon, StarIcon, Rocket01Icon, ArrowLeft01Icon, RefreshIcon, CodeIcon } from '@/components/icons';
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
import type { SettlementStatus } from '@/hooks/useZapSettlement';
import QRCode from 'qrcode';

const presetAmounts = [
  { amount: 1, icon: StarIcon, label: '1' },
  { amount: 50, icon: StarIcon, label: '50' },
  { amount: 100, icon: ZapIcon, label: '100' },
  { amount: 250, icon: StarIcon, label: '250' },
  { amount: 1000, icon: Rocket01Icon, label: '1k' },
];

// ─── Invoice display, QR, copy, deep-link ──────────────────────────

function InvoiceDisplay({
  invoice,
  amount,
  comment,
  qrCodeUrl,
  settlementStatus,
  settlementError,
  receipt,
  onReset,
  onCheckNow,
  embedLud16,
}: {
  invoice: string;
  amount: number | string;
  comment: string;
  qrCodeUrl: string;
  settlementStatus: SettlementStatus;
  settlementError: string | null;
  receipt: { id: string; created_at: number } | null;
  onReset: () => void;
  onCheckNow: () => void;
  embedLud16: string;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(invoice);
    setCopied(true);
    toast({ title: 'Invoice copied', description: 'Paste it into any Lightning wallet to pay.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWallet = () => window.open(`lightning:${invoice}`, '_blank');
  const displayAmount = typeof amount === 'string' ? parseInt(amount, 10) : amount;

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <ArrowLeft01Icon className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold">{displayAmount} sats</p>
          {comment && <p className="text-sm text-muted-foreground mt-1">{comment}</p>}
        </div>

        <Separator />

        <div className="flex justify-center">
          <Card className="p-3 max-w-[85vw] md:max-w-[320px]">
            <CardContent className="p-0 flex justify-center">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Lightning Invoice QR Code" className="w-full h-auto aspect-square object-contain rounded" />
              ) : (
                <Skeleton className="w-full aspect-square rounded" />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={invoice} readOnly className="font-mono text-xs flex-1 truncate" onClick={(e) => e.currentTarget.select()} aria-label="Lightning invoice" />
            <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
              {copied ? <Tick01Icon className="h-4 w-4 text-green-600" /> : <Copy01Icon className="h-4 w-4" />}
            </Button>
          </div>
          <Button variant="outline" onClick={handleOpenWallet} className="w-full" size="lg">
            <ExternalLinkIcon className="h-4 w-4 mr-2" />
            Open in Lightning Wallet
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Scan the QR code or copy the invoice to pay with any Lightning wallet.
          </p>

          <EmbedSection lud16={embedLud16} amount={displayAmount} />
        </div>

        <PaymentStatusOverlay status={settlementStatus} amount={displayAmount} error={settlementError} onReset={onReset} onCheckNow={onCheckNow} />
        {receipt && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
            <CardContent className="pt-4 text-sm space-y-1">
              <p className="font-medium text-green-900 dark:text-green-100">Receipt</p>
              <p className="text-muted-foreground"><span className="font-mono text-xs break-all">{receipt.id}</span></p>
              <p className="text-xs text-muted-foreground">{new Date(receipt.created_at * 1000).toLocaleString()}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Embed code section ─────────────────────────────────────────────

function EmbedSection({ lud16, amount }: { lud16: string; amount: number }) {
  const { toast } = useToast();
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = `${baseUrl}/embed?lud16=${encodeURIComponent(lud16)}&amount=${amount}`;
  const iframeSnippet = `<iframe src="${embedUrl}" width="320" height="380" frameborder="0" style="border-radius:12px"></iframe>`;

  const handleCopyEmbed = async () => {
    await navigator.clipboard.writeText(iframeSnippet);
    setEmbedCopied(true);
    toast({ title: 'Embed code copied', description: 'Paste it into your website or blog.' });
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  if (!lud16) return null;

  return (
    <div className="space-y-2">
      {!showEmbed ? (
        <Button variant="ghost" size="sm" onClick={() => setShowEmbed(true)} className="w-full gap-2 text-xs">
          <CodeIcon className="h-3.5 w-3.5" /> Embed this QR
        </Button>
      ) : (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Embed Code</span>
            <Button variant="ghost" size="sm" onClick={() => setShowEmbed(false)} className="h-6 text-xs">Hide</Button>
          </div>
          <div className="relative">
            <pre className="text-xs font-mono bg-background rounded-md p-2 overflow-x-auto whitespace-pre-wrap break-all border">{iframeSnippet}</pre>
            <Button variant="outline" size="sm" onClick={handleCopyEmbed} className="absolute top-1.5 right-1.5 h-7 gap-1 text-xs">
              {embedCopied ? <Tick01Icon className="h-3 w-3 text-green-600" /> : <Copy01Icon className="h-3 w-3" />}
              {embedCopied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Paste this iframe into your website, blog, or Notion page.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Amount + comment form ──────────────────────────────────────────

function ZapForm({
  amount, setAmount, comment, setComment, isLoading, onGenerate, footer,
}: {
  amount: number | string;
  setAmount: (v: number | string) => void;
  comment: string;
  setComment: (v: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Zap Invoice</CardTitle>
        <CardDescription>Choose an amount below or enter a custom one. The payer scans the QR to send sats.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ToggleGroup type="single" value={String(amount)} onValueChange={(v) => v && setAmount(parseInt(v, 10))} className="grid grid-cols-5 gap-1">
          {presetAmounts.map(({ amount: p, icon: Icon, label }) => (
            <ToggleGroupItem key={p} value={String(p)} className="flex flex-col h-auto min-w-0 text-xs px-1 py-2" aria-label={`${label} satoshis`}>
              <Icon className="h-4 w-4 mb-1" /><span>{label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex items-center gap-2"><div className="h-px flex-1 bg-muted" /><span className="text-xs text-muted-foreground">OR</span><div className="h-px flex-1 bg-muted" /></div>
        <Input type="number" placeholder="Custom amount (sats)" value={amount} onChange={(e) => setAmount(e.target.value)} min={1} className="w-full" />
        <Textarea placeholder="Add a message (optional)" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full resize-none" rows={2} />
        <Button onClick={onGenerate} disabled={isLoading} className="w-full" size="lg">
          {isLoading ? (<><RefreshIcon className="h-4 w-4 mr-2 animate-spin" />Creating Invoice...</>) : (<><ZapIcon className="h-4 w-4 mr-2" />Generate QR Code</>)}
        </Button>
        {footer}
      </CardContent>
    </Card>
  );
}

// ─── Main page ───────────────────────────────────────────────────────

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
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [zapRequestId, setZapRequestId] = useState<string | null>(null);

  const targetEvent: Event = {
    pubkey: user?.pubkey ?? '',
    id: user?.pubkey ?? '',
    kind: 0, content: '', tags: [],
    created_at: Math.floor(Date.now() / 1000), sig: '',
  };

  const { zap, isZapping, invoice, resetInvoice } = useZaps(user ? targetEvent : [], webln, activeNWC);
  const { status: settlementStatus, receipt, error: settlementError, checkNow, reset: resetSettlement } = useZapSettlement({ zapRequestId });

  // ── QR generation ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!invoice) { setQrCodeUrl(''); return; }
      try {
        const url = await QRCode.toDataURL(invoice.toUpperCase(), { width: 512, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } });
        if (!cancelled) setQrCodeUrl(url);
      } catch (err) { console.error('QR generation failed:', err); }
    })();
    return () => { cancelled = true; };
  }, [invoice]);

  // ── Look up zap request ID after invoice is created ──────────────
  useEffect(() => {
    if (!invoice || !user?.pubkey || !nostr || zapRequestId) return;
    let cancelled = false;
    (async () => {
      try {
        const events = await nostr.query(
          [{ kinds: [9734], authors: [user.pubkey], since: Math.floor(Date.now() / 1000) - 60, limit: 5 }],
          { signal: AbortSignal.timeout(10000) },
        );
        if (!cancelled && events.length > 0) {
          setZapRequestId(events.reduce((a, b) => (a.created_at > b.created_at ? a : b)).id);
        }
      } catch (err) { console.warn('Could not find zap request on relays:', err); }
    })();
    return () => { cancelled = true; };
  }, [invoice, user?.pubkey, nostr, zapRequestId]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    const sats = typeof amount === 'string' ? parseInt(amount, 10) : amount;
    if (!sats || sats <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid amount in satoshis.', variant: 'destructive' });
      return;
    }
    resetSettlement();
    setZapRequestId(null);
    setQrCodeUrl('');
    await zap(sats, comment || 'Zap via ZapQR');
  }, [amount, comment, zap, resetSettlement, toast]);

  const handleReset = () => {
    resetInvoice();
    resetSettlement();
    setZapRequestId(null);
    setQrCodeUrl('');
  };

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-8 md:py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Receive Zaps</h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Generate a Lightning invoice QR code. Anyone with a Lightning wallet can scan and pay instantly.
        </p>
      </div>

      {!user ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Log in to Receive Zaps</CardTitle>
            <CardDescription>
              Connect your Nostr account with a Lightning address to generate payment QR codes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <LoginArea className="w-full max-w-60" />
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Your Nostr profile needs a Lightning address (lud16). Get one free from{' '}
              <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">Alby</a>
              {' '}or{' '}
              <a href="https://lnbits.com" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">LNbits</a>.
            </p>
          </CardContent>
        </Card>
      ) : authorLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : !author?.metadata?.lud16 && !author?.metadata?.lud06 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Lightning Address Required</CardTitle>
            <CardDescription>
              Add a Lightning address to your Nostr profile to generate invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get a free Lightning address with{' '}
              <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">Alby</a>
              {' '}(yourname@getalby.com) or{' '}
              <a href="https://lnbits.com" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">LNbits</a>
              . Add it to your Nostr profile as the <code>lud16</code> field.
            </p>
          </CardContent>
        </Card>
      ) : invoice ? (
        <InvoiceDisplay
          invoice={invoice}
          amount={amount}
          comment={comment}
          qrCodeUrl={qrCodeUrl}
          settlementStatus={settlementStatus}
          settlementError={settlementError}
          receipt={receipt}
          onReset={handleReset}
          onCheckNow={checkNow}
          embedLud16={author?.metadata?.lud16 || author?.metadata?.lud06 || ''}
        />
      ) : (
        <ZapForm
          amount={amount} setAmount={setAmount} comment={comment} setComment={setComment}
          isLoading={isZapping} onGenerate={handleGenerate}
          footer={
            <p className="text-xs text-center text-muted-foreground">
              Your Lightning address:{' '}
              <code className="font-mono text-primary">{author?.metadata?.lud16 || author?.metadata?.lud06}</code>
            </p>
          }
        />
      )}
    </div>
  );
}