import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { nip19, nip57 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { Copy01Icon, ExternalLinkIcon, QrCodeIcon, Tick01Icon, ZapIcon } from '@/components/icons';
import { UserAvatar } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuthor } from '@/hooks/useAuthor';
import { useGuestInvoice } from '@/hooks/useGuestInvoice';
import { useToast } from '@/hooks/useToast';
import NotFound from './NotFound';

const presetAmounts = [21, 100, 500, 1000, 5000];

function getProfilePubkey(data: nip19.DecodedResult['data']): string | null {
  if (typeof data === 'string') return data;
  if ('pubkey' in data && typeof data.pubkey === 'string') return data.pubkey;
  return null;
}

function getDisplayName(author: ReturnType<typeof useAuthor>['data'], pubkey: string): string {
  return author?.metadata?.display_name || author?.metadata?.name || `${pubkey.slice(0, 8)}...${pubkey.slice(-4)}`;
}

function extractSatsFromReceipt(event: NostrEvent): number {
  const amountTag = event.tags.find(([name]) => name === 'amount')?.[1];
  if (amountTag) return Math.floor(parseInt(amountTag, 10) / 1000);

  const bolt11 = event.tags.find(([name]) => name === 'bolt11')?.[1];
  if (bolt11) {
    try {
      return nip57.getSatoshisAmountFromBolt11(bolt11);
    } catch {
      return 0;
    }
  }

  return 0;
}

function extractZapComment(event: NostrEvent): string {
  const description = event.tags.find(([name]) => name === 'description')?.[1];
  if (!description) return '';

  try {
    const parsed: unknown = JSON.parse(description);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'content' in parsed &&
      typeof parsed.content === 'string'
    ) {
      return parsed.content;
    }
  } catch {
    return '';
  }

  return '';
}

function PublicZapPage({ pubkey }: { pubkey: string }) {
  const { nostr } = useNostr();
  const { toast } = useToast();
  const author = useAuthor(pubkey);
  const displayName = getDisplayName(author.data, pubkey);
  const lightningAddress = author.data?.metadata?.lud16 || author.data?.metadata?.lud06 || '';
  const profileUrl = typeof window !== 'undefined' ? window.location.href : '';
  const [amount, setAmount] = useState<number | string>(100);
  const [comment, setComment] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState<'invoice' | 'link' | null>(null);
  const { invoice, isLoading: isInvoiceLoading, error: invoiceError, generate, reset } = useGuestInvoice();

  const { data: receipts, isLoading: receiptsLoading } = useQuery<NostrEvent[], Error>({
    queryKey: ['nostr', 'public-zap-page', 'receipts', pubkey],
    queryFn: ({ signal }) => nostr.query(
      [{ kinds: [9735], '#p': [pubkey], limit: 12 }],
      { signal },
    ),
    staleTime: 30000,
  });

  const recentReceipts = useMemo(() => {
    return (receipts ?? [])
      .map((event) => ({
        id: event.id,
        amount: extractSatsFromReceipt(event),
        comment: extractZapComment(event),
        createdAt: event.created_at,
      }))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [receipts]);

  const totalSats = useMemo(
    () => (receipts ?? []).reduce((total, event) => total + extractSatsFromReceipt(event), 0),
    [receipts],
  );

  useEffect(() => {
    let cancelled = false;
    async function buildQrCode() {
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
      } catch {
        if (!cancelled) setQrCodeUrl('');
      }
    }

    buildQrCode();
    return () => {
      cancelled = true;
    };
  }, [invoice]);

  const handleGenerate = async () => {
    const sats = typeof amount === 'string' ? parseInt(amount, 10) : amount;
    if (!lightningAddress) {
      toast({
        title: 'Lightning address missing',
        description: 'This Nostr profile does not have a Lightning address configured.',
        variant: 'destructive',
      });
      return;
    }
    if (!sats || sats <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Enter a valid amount in satoshis.',
        variant: 'destructive',
      });
      return;
    }
    await generate(lightningAddress, sats);
  };

  const handleCopy = async (value: string, type: 'invoice' | 'link') => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    toast({
      title: type === 'invoice' ? 'Invoice copied' : 'Link copied',
      description: type === 'invoice' ? 'Paste it into any Lightning wallet.' : 'Share this ZapQR page anywhere.',
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Zap ${displayName}`,
      text: `Send a Lightning zap to ${displayName} on ZapQR.`,
      url: profileUrl,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await handleCopy(profileUrl, 'link');
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <UserAvatar pubkey={pubkey} size="lg" className="size-16" />
                  <div className="min-w-0">
                    {author.isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-4 w-56" />
                      </div>
                    ) : (
                      <>
                        <h1 className="text-2xl font-bold tracking-tight truncate">{displayName}</h1>
                        <p className="text-sm text-muted-foreground font-mono truncate">{nip19.npubEncode(pubkey)}</p>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={handleShare} className="gap-2">
                  <ExternalLinkIcon className="h-4 w-4" />
                  Share
                </Button>
              </div>

              {author.data?.metadata?.about && (
                <p className="text-sm text-muted-foreground mt-5 max-w-2xl">
                  {author.data.metadata.about}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Zaps</CardTitle>
              <CardDescription>
                Public NIP-57 zap receipts for this profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total received</p>
                  {receiptsLoading ? <Skeleton className="h-7 w-24 mt-1" /> : <p className="text-2xl font-bold">{totalSats.toLocaleString()} sats</p>}
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Zap receipts</p>
                  {receiptsLoading ? <Skeleton className="h-7 w-12 mt-1" /> : <p className="text-2xl font-bold">{(receipts ?? []).length}</p>}
                </div>
              </div>

              {receiptsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : recentReceipts.length > 0 ? (
                <div className="space-y-3">
                  {recentReceipts.map((receipt) => (
                    <div key={receipt.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold">{receipt.amount.toLocaleString()} sats</p>
                          {receipt.comment && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              &ldquo;{receipt.comment}&rdquo;
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0">
                          {new Date(receipt.createdAt * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-10 text-center">
                    <ZapIcon className="h-9 w-9 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">No public zap receipts found yet.</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCodeIcon className="h-5 w-5 text-amber-500" />
              Zap {displayName}
            </CardTitle>
            <CardDescription>
              Generate a Lightning invoice and pay with any wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1">
              <p className="text-sm font-medium">Lightning address</p>
              {author.isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : lightningAddress ? (
                <div className="rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm break-all">
                  {lightningAddress}
                </div>
              ) : (
                <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                  This profile does not have a Lightning address configured.
                </p>
              )}
            </div>

            <ToggleGroup
              type="single"
              value={String(amount)}
              onValueChange={(value) => value && setAmount(parseInt(value, 10))}
              className="grid grid-cols-5 gap-1"
            >
              {presetAmounts.map((preset) => (
                <ToggleGroupItem key={preset} value={String(preset)} className="text-xs px-1">
                  {preset >= 1000 ? `${preset / 1000}k` : preset}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Amount in sats"
            />
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={2}
              placeholder="Message for your wallet records (optional)"
            />

            <Button onClick={handleGenerate} disabled={!lightningAddress || isInvoiceLoading} className="w-full gap-2" size="lg">
              <ZapIcon className="h-4 w-4" />
              {isInvoiceLoading ? 'Creating Invoice...' : 'Generate QR Code'}
            </Button>

            {invoiceError && (
              <p className="text-sm text-destructive">{invoiceError}</p>
            )}

            {invoice && (
              <div className="space-y-4 rounded-lg border p-3">
                <div className="aspect-square rounded-lg bg-white p-3">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Lightning invoice QR code" className="h-full w-full object-contain" />
                  ) : (
                    <Skeleton className="h-full w-full rounded-md" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Input value={invoice} readOnly className="font-mono text-xs" onClick={(event) => event.currentTarget.select()} />
                  <Button variant="outline" size="icon" onClick={() => handleCopy(invoice, 'invoice')}>
                    {copied === 'invoice' ? <Tick01Icon className="h-4 w-4 text-green-600" /> : <Copy01Icon className="h-4 w-4" />}
                  </Button>
                </div>
                <Button variant="outline" onClick={reset} className="w-full">
                  New Invoice
                </Button>
              </div>
            )}

            <Button variant="ghost" onClick={() => handleCopy(profileUrl, 'link')} className="w-full gap-2">
              {copied === 'link' ? <Tick01Icon className="h-4 w-4 text-green-600" /> : <Copy01Icon className="h-4 w-4" />}
              Copy Page Link
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();

  if (!identifier) {
    return <NotFound />;
  }

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  const { type } = decoded;

  switch (type) {
    case 'npub':
    case 'nprofile': {
      const pubkey = getProfilePubkey(decoded.data);
      return pubkey ? <PublicZapPage pubkey={pubkey} /> : <NotFound />;
    }

    case 'note':
      // AI agent should implement note view here
      return <div>Note placeholder</div>;

    case 'nevent':
      // AI agent should implement event view here
      return <div>Event placeholder</div>;

    case 'naddr':
      // AI agent should implement addressable event view here
      return <div>Addressable event placeholder</div>;

    default:
      return <NotFound />;
  }
} 
