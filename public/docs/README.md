# Receiving Zaps with ZapQR

ZapQR lets you receive **Bitcoin Lightning micropayments** ("zaps") by generating
a QR code that anyone with a Lightning wallet can scan and pay.

## Two Ways to Receive

### Paste an Invoice (Works with Any Wallet)

1. Open your Lightning wallet (Wallet of Satoshi, Phoenix, BlueWallet, etc.)
2. Tap **Receive** and enter an amount
3. Copy the BOLT11 invoice string
4. Paste it into ZapQR — a QR code appears instantly
5. Share the QR with the payer

> Zero setup, no Lightning address, no Nostr login. Works with every wallet.

### Nostr Mode (Auto-Detection + Ledger)

1. Log in with your Nostr account that has a Lightning address (`lud16`)
2. Enter an amount and optional message
3. Tap **Generate QR Code**
4. Share the QR — ZapQR auto-detects payment in seconds

Nostr mode gives you automatic payment confirmation, a full transaction ledger
with payer identities, and embeddable QRs.

---

- **[Quick Start](getting-started.md)** — Get up and running
- **[Requirements](requirements.md)** — What you need
- **[Creating an Invoice](creating-invoices.md)** — How invoices are generated
- **[QR Codes & Embedding](qr-codes.md)** — QR formats, deep links, copy fallback, embedding
- **[Payment Status](payment-status.md)** — Awaiting, received, and expired states
- **[Lightning Address](lightning-address.md)** — Set up Alby or LNbits
- **[NIP-57 Zaps](nip57.md)** — Protocol details for Nostr mode
- **[Zap Ledger](ledger.md)** — Transaction history
- **[FAQ](faq.md)** — Common questions