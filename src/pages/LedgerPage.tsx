import { useMemo } from 'react';
import { useSeoMeta } from '@unhead/react';
import { useQuery } from '@tanstack/react-query';
import { Zap, ArrowUpRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { nip57 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { LoginArea } from '@/components/auth/LoginArea';
import { UserAvatar } from '@/components/UserAvatar';

interface LedgerEntry {
  id: string;
  amount: number;
  comment: string;
  payerPubkey: string;
  payerName?: string;
  timestamp: number;
  zapRequestId: string;
}

function extractSatsFromReceipt(event: NostrEvent): number {
  const amountTag = event.tags.find(([n]) => n === 'amount')?.[1];
  if (amountTag) return Math.floor(parseInt(amountTag) / 1000);

  const bolt11 = event.tags.find(([n]) => n === 'bolt11')?.[1];
  if (bolt11) {
    try {
      return nip57.getSatoshisAmountFromBolt11(bolt11);
    } catch { /* fall through */ }
  }

  const desc = event.tags.find(([n]) => n === 'description')?.[1];
  if (desc) {
    try {
      const req = JSON.parse(desc);
      const amt = req.tags?.find(([n]: string[]) => n === 'amount')?.[1];
      if (amt) return Math.floor(parseInt(amt) / 1000);
    } catch { /* fall through */ }
  }

  return 0;
}

function extractComment(event: NostrEvent): string {
  const desc = event.tags.find(([n]) => n === 'description')?.[1];
  if (!desc) return '';
  try {
    const req = JSON.parse(desc);
    return req.content || '';
  } catch {
    return '';
  }
}

function extractPayer(event: NostrEvent): string {
  // kind-9735 has the payer as the pubkey of the 'description' zap request
  const desc = event.tags.find(([n]) => n === 'description')?.[1];
  if (!desc) return '';
  try {
    const req = JSON.parse(desc);
    return req.pubkey || '';
  } catch {
    return '';
  }
}

function extractZapRequestId(event: NostrEvent): string {
  const eTag = event.tags.find(([n]) => n === 'e')?.[1];
  return eTag || '';
}

function PayerInfo({ pubkey }: { pubkey: string }) {
  const { data: payer, isLoading } = useAuthor(pubkey);

  if (isLoading) {
    return (
      <span className="flex items-center gap-2">
        <Skeleton className="size-5 rounded-full shrink-0" />
        <Skeleton className="h-3 w-16" />
      </span>
    );
  }

  const name = payer?.metadata?.name || payer?.metadata?.display_name;

  return (
    <span className="flex items-center gap-1.5">
      <UserAvatar pubkey={pubkey} size="sm" />
      {name ? (
        <span className="text-sm">{name}</span>
      ) : (
        <span className="font-mono text-xs text-muted-foreground">{pubkey.slice(0, 8)}…</span>
      )}
    </span>
  );
}

export default function LedgerPage() {
  useSeoMeta({
    title: 'Zap Ledger — ZapQR',
    description: 'View your received Bitcoin Lightning zap history.',
  });

  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  const { data: receipts, isLoading, error } = useQuery<NostrEvent[], Error>({
    queryKey: ['nostr', 'ledger', user?.pubkey],
    queryFn: async ({ signal }) => {
      if (!user?.pubkey) return [];
      return nostr.query(
        [{ kinds: [9735], '#p': [user.pubkey], limit: 100 }],
        { signal },
      );
    },
    enabled: !!user?.pubkey,
    staleTime: 30000,
    refetchInterval: 120000,
  });

  const entries = useMemo<LedgerEntry[]>(() => {
    if (!receipts) return [];
    return receipts
      .map((event): LedgerEntry => ({
        id: event.id,
        amount: extractSatsFromReceipt(event),
        comment: extractComment(event),
        payerPubkey: extractPayer(event),
        timestamp: event.created_at,
        zapRequestId: extractZapRequestId(event),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [receipts]);

  const totalSats = useMemo(
    () => entries.reduce((sum, e) => sum + e.amount, 0),
    [entries],
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center border-dashed">
          <CardHeader>
            <CardTitle>Zap Ledger</CardTitle>
            <CardDescription>
              Log in to view your zap history.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <LoginArea className="w-full max-w-60" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Zap Ledger</h1>
        <p className="text-muted-foreground text-sm">
          Your received Lightning payments
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Zap className="h-4 w-4" />
              <span>Total Received</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold">{totalSats.toLocaleString()} sats</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <ArrowUpRight className="h-4 w-4" />
              <span>Total Zaps</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{entries.length}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Entries */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-destructive">
              Failed to load zap history. Check your relay connections.
            </p>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Zap className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground max-w-sm mx-auto">
              No zaps received yet. Share your QR code to start receiving Lightning payments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg tabular-nums">{entry.amount.toLocaleString()} sats</p>
                    </div>
                    {entry.comment && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        &ldquo;{entry.comment}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      {entry.payerPubkey && (
                        <PayerInfo pubkey={entry.payerPubkey} />
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(entry.timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
