# Zap Ledger

The [Zap Ledger](https://octo-pay.vercel.app/ledger) displays your complete
zap receipt history. It queries Nostr relays for all kind 9735 events where
you are the recipient.

## What You See

| Column | Description |
|---|---|
| **Amount** | How many satoshis you received |
| **Payer** | The Nostr identity of the person who zapped you (when available) |
| **Comment** | The message attached to the zap |
| **Timestamp** | When the payment was settled |
| **Total** | Sum of all zaps received |

## How It Works

1. ZapQR queries Nostr relays for events matching `kinds: [9735]` with
   `#p: [your-pubkey]`
2. Each receipt's amount is extracted from the `amount` tag, the BOLT11
   invoice, or the zap request description (in that order of preference)
3. The payer's identity is extracted from the signed zap request embedded
   in the receipt's `description` tag
4. Receipts are sorted by time (newest first)
5. The total sum is calculated and displayed in the summary card

## Privacy Note

All zap receipts are **public** on Nostr relays. Anyone can see who zapped
whom and how much. This is by design in the NIP-57 protocol — zaps are
meant to be publicly visible social signals.

If you need private payments, Lightning invoices without Nostr integration
are more private (no pubkey linkage), but they lose the social/ledger features.

---

**Next:** [FAQ →](faq.md)