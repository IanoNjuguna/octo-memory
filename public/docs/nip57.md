# NIP-57: Zaps

ZapQR implements the [NIP-57 Zaps](https://github.com/nostr-protocol/nips/blob/master/57.md)
protocol. Here's how it works under the hood.

## Protocol Flow

```
Recipient's Client          LNURL Service           Nostr Relays
      │                          │                      │
      │  1. kind 9734 (signed)   │                      │
      │─────────────────────────►│                      │
      │                          │                      │
      │  2. BOLT11 invoice       │                      │
      │◄─────────────────────────│                      │
      │                          │                      │
      │  3. Display QR           │                      │
      │                          │                      │
      │                          │  Payer scans & pays   │
      │                          │                      │
      │                          │  4. kind 9735 (pub)  │
      │                          │─────────────────────►│
      │                          │                      │
      │  5. Subscribe kind 9735 ─────────────────────► │
      │◄─────────────────────────────────────────────  │
      │                          │                      │
      │  6. Confirmation         │                      │
```

## Event Kinds

### Zap Request (kind 9734)

Created by the recipient's client and sent to the LNURL-pay endpoint.
Contains:

| Tag | Description |
|---|---|
| `p` | Recipient's pubkey |
| `e` | Event being zapped (or recipient's pubkey for profile zaps) |
| `amount` | Amount in millisatoshis |
| `relays` | Relays where the receipt will be published |
| `k` | Kind of the event being zapped |

### Zap Receipt (kind 9735)

Published by the LNURL service after payment settlement. Contains:

| Tag | Description |
|---|---|
| `e` | Zap request event ID (kind 9734) |
| `p` | Recipient's pubkey |
| `bolt11` | The paid BOLT11 invoice string |
| `description` | JSON-encoded signed zap request |
| `preimage` | Lightning payment preimage (proof of payment) |

## LNURL-pay Integration

ZapQR uses your `lud16` or `lud06` to resolve a LNURL-pay endpoint. The flow:

1. Resolve `lud16` → `https://domain/.well-known/lnurlp/name`
2. GET the endpoint → receive `callback` URL and `allowsNostr` confirmation
3. GET `callback?amount=<msats>&nostr=<signed-zap-request>`
4. Receive `{ "pr": "lnbc..." }` — the BOLT11 invoice

---

**Next:** [Zap Ledger →](ledger.md)