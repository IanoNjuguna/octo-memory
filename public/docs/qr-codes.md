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

## Embedding the QR Code

You can embed a live ZapQR invoice on any website, blog, or Notion page.

### How to Embed

1. Generate a QR code on the [Receive](https://octo-pay.vercel.app/receive) page
2. Click the **"Embed this QR"** button below the invoice
3. Copy the iframe snippet
4. Paste it into your website's HTML

```html
<iframe src="https://octo-pay.vercel.app/embed?lud16=you@getalby.com&amount=100"
        width="320" height="380" frameborder="0"
        style="border-radius:12px"></iframe>
```

The embed auto-generates a fresh invoice each time the page loads. It works with
any Lightning address — no Nostr account required.

### URL Parameters

| Parameter | Required | Description |
|---|---|---|
| `lud16` | Yes | Your Lightning address (e.g., `you@getalby.com`) |
| `amount` | No | Amount in sats (defaults to 100) |

### Example

```
https://octo-pay.vercel.app/embed?lud16=you@getalby.com&amount=500
```

### Styling

The embed is 320×380px by default and responsive. It shows:

- The QR code (auto-generated from the invoice)
- The amount in sats
- "Scan with any Lightning wallet to pay"
- A subtle "ZapQR" link

The iframe has a white background with rounded corners (12px border-radius)
and works in both light and dark mode. Adjust the `width` and `height`
attributes on the iframe to fit your layout.

---

**Next:** [Payment Status →](payment-status.md)