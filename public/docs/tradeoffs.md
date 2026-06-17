# Nostr Mode vs Guest Mode — Tradeoffs

ZapQR offers two ways to generate invoices. Pick the one that fits your needs.

## Comparison

| | Nostr Mode | Guest Mode |
|---|---|---|
| **Login** | Nostr account required | None |
| **Lightning address** | From your Nostr profile automatically | Paste manually each time |
| **Invoice protocol** | NIP-57 Zaps (kind 9734) | Direct LNURL-pay |
| **Payment detection** | Auto (relay subscription, 1–5 s) | Manual ("I Received Payment" button) |
| **Ledger** | Full history with payer pubkeys and timestamps | None |
| **Payer identity** | Recorded (Nostr pubkey) | Anonymous |
| **Zap receipts** | Published to relays (public, verifiable) | No receipt published |
| **Privacy** | Payments are public on Nostr relays | More private (no relay record) |
| **Social proof** | Yes — zaps are visible to followers | No |
| **Browser storage** | NWC connections, profile cache | Nothing persisted |

## When to Use Nostr Mode

- You want **automatic payment confirmation** without checking your wallet
- You want a **searchable transaction history** (ledger)
- You want to **know who paid you** (Nostr identity)
- You want your zaps to be **publicly visible** (social proof)
- You're a **Nostr user** with a Lightning address already configured

## When to Use Guest Mode

- You **don't have a Nostr account** and don't want one
- You need a **quick one-off invoice** without setup
- You want **more privacy** — no relay record of the payment
- You're sharing a **Lightning address from a service** (Alby, LNbits) that isn't tied to Nostr
- You're **testing** or demonstrating the app

## Limitations of Guest Mode

**No automatic settlement detection.** You must manually confirm when payment
arrives by checking your wallet and tapping "I Received the Payment."

**No transaction history.** Invoices are ephemeral — once you generate a new
one, the previous invoice and its status are gone. There's no ledger to review
past payments.

**No payer identity.** The payer remains anonymous. You'll see the sats in
your Lightning wallet but won't know who sent them (unless they tell you).

**No zap receipts on relays.** Your payments aren't published to Nostr, so
they won't appear in Nostr clients, zap totals, or social feeds.

**No NWC/WebLN integration.** Guest mode is receive-only. You can't use the
connected wallet features to send payments.

## Limitations of Nostr Mode

**Nostr account required.** You need a Nostr keypair and a Lightning address
in your profile. This takes a few minutes to set up but unlocks all features.

**Public by default.** Zap receipts (kind 9735) are published to Nostr relays.
Anyone can see how much you received and from whom. This is by design — zaps
are social signals — but it's less private than Guest mode.

**Relay dependency.** Payment detection depends on Nostr relay connectivity.
If all your configured relays are down, detection may fall back to periodic
polling (30–60 second delay).

## Summary

```
                    Guest Mode              Nostr Mode
Setup time:         0 minutes               5 minutes
Privacy:            ★★★★★                   ★★☆☆☆
Convenience:        ★★☆☆☆                   ★★★★★
Features:           ★★☆☆☆                   ★★★★★
Payer info:         Anonymous               Nostr identity
Best for:           One-off payments         Regular use
```

---

**Next:** [FAQ →](faq.md)