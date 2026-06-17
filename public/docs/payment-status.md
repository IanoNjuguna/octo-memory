# Payment Status

After generating an invoice, ZapQR monitors Nostr relays for confirmation.

## Status States

### 🟡 Awaiting Payment

The invoice is active and waiting for payment. A spinner animation indicates
that ZapQR is listening for the zap receipt on Nostr relays.

- Detection method: **Real-time Nostr subscription** on kind 9735 events
- Typical wait: **1–60 seconds** after the payer sends the payment
- Invoice expiry: **~1 hour**

### 🟢 Payment Received

Payment confirmed! The screen shows:

- A **green checkmark** with the amount received
- The **receipt event ID** (for reference)
- A **timestamp** of when the zap was settled
- A button to **generate another** invoice

### 🟡 Invoice Expired

The invoice timed out without receiving payment. Tap **"Generate New Invoice"**
to create a fresh one with a new expiry window.

## Detection Methods

ZapQR uses two methods in parallel:

| Method | Speed | How it works |
|---|---|---|
| **Nostr subscription** | 1–5 seconds | Subscribes to relays for new kind 9735 events with the zap request's `e` tag |
| **Polling** | 30–60 seconds | Fallback: periodically queries relays for recent receipts |

The Nostr subscription detects payments almost instantly. Polling catches
any receipts that may have been missed (e.g., during a connectivity blip).

---

**Next:** [Lightning Address →](lightning-address.md)