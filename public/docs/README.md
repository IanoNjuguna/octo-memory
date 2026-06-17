# ZapQR Documentation

ZapQR lets you receive **Bitcoin Lightning micropayments** ("zaps") by generating
a QR code that anyone with a Lightning wallet can scan and pay.

Built on the [Nostr protocol](https://nostr.com) and [NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md)
zap standard, it requires **no backend server** — just a Nostr account with a
Lightning address.

## How It Works

1. **You enter an amount** in satoshis and an optional message.
2. **A BOLT11 Lightning invoice is created** via your LNURL-pay endpoint.
3. **A QR code is displayed** — the payer scans it with any Lightning wallet.
4. **Payment confirms in seconds** via Nostr relay subscriptions.

## Key Features

| Feature | Details |
|---|---|
| ⚡ Instant Settlement | Payments clear on the Lightning Network in seconds |
| 🌍 Any Wallet | Works with Wallet of Satoshi, Phoenix, Alby, Breez, and more |
| 🛡️ No Backend | All invoice logic runs in your browser — no server to manage |
| 🔔 Real-Time | Payment detected in 1–5 seconds via Nostr relay subscriptions |
| 📒 Built-in Ledger | Track all received zaps with payer info and timestamps |

## Navigation

Use the sidebar to browse the documentation:

- **[Quick Start](getting-started.md)** — Get up and running in 5 steps
- **[Creating an Invoice](creating-invoices.md)** — How invoices are generated
- **[QR Codes](qr-codes.md)** — QR formats, deep links, and copy fallback
- **[Payment Status](payment-status.md)** — Awaiting, received, and expired states
- **[Lightning Address](lightning-address.md)** — Set up Alby or LNbits
- **[NIP-57 Zaps](nip57.md)** — Protocol details
- **[FAQ](faq.md)** — Common questions
