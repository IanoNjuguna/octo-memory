# NIP-57: Zaps

ZapQR implements the [NIP-57 Zaps](https://github.com/nostr-protocol/nips/blob/master/57.md)
protocol. Here's how it works under the hood.

## What Changes When Both Sides Are on Nostr

The magic of NIP-57 zaps only fully activates when **both the sender and
receiver** use Nostr. Here's what each combination looks like:

| | Receiver: Guest Mode | Receiver: Nostr Mode |
|---|---|---|
| **Payer: Lightning wallet (QR scan)** | Anonymous payment. Receiver manually confirms. No record anywhere. | Payment confirmed automatically. Payer's wallet has no Nostr identity, so the receipt shows an anonymous zap. Receiver gets a ledger entry but no payer name. |
| **Payer: Nostr client (ZapButton / NWC)** | N/A — Nostr payers need a NIP-57 zap invoice, which guest mode doesn't create. | **Full zap.** Payer's pubkey is recorded. Receiver sees who paid, gets auto-detection, ledger entry with name. Payer can prove they paid (preimage). Both sides have a verifiable receipt. |

**The bottom row is the ideal flow.** When both parties are on Nostr:

- The payer's Nostr client fetches the LNURL invoice and pays via NWC or WebLN
- The payer's pubkey is embedded in the signed zap request sent to the LNURL service
- The LNURL service publishes a kind-9735 receipt that cryptographically links
  the payer, the receiver, the amount, and the Lightning preimage
- The receiver's ledger shows the payer's Nostr name (e.g., `@jack`), not
  just an anonymous payment
- If there's ever a dispute, the preimage in the receipt proves payment
  occurred on the Lightning Network

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

## Full Nostr-to-Nostr Flow (Both Parties on Nostr)

When the payer also uses a Nostr client (like ZapQR's ZapButton or any
NIP-57-compatible client), the flow becomes bidirectional and verifiable:

```
Payer's Client          Receiver's Client         LNURL Service        Nostr Relays
     │                         │                        │                    │
     │                         │  1. Generate QR        │                    │
     │                         │───────────────────────►│                    │
     │                         │  2. BOLT11 invoice     │                    │
     │                         │◄───────────────────────│                    │
     │                         │                        │                    │
     │  3. Payer scans QR      │                        │                    │
     │  (or pays via NWC/WebLN)│                        │                    │
     │                         │                        │                    │
     │  4. Payer signs own     │                        │                    │
     │  zap request (kind 9734)│                        │                    │
     │─────────────────────────────────────────────────►│                    │
     │  5. Payer pays invoice  │                        │                    │
     │  via Lightning Network  │                        │                    │
     │                         │                        │                    │
     │                         │                        │  6. kind 9735      │
     │                         │                        │  (zap receipt)     │
     │                         │                        │───────────────────►│
     │                         │                        │                    │
     │  7. Subscribe 9735      │  8. Subscribe 9735     │                    │
     │◄─────────────────────────────────────────────────────────────────────│
     │                         │◄─────────────────────────────────────────────│
     │                         │                        │                    │
     │  9. "Zap sent!"         │  10. "Zap received!"   │                    │
     │  (payer sees receipt)   │  (receiver sees payer) │                    │
```

### What the payer gets

- **Payment confirmation** — the kind-9735 receipt proves the invoice was paid
- **A record of having zapped** — visible in Nostr clients as outgoing zaps
- **Verifiable preimage** — cryptographic proof that a specific Lightning
  payment was made to a specific recipient

### What the receiver gets

- **Payer identity** — the receipt contains the payer's Nostr pubkey, which
  resolves to their profile (name, avatar, NIP-05)
- **Auto-detection** — relay subscription picks up the receipt in 1–5 seconds
- **Ledger entry with name** — not just an amount, but who sent it
- **Social proof** — the zap is visible on relays as a public endorsement

### Why this matters for micropayments

The critical difference between "both on Nostr" and "payer scans QR with a
wallet" is **accountability**. With both parties on Nostr:

- The payer can't claim they didn't pay (preimage proves it)
- The receiver can't claim they weren't paid (receipt is on relays)
- There's a permanent, verifiable, publicly-auditable record of the transaction
- No screenshots, no trust, no "I didn't receive it" disputes

This is the killer feature of NIP-57 zaps over plain Lightning invoices.

## LNURL-pay Integration

ZapQR uses your `lud16` or `lud06` to resolve a LNURL-pay endpoint. The flow:

1. Resolve `lud16` → `https://domain/.well-known/lnurlp/name`
2. GET the endpoint → receive `callback` URL and `allowsNostr` confirmation
3. GET `callback?amount=<msats>&nostr=<signed-zap-request>`
4. Receive `{ "pr": "lnbc..." }` — the BOLT11 invoice

---

**Next:** [Zap Ledger →](ledger.md)