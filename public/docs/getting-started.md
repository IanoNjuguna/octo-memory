# Quick Start

ZapQR offers two ways to receive payments.

## Paste an Invoice (No Setup)

1. Open your Lightning wallet (Wallet of Satoshi, Phoenix, etc.)
2. Tap **Receive**, enter an amount, get a BOLT11 invoice
3. Copy the invoice and go to [octo-pay.vercel.app/receive](https://octo-pay.vercel.app/receive)
4. Paste it into the **"Got an invoice already?"** card
5. A QR code appears — share it with the payer

> Works with every Lightning wallet. No account required.

## Nostr Mode (Auto-Detection)

1. **Log in with Nostr** — Use a browser extension (Alby, nos2x), nsec key, or remote signer
2. **Set up a Lightning address** — Add `lud16` to your Nostr profile (get one free from [Alby](https://getalby.com) or [LNbits](https://lnbits.com))
3. **Go to Receive** — [octo-pay.vercel.app/receive](https://octo-pay.vercel.app/receive), enter an amount
4. **Generate QR** — Tap "Generate QR Code"
5. **Share and get paid** — ZapQR auto-detects payment in seconds, records it in your ledger

---

**Next:** [Requirements →](requirements.md)