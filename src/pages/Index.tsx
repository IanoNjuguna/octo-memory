import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { nip19 } from 'nostr-tools';
import { ZapIcon, ScanIcon, ArrowRight01Icon, Wallet01Icon, QrCodeIcon, LeftToRightListBulletIcon, BookOpen01Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { Separator } from '@/components/ui/separator';
import { NetworkSelector } from '@/components/NetworkSelector';

const Index = () => {
  useSeoMeta({
    title: 'ZapQR — Receive Bitcoin Lightning Payments',
    description: 'Generate QR codes to receive Lightning zaps. Scan to pay, instant settlement via Nostr.',
  });

  const { user } = useCurrentUser();
  const publicProfilePath = user ? `/${nip19.npubEncode(user.pubkey)}` : '/receive';
  const demoCampaignPath = user
    ? `/${nip19.npubEncode(user.pubkey)}?title=Hackathon%20Demo&goal=10000&description=Support%20this%20ZapQR%20demo`
    : '/receive';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            Receive Lightning Zaps{' '}
            <span className="text-primary">Instantly</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Generate a QR code, share it anywhere, and receive Bitcoin micropayments
            from anyone with a Lightning wallet. No signup required for payers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {user ? (
              <>
                <Button asChild size="lg" className="gap-2">
                  <Link to="/receive">
                    <QrCodeIcon className="h-5 w-5" />
                    Generate QR Code
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/ledger">
                    <LeftToRightListBulletIcon className="h-5 w-5" />
                    View Ledger
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <a href="/docs/">
                    <BookOpen01Icon className="h-5 w-5" />
                    Docs
                  </a>
                </Button>
              </>
            ) : (
              <LoginArea className="max-w-60" />
            )}
          </div>
          <div className="max-w-md mx-auto pt-2">
            <NetworkSelector />
          </div>
        </div>
      </section>

      <Separator />

      {user && (
        <section className="max-w-5xl mx-auto px-4 py-12 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Public Tools</h2>
            <p className="text-muted-foreground max-w-2xl">
              These are the Soapbox/Nostr sharing features. They live on your public Nostr profile route, not on the private receive screen.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <QrCodeIcon className="h-6 w-6 text-amber-500" />
                <div>
                  <h3 className="font-semibold">Public Zap Page</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    View the page other people can open to zap your Nostr profile.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to={publicProfilePath}>Open Public Page</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <ZapIcon className="h-6 w-6 text-amber-500" />
                <div>
                  <h3 className="font-semibold">Campaign Demo</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Open a sample campaign URL with goal, progress, supporters, and sharing.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to={demoCampaignPath}>Open Campaign</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Wallet01Icon className="h-6 w-6 text-amber-500" />
                <div>
                  <h3 className="font-semibold">Profile Setup</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your Lightning address so ZapQR can create invoices.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/profile">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Three simple steps to receive Lightning payments.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-8 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <ZapIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-lg">1. Enter Amount</h3>
              <p className="text-sm text-muted-foreground">
                Choose how many satoshis you want to receive, add an optional message.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-8 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <QrCodeIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-lg">2. Share QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Display the QR code on your screen, share a screenshot, or embed it anywhere.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-8 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <ScanIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-lg">3. Get Paid Instantly</h3>
              <p className="text-sm text-muted-foreground">
                Payer scans with any Lightning wallet. You see confirmation in seconds.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-16 md:pb-20 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Why ZapQR?</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: ZapIcon,
              title: 'Instant Settlement',
              desc: 'Payments settle on the Lightning Network in seconds. No waiting, no intermediaries.',
            },
            {
              icon: Wallet01Icon,
              title: 'Any Lightning Wallet',
              desc: 'Payers can use Wallet of Satoshi, Phoenix, Breez, Alby, or any BOLT11-compatible wallet.',
            },
            {
              icon: QrCodeIcon,
              title: 'No Payer Signup',
              desc: 'Payers just scan and pay — no account creation, no Nostr login required.',
            },
            {
              icon: LeftToRightListBulletIcon,
              title: 'Built-in Ledger',
              desc: 'All received zaps are recorded in your personal ledger with payer info and timestamps.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardContent className="pt-6 flex gap-4">
                <Icon className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20 text-center space-y-6">
        <Separator className="mb-10" />
        <h2 className="text-2xl md:text-3xl font-bold">Ready to receive zaps?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Log in with your Nostr account that has a Lightning address configured.
        </p>
        {user ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/receive">
                Start Receiving <ArrowRight01Icon className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a href="/docs/">
                <BookOpen01Icon className="h-5 w-5" />
                Read the Docs
              </a>
            </Button>
          </div>
        ) : (
          <LoginArea className="max-w-60" />
        )}
        <p className="text-xs text-muted-foreground pt-6">
          <a
            href="https://shakespeare.diy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Vibed with Shakespeare
          </a>
        </p>
      </section>
    </div>
  );
};

export default Index;
