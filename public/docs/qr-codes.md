# QR Codes

ZapQR generates **BOLT11 invoice QR codes** — the Lightning invoice string
is encoded directly in the QR, so any wallet can pay immediately with no
intermediate server lookup.

## QR Content

The QR contains a Lightning URI:

```
lightning:lnbc100n1p3qzyxqpp5...
```

When scanned, the wallet decodes the BOLT11 string to get:

- **Amount** in satoshis
- **Description** (the comment you entered)
- **Payee node** (your Lightning service's node ID)
- **Expiry** (when the invoice becomes invalid)
- **Payment hash** (unique identifier for this invoice)

## Payment Methods

### QR Scan (Primary)

The payer opens their Lightning wallet, taps "Scan", and points their camera at the QR.
The wallet decodes the invoice and prompts for payment confirmation.

### Copy & Paste (Fallback)

If scanning isn't an option, the payer can:

1. Tap the **Copy** button next to the invoice string
2. Open their wallet and go to "Pay Invoice" or "Send"
3. Paste the invoice string and confirm payment

### Deep Link

The **"Open in Lightning Wallet"** button triggers a `lightning:` URI deep link.
On mobile, this opens directly in the user's installed wallet app. On desktop,
it opens the wallet in a new tab if a handler is registered.

---

**Next:** [Payment Status →](payment-status.md)