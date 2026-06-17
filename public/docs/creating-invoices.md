# Creating an Invoice

ZapQR supports two invoice creation flows:

| | Nostr Mode | Guest Mode |
|---|---|---|
| **Protocol** | NIP-57 Zaps (kind 9734) | Direct LNURL-pay |
| **Payer identity** | Recorded (Nostr pubkey) | Anonymous |
| **Receipt** | Kind 9735 on relays | Manual confirmation |
| **Ledger** | Auto-populated | Not available |

## Nostr Mode Flow

### 1. Create Zap Request (kind 9734)

A NIP-57 zap request event is created and signed with your Nostr key.
It contains:

- The **amount** in millisatoshis
- Your **pubkey** (the recipient)
- The **relays** where the zap receipt will be published
- An optional **comment**

### 2. Send to LNURL-pay Endpoint

The signed zap request is sent to your Lightning address's LNURL-pay callback
endpoint. This endpoint is resolved from your `lud16` (e.g., `name@getalby.com` →
`https://getalby.com/.well-known/lnurlp/name`).

### 3. Receive BOLT11 Invoice

The LNURL service creates a Lightning invoice and returns it as a BOLT11 string:

```
lnbc100n1p3qzyxqpp5...
```

### 4. Encode as QR Code

The BOLT11 string is encoded into a QR code. The QR contains a
`lightning:lnbc...` URI that any wallet can decode to get the amount,
description, and expiry.

### 5. Monitor for Settlement

ZapQR subscribes to Nostr relays for a **zap receipt** (kind 9735) referencing
the zap request. When the invoice is paid, the LNURL service publishes the
receipt to relays and the UI updates within seconds.

## Invoice Properties

- **Single-use** — each invoice can only be paid once
- **Expires in ~1 hour** — you can regenerate at any time
- **Fixed amount** — the payer pays exactly the amount you set

## Guest Mode Flow

In Guest mode, the process is simpler but without Nostr integration:

1. **Resolve LNURL-pay** — Your Lightning address (e.g., `you@getalby.com`) is
   resolved to its `.well-known/lnurlp` endpoint
2. **Request invoice** — The callback URL is called with just the amount
   (no zap request attached)
3. **Receive BOLT11** — A plain Lightning invoice is returned
4. **Display QR** — Same QR rendering as Nostr mode
5. **Manual confirmation** — You confirm payment manually by checking your wallet

> Guest invoices are standard LNURL-pay invoices — they work with ALL Lightning
> wallets but don't link to a Nostr identity.

---

**Next:** [QR Codes →](qr-codes.md)