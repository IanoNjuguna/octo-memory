# Quick Start

Follow these steps to start receiving Lightning payments.

## 1. Log in with Nostr

Click the login button and sign in with:

- A **Nostr browser extension** (Alby, nos2x, Flamingo)
- An **nsec key** (paste your private key)
- A **remote signer** (NIP-46 bunker / nostrconnect)

> New to Nostr? Create a free account at [primal.net](https://primal.net) or
> with the [Alby extension](https://getalby.com).

## 2. Set up a Lightning Address

You need a Lightning address (`lud16`) in your Nostr profile. Get a free one from:

- **[Alby](https://getalby.com)** — Your address will be `yourname@getalby.com`
- **[LNbits](https://lnbits.com)** — Self-host or use a cloud instance

Once set up, add it to your Nostr profile metadata as the `lud16` field.

## 3. Navigate to Receive

Go to [octo-pay.vercel.app/receive](https://octo-pay.vercel.app/receive) and
enter an amount in satoshis (1 sat = 1/100,000,000 BTC).

## 4. Generate QR Code

Tap **"Generate QR Code"**. A BOLT11 Lightning invoice QR appears on screen.

## 5. Share and Get Paid

Show the QR to a payer — they scan it with any Lightning wallet and pay.
You'll see a confirmation within seconds, and the payment is recorded in
your [Zap Ledger](https://octo-pay.vercel.app/ledger).

---

**Next:** [Requirements →](requirements.md)
