# Quick Start

## 1. Log in with Nostr

Click **Log in** and sign in with:

- A **Nostr browser extension** (Alby, nos2x, Flamingo)
- An **nsec key** (paste your private key)
- A **remote signer** (NIP-46 bunker / nostrconnect)

> New to Nostr? Create a free account at [primal.net](https://primal.net).

## 2. Set up a Lightning Address

You need a Lightning address (`lud16`) in your Nostr profile. Get a free one from:

- **[Alby](https://getalby.com)** — Your address will be `yourname@getalby.com`
- **[LNbits](https://lnbits.com)** — Self-host or use a cloud instance

Add the address to your Nostr profile metadata as the `lud16` field.

## 3. Navigate to Receive

Go to [octo-pay.vercel.app/receive](https://octo-pay.vercel.app/receive) and
enter an amount in satoshis (1 sat = 1/100,000,000 BTC).

## 4. Generate QR Code

Tap **"Generate QR Code"**. A BOLT11 Lightning invoice QR appears on screen.
The invoice is signed with your Nostr key and sent to your LNURL-pay endpoint.

## 5. Share and Get Paid

Show the QR to a payer — they scan it with any Lightning wallet and pay.
ZapQR detects the payment on Nostr relays within seconds and shows a confirmation.
The transaction is recorded in your [Zap Ledger](https://octo-pay.vercel.app/ledger)
with the payer's Nostr identity.

---

**Next:** [Requirements →](requirements.md)