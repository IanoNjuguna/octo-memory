import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Zap, Scan, ArrowRight, Wallet, QrCode, List, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  useSeoMeta({
    title: 'ZapQR — Receive Bitcoin Lightning Payments',
    description: 'Generate QR codes to receive Lightning zaps. Scan to pay, instant settlement via Nostr.',
  });

  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/50 px-4 py-1.5 text-sm font-medium text-amber-800 dark:text-amber-200">
            <Zap className="h-4 w-4" />
            Bitcoin Lightning Micropayments
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            Receive Lightning Zaps{' '}
            <span className="text-amber-500">Instantly</span>
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
                    <QrCode className="h-5 w-5" />
                    Generate QR Code
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/ledger">
                    <List className="h-5 w-5" />
                    View Ledger
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/docs">
                    <BookOpen className="h-5 w-5" />
                    Docs
                  </Link>
                </Button>
              </>
            ) : (
              <LoginArea className="max-w-60" />
            )}
          </div>
        </div>
      </section>

      <Separator />

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
                <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
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
                <QrCode className="h-6 w-6 text-amber-600 dark:text-amber-400" />
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
                <Scan className="h-6 w-6 text-amber-600 dark:text-amber-400" />
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
              icon: Zap,
              title: 'Instant Settlement',
              desc: 'Payments settle on the Lightning Network in seconds. No waiting, no intermediaries.',
            },
            {
              icon: Wallet,
              title: 'Any Lightning Wallet',
              desc: 'Payers can use Wallet of Satoshi, Phoenix, Breez, Alby, or any BOLT11-compatible wallet.',
            },
            {
              icon: QrCode,
              title: 'No Payer Signup',
              desc: 'Payers just scan and pay — no account creation, no Nostr login required.',
            },
            {
              icon: List,
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
                Start Receiving <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/docs">
                <BookOpen className="h-5 w-5" />
                Read the Docs
              </Link>
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
