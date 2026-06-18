import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSeoMeta } from '@unhead/react';
import { nip19, nip57 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useParams, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { Copy01Icon, ExternalLinkIcon, QrCodeIcon, Tick01Icon, ZapIcon } from '@/components/icons';
import { UserAvatar } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Progress } from '@/components/ui/progress';
import { LoginArea } from '@/components/auth/LoginArea';
import { NetworkSelector } from '@/components/NetworkSelector';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useGuestInvoice } from '@/hooks/useGuestInvoice';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import NotFound from './NotFound';

const presetAmounts = [21, 100, 500, 1000, 5000];
const ZAPQR_CAMPAIGN_KIND = 30078;
const ZAPQR_CAMPAIGN_D_PREFIX = 'pub.zapqr/campaign/';

interface ProfileRouteData {
  pubkey: string;
  relays: string[];
}

interface CampaignData {
  title: string;
  description: string;
  goalSats: number;
  bannerUrl?: string;
  identifier?: string;
  eventId?: string;
}

function sanitizeHttpsUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function normalizeRelayUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'wss:' && url.protocol !== 'ws:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

function uniqueRelayUrls(relays: string[]): string[] {
  return Array.from(
    new Set(
      relays
        .map(normalizeRelayUrl)
        .filter((relay): relay is string => Boolean(relay)),
    ),
  );
}

function getProfileRouteData(data: nip19.DecodedResult['data']): ProfileRouteData | null {
  if (typeof data === 'string') {
    return { pubkey: data, relays: [] };
  }

  if ('pubkey' in data && typeof data.pubkey === 'string') {
    return {
      pubkey: data.pubkey,
      relays: 'relays' in data && Array.isArray(data.relays)
        ? uniqueRelayUrls(data.relays.filter((relay): relay is string => typeof relay === 'string'))
        : [],
    };
  }

  return null;
}

function getDisplayName(author: ReturnType<typeof useAuthor>['data'], pubkey: string): string {
  return author?.metadata?.display_name || author?.metadata?.name || `${pubkey.slice(0, 8)}...${pubkey.slice(-4)}`;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'Z';
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

function extractPayerPubkey(event: NostrEvent): string {
  const description = event.tags.find(([name]) => name === 'description')?.[1];
  if (!description) return '';

  try {
    const parsed: unknown = JSON.parse(description);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'pubkey' in parsed &&
      typeof parsed.pubkey === 'string'
    ) {
      return parsed.pubkey;
    }
  } catch {
    return '';
  }

  return '';
}

function parseCampaign(searchParams: URLSearchParams): CampaignData | null {
  const title = searchParams.get('title')?.trim();
  const goal = parseInt(searchParams.get('goal') ?? '', 10);

  if (!title || !Number.isFinite(goal) || goal <= 0) {
    return null;
  }

  return {
    title: title.slice(0, 90),
    description: (searchParams.get('description') ?? '').trim().slice(0, 500),
    goalSats: goal,
    bannerUrl: sanitizeHttpsUrl(searchParams.get('banner') ?? undefined),
  };
}

function buildCampaignUrl(baseUrl: string, campaign: CampaignData): string {
  const url = new URL(baseUrl);
  url.searchParams.set('title', campaign.title);
  url.searchParams.set('goal', String(campaign.goalSats));
  if (campaign.description) {
    url.searchParams.set('description', campaign.description);
  } else {
    url.searchParams.delete('description');
  }
  if (campaign.bannerUrl) {
    url.searchParams.set('banner', campaign.bannerUrl);
  } else {
    url.searchParams.delete('banner');
  }
  return url.toString();
}

function slugifyCampaignTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug || 'campaign';
}

function parseCampaignEvent(event: NostrEvent): CampaignData | null {
  if (event.kind !== ZAPQR_CAMPAIGN_KIND) return null;

  const identifier = event.tags.find(([name]) => name === 'd')?.[1];
  if (!identifier?.startsWith(ZAPQR_CAMPAIGN_D_PREFIX)) return null;

  const title = event.tags.find(([name]) => name === 'title')?.[1]?.trim();
  const goal = parseInt(event.tags.find(([name]) => name === 'goal')?.[1] ?? '', 10);

  if (!title || !Number.isFinite(goal) || goal <= 0) return null;

  return {
    title: title.slice(0, 90),
    description: (event.tags.find(([name]) => name === 'summary')?.[1] ?? event.content).trim().slice(0, 500),
    goalSats: goal,
    bannerUrl: sanitizeHttpsUrl(event.tags.find(([name]) => name === 'image')?.[1]),
    identifier,
    eventId: event.id,
  };
}

function buildShareCardSvg({
  title,
  subtitle,
  displayName,
  totalSats,
  goalSats,
}: {
  title: string;
  subtitle: string;
  displayName: string;
  totalSats: number;
  goalSats?: number;
}): string {
  const escapeSvg = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const progressText = goalSats
    ? `${totalSats.toLocaleString()} / ${goalSats.toLocaleString()} sats`
    : `${totalSats.toLocaleString()} sats received`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#111827"/>
  <rect x="56" y="56" width="1088" height="518" rx="36" fill="#f8fafc"/>
  <circle cx="154" cy="154" r="58" fill="#f59e0b"/>
  <text x="154" y="174" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="800" fill="#111827">${escapeSvg(getInitials(displayName))}</text>
  <text x="244" y="130" font-family="Inter, Arial, sans-serif" font-size="28" fill="#64748b">ZapQR</text>
  <text x="244" y="178" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="800" fill="#111827">${escapeSvg(displayName)}</text>
  <text x="92" y="300" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="900" fill="#111827">${escapeSvg(title)}</text>
  <text x="92" y="362" font-family="Inter, Arial, sans-serif" font-size="30" fill="#475569">${escapeSvg(subtitle)}</text>
  <rect x="92" y="430" width="500" height="76" rx="20" fill="#fef3c7"/>
  <text x="126" y="480" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="800" fill="#92400e">${escapeSvg(progressText)}</text>
  <text x="92" y="548" font-family="Inter, Arial, sans-serif" font-size="24" fill="#64748b">Bitcoin Lightning payments with Nostr receipts</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function PayerInfo({ pubkey }: { pubkey: string }) {
  const payer = useAuthor(pubkey);
  const name = payer.data?.metadata?.display_name || payer.data?.metadata?.name;

  if (payer.isLoading) {
    return (
      <span className="flex items-center gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 min-w-0">
      <UserAvatar pubkey={pubkey} size="sm" />
      <span className="truncate">{name || `${pubkey.slice(0, 8)}...`}</span>
    </span>
  );
}

function PublicZapPage({
  pubkey,
  relayHints,
  campaignEvent,
}: {
  pubkey: string;
  relayHints: string[];
  campaignEvent?: CampaignData | null;
}) {
  const { nostr } = useNostr();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent, isPending: isPublishing } = useNostrPublish();
  const author = useAuthor(pubkey);
  const displayName = getDisplayName(author.data, pubkey);
  const lightningAddress = author.data?.metadata?.lud16 || author.data?.metadata?.lud06 || '';
  const profileUrl = typeof window !== 'undefined' ? window.location.href : '';
  const baseProfileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : '';
  const profileImage = sanitizeHttpsUrl(author.data?.metadata?.picture);
  const urlCampaign = useMemo(() => parseCampaign(searchParams), [searchParams]);
  const campaign = campaignEvent ?? urlCampaign;
  const [amount, setAmount] = useState<number | string>(100);
  const [comment, setComment] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState<'invoice' | 'link' | 'post' | null>(null);
  const [campaignTitle, setCampaignTitle] = useState(campaign?.title ?? '');
  const [campaignGoal, setCampaignGoal] = useState<number | string>(campaign?.goalSats ?? 10000);
  const [campaignDescription, setCampaignDescription] = useState(campaign?.description ?? '');
  const [campaignBanner, setCampaignBanner] = useState(campaign?.bannerUrl ?? '');
  const { invoice, isLoading: isInvoiceLoading, error: invoiceError, generate, reset } = useGuestInvoice();
  const hintedRelayUrls = useMemo(() => uniqueRelayUrls(relayHints), [relayHints]);

  const { data: receipts, isLoading: receiptsLoading } = useQuery<NostrEvent[], Error>({
    queryKey: ['nostr', 'public-zap-page', 'receipts', pubkey, hintedRelayUrls],
    queryFn: async ({ signal }) => {
      const filters = [{ kinds: [9735], '#p': [pubkey], limit: 12 }];
      const poolQuery = nostr.query(filters, { signal });

      if (hintedRelayUrls.length === 0) {
        return poolQuery;
      }

      const hintedQuery = nostr.group(hintedRelayUrls).query(filters, { signal });
      const results = await Promise.allSettled([poolQuery, hintedQuery]);
      const events = results.flatMap((result): NostrEvent[] => (
        result.status === 'fulfilled' ? result.value : []
      ));

      return Array.from(
        new Map(events.map((event) => [event.id, event])).values(),
      );
    },
    staleTime: 30000,
  });

  const recentReceipts = useMemo(() => {
    return (receipts ?? [])
      .map((event) => ({
        id: event.id,
        amount: extractSatsFromReceipt(event),
        comment: extractZapComment(event),
        payerPubkey: extractPayerPubkey(event),
        createdAt: event.created_at,
      }))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [receipts]);

  const totalSats = useMemo(
    () => (receipts ?? []).reduce((total, event) => total + extractSatsFromReceipt(event), 0),
    [receipts],
  );
  const progressPercent = campaign
    ? Math.min(100, Math.round((totalSats / campaign.goalSats) * 100))
    : 0;
  const remainingSats = campaign
    ? Math.max(0, campaign.goalSats - totalSats)
    : 0;

  const seoDescription = campaign
    ? `${campaign.title}: ${totalSats.toLocaleString()} of ${campaign.goalSats.toLocaleString()} sats raised on ZapQR.`
    : lightningAddress
    ? `Send a Bitcoin Lightning zap to ${displayName} at ${lightningAddress}.`
    : `View ${displayName}'s public ZapQR payment page.`;

  const shareCardImage = buildShareCardSvg({
    title: campaign?.title ?? `Zap ${displayName}`,
    subtitle: campaign?.description || seoDescription,
    displayName,
    totalSats,
    goalSats: campaign?.goalSats,
  });

  useSeoMeta({
    title: campaign ? `${campaign.title} — ZapQR` : `Zap ${displayName} — ZapQR`,
    description: seoDescription,
    ogTitle: campaign ? `${campaign.title} — ZapQR` : `Zap ${displayName} — ZapQR`,
    ogDescription: seoDescription,
    ogType: campaign ? 'website' : 'profile',
    ogUrl: profileUrl,
    ogImage: campaign?.bannerUrl ?? shareCardImage ?? profileImage,
    twitterCard: campaign?.bannerUrl || profileImage ? 'summary_large_image' : 'summary',
    twitterTitle: campaign ? `${campaign.title} — ZapQR` : `Zap ${displayName} — ZapQR`,
    twitterDescription: seoDescription,
    twitterImage: campaign?.bannerUrl ?? shareCardImage ?? profileImage,
  });

  const socialPost = useMemo(() => {
    if (campaign) {
      const progressText = `${totalSats.toLocaleString()} / ${campaign.goalSats.toLocaleString()} sats raised`;
      return [
        `${campaign.title}`,
        campaign.description,
        progressText,
        profileUrl,
        '\n#zapqr #lightning #bitcoin #nostr',
      ].filter(Boolean).join('\n\n');
    }

    const amountText = totalSats > 0 ? `\n\nAlready received ${totalSats.toLocaleString()} sats.` : '';
    return [
      `Zap ${displayName} with Bitcoin Lightning on ZapQR:`,
      profileUrl,
      amountText,
      '\n#zapqr #lightning #bitcoin #nostr',
    ].join('\n');
  }, [campaign, displayName, profileUrl, totalSats]);

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

  const handleCopy = async (value: string, type: 'invoice' | 'link' | 'post') => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    toast({
      title: type === 'invoice' ? 'Invoice copied' : type === 'post' ? 'Post copied' : 'Link copied',
      description: type === 'invoice'
        ? 'Paste it into any Lightning wallet.'
        : type === 'post'
          ? 'Paste it into Soapbox, Ditto, or any Nostr client.'
          : 'Share this ZapQR page anywhere.',
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: campaign ? campaign.title : `Zap ${displayName}`,
      text: socialPost,
      url: profileUrl,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await handleCopy(profileUrl, 'link');
  };

  const handleShareToDitto = async () => {
    if (navigator.share) {
      await navigator.share({
        title: campaign ? campaign.title : `Zap ${displayName}`,
        text: socialPost,
        url: profileUrl,
      });
      return;
    }

    await handleCopy(socialPost, 'post');
  };

  const handleCopyCampaignUrl = async () => {
    const goal = typeof campaignGoal === 'string' ? parseInt(campaignGoal, 10) : campaignGoal;
    const bannerUrl = sanitizeHttpsUrl(campaignBanner.trim());
    const title = campaignTitle.trim();

    if (!title || !goal || goal <= 0) {
      toast({
        title: 'Campaign details missing',
        description: 'Add a title and a positive goal amount.',
        variant: 'destructive',
      });
      return;
    }

    if (campaignBanner.trim() && !bannerUrl) {
      toast({
        title: 'Invalid banner URL',
        description: 'Use an HTTPS image URL for the campaign banner.',
        variant: 'destructive',
      });
      return;
    }

    const campaignUrl = buildCampaignUrl(baseProfileUrl, {
      title,
      goalSats: goal,
      description: campaignDescription.trim(),
      bannerUrl,
    });
    await handleCopy(campaignUrl, 'link');
  };

  const handlePublishCampaign = async () => {
    const goal = typeof campaignGoal === 'string' ? parseInt(campaignGoal, 10) : campaignGoal;
    const bannerUrl = sanitizeHttpsUrl(campaignBanner.trim());
    const title = campaignTitle.trim();

    if (!title || !goal || goal <= 0) {
      toast({
        title: 'Campaign details missing',
        description: 'Add a title and a positive goal amount.',
        variant: 'destructive',
      });
      return;
    }

    if (campaignBanner.trim() && !bannerUrl) {
      toast({
        title: 'Invalid banner URL',
        description: 'Use an HTTPS image URL for the campaign banner.',
        variant: 'destructive',
      });
      return;
    }

    const identifier = `${ZAPQR_CAMPAIGN_D_PREFIX}${slugifyCampaignTitle(title)}`;
    try {
      const event = await publishEvent({
        kind: ZAPQR_CAMPAIGN_KIND,
        content: campaignDescription.trim(),
        tags: [
          ['d', identifier],
          ['title', title],
          ['summary', campaignDescription.trim()],
          ['goal', String(goal), 'sats'],
          ['p', pubkey],
          ['r', baseProfileUrl],
          ['t', 'zapqr'],
          ['t', 'fundraising'],
          ['alt', `ZapQR fundraising campaign: ${title}`],
          ...(bannerUrl ? [['image', bannerUrl] as [string, string]] : []),
        ],
      });

      const campaignNaddr = nip19.naddrEncode({
        kind: ZAPQR_CAMPAIGN_KIND,
        pubkey: event.pubkey,
        identifier,
        relays: hintedRelayUrls,
      });
      await handleCopy(`${window.location.origin}/${campaignNaddr}`, 'link');
      toast({
        title: 'Campaign published',
        description: 'The Nostr campaign link was copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Could not publish campaign',
        description: error instanceof Error ? error.message : 'Sign in and try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePublishAnnouncement = async () => {
    try {
      await publishEvent({
        kind: 1,
        content: socialPost,
        tags: [
          ['p', pubkey],
          ['r', profileUrl],
          ['t', 'zapqr'],
          ['t', 'lightning'],
          ['t', 'bitcoin'],
          ['t', 'nostr'],
        ],
      });
      toast({
        title: 'Posted to Nostr',
        description: 'Your ZapQR page is now discoverable from Nostr and Soapbox-compatible clients.',
      });
    } catch (error) {
      toast({
        title: 'Could not post',
        description: error instanceof Error ? error.message : 'Sign in and try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {campaign && (
            <Card className="overflow-hidden">
              {campaign.bannerUrl && (
                <div className="aspect-[3/1] w-full overflow-hidden bg-muted">
                  <img src={campaign.bannerUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-3xl tracking-tight">{campaign.title}</CardTitle>
                {campaign.description && (
                  <CardDescription className="text-base">
                    {campaign.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progressPercent} />
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Raised</p>
                    <p className="font-semibold">{totalSats.toLocaleString()} sats</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Goal</p>
                    <p className="font-semibold">{campaign.goalSats.toLocaleString()} sats</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Remaining</p>
                    <p className="font-semibold">{remainingSats.toLocaleString()} sats</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

              {hintedRelayUrls.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {hintedRelayUrls.slice(0, 4).map((relay) => (
                    <span key={relay} className="rounded-full bg-muted px-3 py-1 text-xs font-mono text-muted-foreground">
                      {relay.replace(/^wss?:\/\//, '')}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Share on Nostr</CardTitle>
              <CardDescription>
                Copy, publish, or send this page through Ditto's native share target.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{socialPost}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" onClick={() => handleCopy(socialPost, 'post')} className="gap-2">
                  {copied === 'post' ? <Tick01Icon className="h-4 w-4 text-green-600" /> : <Copy01Icon className="h-4 w-4" />}
                  Copy Post
                </Button>
                <Button variant="outline" onClick={handleShareToDitto} className="gap-2">
                  <ExternalLinkIcon className="h-4 w-4" />
                  Share to Ditto
                </Button>
                {user ? (
                  <Button onClick={handlePublishAnnouncement} disabled={isPublishing} className="gap-2">
                    <ExternalLinkIcon className="h-4 w-4" />
                    {isPublishing ? 'Posting...' : 'Post to Nostr'}
                  </Button>
                ) : (
                  <LoginArea className="w-full" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Link</CardTitle>
              <CardDescription>
                Create a URL-backed campaign or publish a NIP-78 campaign event.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={campaignTitle}
                onChange={(event) => setCampaignTitle(event.target.value)}
                placeholder="Campaign title"
                maxLength={90}
              />
              <Input
                type="number"
                value={campaignGoal}
                onChange={(event) => setCampaignGoal(event.target.value)}
                min={1}
                placeholder="Goal in sats"
              />
              <Textarea
                value={campaignDescription}
                onChange={(event) => setCampaignDescription(event.target.value)}
                rows={3}
                placeholder="Campaign description"
                maxLength={500}
              />
              <Input
                value={campaignBanner}
                onChange={(event) => setCampaignBanner(event.target.value)}
                placeholder="Optional HTTPS banner image URL"
              />
              <Button variant="outline" onClick={handleCopyCampaignUrl} className="w-full gap-2">
                <Copy01Icon className="h-4 w-4" />
                Copy Campaign URL
              </Button>
              {user ? (
                <Button onClick={handlePublishCampaign} disabled={isPublishing} className="w-full gap-2">
                  <ExternalLinkIcon className="h-4 w-4" />
                  {isPublishing ? 'Publishing...' : 'Publish Nostr Campaign'}
                </Button>
              ) : (
                <LoginArea className="w-full" />
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
                          {receipt.payerPubkey && (
                            <div className="text-sm text-muted-foreground">
                              <PayerInfo pubkey={receipt.payerPubkey} />
                            </div>
                          )}
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
              {campaign ? 'Support Campaign' : `Zap ${displayName}`}
            </CardTitle>
            <CardDescription>
              Generate a Lightning invoice and pay with any wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <NetworkSelector compact />

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

function CampaignEventPage({
  pubkey,
  identifier,
  relayHints,
}: {
  pubkey: string;
  identifier: string;
  relayHints: string[];
}) {
  const { nostr } = useNostr();
  const hintedRelayUrls = useMemo(() => uniqueRelayUrls(relayHints), [relayHints]);
  const { data: event, isLoading, error } = useQuery<NostrEvent | null, Error>({
    queryKey: ['nostr', 'zapqr-campaign', pubkey, identifier, hintedRelayUrls],
    queryFn: async ({ signal }) => {
      const filters = [{
        kinds: [ZAPQR_CAMPAIGN_KIND],
        authors: [pubkey],
        '#d': [identifier],
        limit: 1,
      }];
      const poolQuery = nostr.query(filters, { signal });

      if (hintedRelayUrls.length === 0) {
        const events = await poolQuery;
        return events[0] ?? null;
      }

      const hintedQuery = nostr.group(hintedRelayUrls).query(filters, { signal });
      const results = await Promise.allSettled([poolQuery, hintedQuery]);
      const events = results.flatMap((result): NostrEvent[] => (
        result.status === 'fulfilled' ? result.value : []
      ));
      return events.sort((a, b) => b.created_at - a.created_at)[0] ?? null;
    },
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !event) {
    return <NotFound />;
  }

  const campaign = parseCampaignEvent(event);
  if (!campaign) {
    return <NotFound />;
  }

  return <PublicZapPage pubkey={event.pubkey} relayHints={hintedRelayUrls} campaignEvent={campaign} />;
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
      const profile = getProfileRouteData(decoded.data);
      return profile ? <PublicZapPage pubkey={profile.pubkey} relayHints={profile.relays} /> : <NotFound />;
    }

    case 'note':
      // AI agent should implement note view here
      return <div>Note placeholder</div>;

    case 'nevent':
      // AI agent should implement event view here
      return <div>Event placeholder</div>;

    case 'naddr': {
      const { kind, pubkey, identifier, relays } = decoded.data;
      if (kind !== ZAPQR_CAMPAIGN_KIND || !identifier.startsWith(ZAPQR_CAMPAIGN_D_PREFIX)) {
        return <NotFound />;
      }
      return <CampaignEventPage pubkey={pubkey} identifier={identifier} relayHints={uniqueRelayUrls(relays ?? [])} />;
    }

    default:
      return <NotFound />;
  }
} 
