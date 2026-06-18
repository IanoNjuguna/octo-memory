# Receiving Zaps with ZapQR

ZapQR lets you receive **Bitcoin Lightning micropayments** ("zaps") by generating
a QR code that anyone with a Lightning wallet can scan and pay.

## How It Works

1. **Log in with Nostr** — Use a browser extension, nsec key, or remote signer
2. **Set up a Lightning address** — Add `lud16` (e.g., `you@getalby.com`) to your Nostr profile
3. **Enter an amount** — Choose from presets or enter a custom amount in satoshis
4. **Generate QR** — A BOLT11 Lightning invoice QR appears
5. **Share and get paid** — Payer scans with any Lightning wallet, you see confirmation in seconds

## Why Nostr?

- **Auto payment detection** — ZapQR subscribes to Nostr relays and confirms payment in 1–5 seconds
- **Full transaction ledger** — Every zap is recorded with payer identity and timestamps
- **Payer identity** — Know who paid you (Nostr pubkey)
- **Verifiable receipts** — Cryptographic proof of payment published to relays
- **Social proof** — Zaps are publicly visible on Nostr

## Getting a Lightning Address

Your Nostr profile needs a `lud16` field (Lightning address). Get one free from:

- **[Alby](https://getalby.com)** — Sign up, your address is `yourname@getalby.com`
- **[LNbits](https://lnbits.com)** — Self-host or use a cloud instance

Add the address to your Nostr profile and you're ready to receive zaps.