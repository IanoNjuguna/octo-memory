import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Zap,
  QrCode,
  Wallet,
  Shield,
  Clock,
  Globe,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const sidebarSections = [
  {
    title: 'Getting Started',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'quickstart', label: 'Quick Start' },
      { id: 'requirements', label: 'Requirements' },
    ],
  },
  {
    title: 'Receiving Zaps',
    items: [
      { id: 'create-invoice', label: 'Creating an Invoice' },
      { id: 'qr-codes', label: 'QR Codes' },
      { id: 'payment-status', label: 'Payment Status' },
    ],
  },
  {
    title: 'Wallet Setup',
    items: [
      { id: 'lightning-address', label: 'Lightning Address' },
      { id: 'nwc', label: 'Nostr Wallet Connect' },
      { id: 'webln', label: 'WebLN Extensions' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { id: 'nip57', label: 'NIP-57 Zaps' },
      { id: 'ledger', label: 'Zap Ledger' },
      { id: 'faq', label: 'FAQ' },
    ],
  },
];

export default function DocsPage() {
  useSeoMeta({
    title: 'Documentation — ZapQR',
    description: 'Learn how to use ZapQR to receive Bitcoin Lightning payments via QR codes.',
  });

  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setSidebarOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const Sidebar = () => (
    <nav className="space-y-6">
      {sidebarSections.map((section) => (
        <div key={section.title}>
          <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </h4>
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                    activeSection === item.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 lg:hidden rounded-md border p-2 bg-background shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle documentation sidebar"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-muted/50 border-r transform transition-transform duration-200 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="h-14 flex items-center px-4 border-b">
          <Link to="/docs" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-5 w-5 text-primary" />
            ZapQR Docs
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-3.5rem)] p-4">
          <Sidebar />
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 lg:px-8 space-y-16">
          {/* Overview */}
          <section id="overview" className="scroll-mt-16 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Overview</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              ZapQR lets you receive Bitcoin Lightning micropayments ("zaps") by generating
              a QR code that anyone with a Lightning wallet can scan and pay. Built on the
              Nostr protocol and NIP-57 zap standard, it requires no backend server — just
              a Nostr account with a Lightning address.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {[
                { icon: Zap, title: 'Instant Settlement', desc: 'Payments clear on the Lightning Network in seconds.' },
                { icon: Globe, title: 'Any Wallet', desc: 'Works with Wallet of Satoshi, Phoenix, Alby, Breez, and more.' },
                { icon: Shield, title: 'No Backend', desc: 'All invoice logic runs in your browser. No server to manage.' },
                { icon: Clock, title: 'Real-Time Updates', desc: 'Payment detected in 1-5 seconds via Nostr relay subscriptions.' },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title}>
                  <CardContent className="pt-6 flex gap-3">
                    <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm">{title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Separator />

          {/* Quick Start */}
          <section id="quickstart" className="scroll-mt-16 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Quick Start</h2>
            <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
              <li className="leading-relaxed">
                <strong className="text-foreground">Log in with Nostr.</strong>{' '}
                Click the login button and sign in with a Nostr extension (Alby, nos2x),
                nsec, or remote signer.
              </li>
              <li className="leading-relaxed">
                <strong className="text-foreground">Set up a Lightning address.</strong>{' '}
                Get a free Lightning address from{' '}
                <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Alby
                </a>{' '}
                or{' '}
                <a href="https://lnbits.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  LNbits
                </a>{' '}
                and add it to your Nostr profile (<code>lud16</code> field).
              </li>
              <li className="leading-relaxed">
                <strong className="text-foreground">Navigate to Receive.</strong>{' '}
                Go to <Link to="/receive" className="text-primary underline">/receive</Link> and enter an amount in satoshis.
              </li>
              <li className="leading-relaxed">
                <strong className="text-foreground">Generate QR code.</strong>{' '}
                Tap "Generate QR Code" — a BOLT11 Lightning invoice QR appears.
              </li>
              <li className="leading-relaxed">
                <strong className="text-foreground">Share and get paid.</strong>{' '}
                Show the QR to a payer, or copy the invoice string. The payer scans with any Lightning wallet and pays.
                You see confirmation within seconds.
              </li>
            </ol>
            <Button asChild className="mt-4 gap-2">
              <Link to="/receive">
                Try it now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </section>

          <Separator />

          {/* Requirements */}
          <section id="requirements" className="scroll-mt-16 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Requirements</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">For Recipients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• A Nostr account with a Lightning address (<code>lud16</code> or <code>lud06</code>)</p>
                  <p>• A modern web browser (Chrome, Firefox, Safari)</p>
                  <p>• Internet connection to reach Nostr relays</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">For Payers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Any Lightning-enabled Bitcoin wallet</p>
                  <p>• A camera to scan the QR code (or paste invoice)</p>
                  <p>• No account or login required</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* Creating an Invoice */}
          <section id="create-invoice" className="scroll-mt-16 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Creating an Invoice</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you generate a zap invoice, ZapQR performs these steps:
            </p>
            <Card>
              <CardContent className="pt-6 space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono text-xs">1</span>
                  <p className="text-muted-foreground">Creates a NIP-57 zap request (kind 9734) signed with your Nostr key.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono text-xs">2</span>
                  <p className="text-muted-foreground">Sends the zap request to your LNURL-pay endpoint (resolved from your <code>lud16</code>).</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono text-xs">3</span>
                  <p className="text-muted-foreground">Receives a BOLT11 Lightning invoice in return.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono text-xs">4</span>
                  <p className="text-muted-foreground">Encodes the invoice as a QR code and begins monitoring for settlement.</p>
                </div>
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground">
              Invoices are single-use and expire after approximately 1 hour. You can regenerate a fresh one at any time.
            </p>
          </section>

          <Separator />

          {/* QR Codes */}
          <section id="qr-codes" className="scroll-mt-16 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">QR Codes</h2>
            <p className="text-muted-foreground leading-relaxed">
              ZapQR generates BOLT11 invoice QR codes. These encode the Lightning invoice string
              directly in the QR, so any wallet that scans it can pay immediately — no intermediate
              step or server lookup required.
            </p>
            <Card>
              <CardContent className="pt-6 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <QrCode className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">BOLT11 Format</p>
                    <p className="text-muted-foreground mt-0.5">
                      The QR contains a <code>lightning:lnbc...</code> URI. Wallets decode the amount,
                      description, and expiry directly from the invoice.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Copy className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Copy Fallback</p>
                    <p className="text-muted-foreground mt-0.5">
                      If scanning is not an option, payers can tap "Copy Invoice" and paste
                      it into their wallet's "Pay Invoice" field.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Deep Link</p>
                    <p className="text-muted-foreground mt-0.5">
                      The "Open in Lightning Wallet" button triggers a <code>lightning:</code> deep link
                      that opens on mobile directly in the user's wallet app.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Payment Status */}
          <section id="payment-status" className="scroll-mt-16 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Payment Status</h2>
            <p className="text-muted-foreground leading-relaxed">
              After generating an invoice, ZapQR monitors Nostr relays for a NIP-57 zap receipt
              (kind 9735) that confirms the payment was settled.
            </p>
            <div className="space-y-3">
              {[
                { status: 'Awaiting', desc: 'Invoice is active. A spinner shows until payment is received or the invoice expires (~1 hour).', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
                { status: 'Received', desc: 'Payment confirmed! The amount is displayed with a green checkmark and receipt details.', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
                { status: 'Expired', desc: 'The invoice has timed out without payment. Tap "Generate New Invoice" to create a fresh one.', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
              ].map(({ status, desc, color }) => (
                <Card key={status}>
                  <CardContent className="pt-4 flex items-start gap-3">
                    <span className={cn('shrink-0 px-2 py-0.5 rounded text-xs font-mono font-medium', color)}>
                      {status}
                    </span>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Separator />

          {/* Lightning Address */}
          <section id="lightning-address" className="scroll-mt-16 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Lightning Address Setup</h2>
            <p className="text-muted-foreground leading-relaxed">
              ZapQR uses your Nostr profile's Lightning address (<code>lud16</code> field) to create
              invoices. Here's how to get one:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Alby</CardTitle>
                  <CardDescription>Free, browser extension + web</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    1. Sign up at{' '}
                    <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">getalby.com</a>
                  </p>
                  <p className="text-muted-foreground">
                    2. Your Lightning address will be <code>yourname@getalby.com</code>
                  </p>
                  <p className="text-muted-foreground">
                    3. Add it to your Nostr profile as <code>lud16</code>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">LNbits</CardTitle>
                  <CardDescription>Self-hosted or cloud</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    1. Set up at{' '}
                    <a href="https://lnbits.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">lnbits.com</a>{' '}
                    or self-host
                  </p>
                  <p className="text-muted-foreground">
                    2. Enable the LNURLp extension
                  </p>
                  <p className="text-muted-foreground">
                    3. Set your <code>lud16</code> to your LNbits LNURL-pay callback
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* NWC */}
          <section id="nwc" className="scroll-mt-16 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Nostr Wallet Connect (NWC)</h2>
            <p className="text-muted-foreground leading-relaxed">
              NWC (NIP-47) lets you connect a remote Lightning wallet to ZapQR. Once connected,
              you can pay invoices directly without manual QR scanning or copy-paste. This is
              primarily useful if you use ZapQR to send zaps (via the ZapButton on posts).
            </p>
            <Card>
              <CardContent className="pt-6 text-sm space-y-2">
                <p className="text-muted-foreground">
                  To connect an NWC wallet, open the Wallet settings (via the wallet icon in the header
                  or settings page), paste your <code>nostr+walletconnect://</code> URI, and confirm.
                </p>
                <p className="text-muted-foreground">
                  Supported NWC wallets include Alby Hub, Alby Go, Mutiny, and any NIP-47-compatible wallet.
                </p>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* WebLN */}
          <section id="webln" className="scroll-mt-16 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">WebLN Browser Extensions</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have a WebLN-compatible browser extension installed (like Alby), ZapQR
              automatically detects it and offers a one-click "Pay with WebLN" button whenever
              an invoice is displayed.
            </p>
            <p className="text-sm text-muted-foreground">
              WebLN is the fastest way to pay — no QR scanning, no copy-paste. The extension
              handles invoice payment with a single confirmation click.
            </p>
          </section>

          <Separator />

          {/* NIP-57 */}
          <section id="nip57" className="scroll-mt-16 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">NIP-57: Zaps</h2>
            <p className="text-muted-foreground leading-relaxed">
              ZapQR implements the{' '}
              <a href="https://github.com/nostr-protocol/nips/blob/master/57.md" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                NIP-57 Zaps
              </a>{' '}
              protocol. Here's how it works under the hood:
            </p>
            <Card>
              <CardContent className="pt-6 space-y-3 text-sm">
                <div className="flex gap-3">
                  <Wallet className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Zap Request (kind 9734)</p>
                    <p className="text-muted-foreground mt-0.5">
                      Created by the recipient's client and sent to their LNURL-pay endpoint.
                      Contains the amount, recipient pubkey, relays, and optional comment.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Zap Receipt (kind 9735)</p>
                    <p className="text-muted-foreground mt-0.5">
                      Published by the LNURL service after the Lightning invoice is paid.
                      Contains the bolt11 invoice, preimage, and a reference to the zap request.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Ledger */}
          <section id="ledger" className="scroll-mt-16 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Zap Ledger</h2>
            <p className="text-muted-foreground leading-relaxed">
              The <Link to="/ledger" className="text-primary underline">Zap Ledger</Link> displays
              your complete zap receipt history. It queries Nostr relays for all kind 9735 events where
              you are the recipient (<code>#p</code> tag), and shows:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Amount received (in satoshis)</li>
              <li>Payer's Nostr identity (when available)</li>
              <li>Comment or message attached to the zap</li>
              <li>Timestamp of the payment</li>
              <li>Running total of all zaps received</li>
            </ul>
          </section>

          <Separator />

          {/* FAQ */}
          <section id="faq" className="scroll-mt-16 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">FAQ</h2>
            {[
              {
                q: 'Do payers need a Nostr account?',
                a: 'No. Payers only need a Lightning wallet. They scan the QR code and pay — no login, no account creation.',
              },
              {
                q: 'What wallets are supported for paying?',
                a: 'Any BOLT11-compatible Lightning wallet: Wallet of Satoshi, Phoenix, Breez, Alby, BlueWallet, Zeus, and many more.',
              },
              {
                q: 'Is there a maximum zap amount?',
                a: 'No hard limit in ZapQR itself, but your LNURL-pay provider may impose limits. Alby typically caps at 1,000,000 sats per invoice.',
              },
              {
                q: 'Do I need to run a server?',
                a: 'No. ZapQR is entirely client-side. Invoices are created by calling your LNURL-pay endpoint (hosted by Alby, LNbits, etc.), and payment detection happens through Nostr relays.',
              },
              {
                q: 'How fast is payment detection?',
                a: 'Typically 1-5 seconds after the payer sends the Lightning payment. ZapQR uses real-time Nostr relay subscriptions for instant detection, with polling as a fallback.',
              },
              {
                q: 'Can I embed the QR code on my website?',
                a: 'Yes! Future versions will support an embeddable QR widget. For now, you can screenshot the QR or share the invoice string.',
              },
              {
                q: 'What happens if I close the browser?',
                a: 'The invoice remains valid until its expiry (~1 hour). When you reopen the app, the ledger will catch up by querying relays for recent receipts.',
              },
            ].map(({ q, a }) => (
              <Card key={q}>
                <CardContent className="pt-5">
                  <h3 className="font-semibold text-sm">{q}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{a}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Bottom padding */}
          <div className="h-16" />
        </div>
      </main>
    </div>
  );
}
