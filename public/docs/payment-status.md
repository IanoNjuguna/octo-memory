# Payment Status

After generating an invoice, ZapQR monitors for payment confirmation.

## Nostr Mode (Auto-Detection)

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

## Guest Mode (Manual Confirmation)

In Guest mode, ZapQR can't automatically detect payments because there's no
Nostr relay subscription. Instead:

1. **Generate the QR** and share it with the payer
2. **Check your Lightning wallet** for the incoming payment
3. **Tap "I Received the Payment"** to confirm

The QR and invoice remain valid until their expiry (~1 hour). You can generate
a new invoice at any time.

> 💡 **Tip:** For automatic detection and a full transaction history, use
> [Nostr mode](getting-started.md#nostr-mode-auto-detection--ledger).

---

**Next:** [Lightning Address →](lightning-address.md)