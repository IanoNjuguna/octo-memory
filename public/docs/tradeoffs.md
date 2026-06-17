# Nostr Mode vs Guest Mode — Tradeoffs

ZapQR offers two ways to generate invoices. But the full power of the app unlocks when **both sender and receiver** are on Nostr — see [how that works](nip57.md#full-nostr-to-nostr-flow-both-parties-on-nostr).

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

**The fundamental difference:** Nostr mode links every payment to an identity
and keeps a permanent record. Guest mode treats each invoice as a standalone
event — no history, no identity, no connection between payments. Guest mode
is **not** limited to a single payment (you can generate as many invoices as
you want in a session), but each invoice exists in isolation. Close the tab,
and everything disappears.

### The Best Case: Both Parties on Nostr

When both sender and receiver use Nostr, you get the full NIP-57 zap protocol:

| Feature | Guest Mode | Nostr Mode (QR pay) | Nostr Mode (Both on Nostr) |
|---|---|---|---|
| **Payer** | Lightning wallet (scan) | Lightning wallet (scan) | Nostr client (NWC/WebLN) |
| **Payer identity** | Anonymous | Anonymous | Nostr pubkey + profile |
| **Receipt** | None | Kind 9735 on relays | Kind 9735 on relays |
| **Payer gets a record?** | No | No | Yes — outgoing zap in their client |
| **Dispute resolution** | None | Preimage on relays | Preimage + both pubkeys |
| **Receiver sees** | Manual confirm | Auto-detect, no payer name | Auto-detect, payer's name + avatar |

> 💡 The ideal flow: receiver generates a zap QR → payer scans it with a Nostr
> client that supports NIP-57 (like ZapQR's ZapButton, Damus, Primal, Snort)
> → payer's identity is recorded → both sides get a verifiable receipt.

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

## Guest Mode: Benefits

Guest mode is a **direct LNURL-pay flow** with no Nostr protocol involved.
Here's what it gives you:

### 🟢 Benefits

**Zero setup.** You can generate a Lightning invoice in under 10 seconds.
Open the page, paste your address, pick an amount, done. No key management,
no profile editing, no relay configuration.

**True payer anonymity.** The payer's identity is never recorded anywhere
(no pubkey, no zap request, no relay publication). Only the Lightning
Network itself knows about the payment — and even that is onion-routed.
For privacy-sensitive payers, this is a feature, not a bug.

**No relay footprint.** Guest invoices don't touch Nostr relays at all.
No kind-9734 zap request is published, no kind-9735 receipt is created.
Your payment activity is invisible to Nostr indexers, analytics, and
third-party observers who monitor relay traffic.

**Works with any LNURL-pay service.** Guest mode doesn't care if your
Lightning address is tied to a Nostr profile. It works with Alby, LNbits,
BTCPay, Strike, or any service that speaks the LNURL-pay protocol.

**No browser state.** Close the tab, and there's no trace. No keys in
localStorage, no NWC connections, no cached profiles. Clean slate every time.

### 🟡 Real-World Examples: When Guest Mode Shines

**The street performer's tip jar.** A musician sets up a QR code on their
phone case during a performance. Passersby scan and tip 100–500 sats.
The performer doesn't need a Nostr account, doesn't need a ledger,
doesn't care who tipped — they just hear the wallet notification ping.
Guest mode is perfect.

**The private donation.** An activist in a high-surveillance region wants
to receive support without creating a permanent public record linking
their identity to every donor. Guest mode leaves no relay trail, no
public list of contributors, no metadata for adversaries to scrape.

**The conference workshop.** A presenter needs 20 attendees to send
1,000 sats each to unlock a demo. Nostr onboarding would eat 10 minutes
of the workshop. Guest mode: paste one address, generate QR, project it.
Done in 30 seconds.

**The one-time Craigslist sale.** You're selling a used laptop for the
bitcoin equivalent. The buyer doesn't use Nostr. You paste your Alby
address, generate a QR, they scan and pay. Transaction complete. No
accounts created, no follow-up needed.

## Guest Mode: Dangers & Risks

Guest mode's simplicity comes with real risks for micropayments. These
dangers are especially sharp when money is involved.

### 🔴 Dangers

**No payment verification — you can be lied to.** The "I Received the
Payment" button is a manual confirmation. It has no cryptographic proof.
A payer could claim they paid, show you a fake wallet screenshot, or send
a payment to a different address, and you'd have no way to verify it within
the app. **Example:** Someone at a meetup claims they zapped you 500 sats.
You tap "I Received" on trust. Your wallet never actually got the payment.
You have no receipt, no preimage, no way to dispute it.

**No non-repudiation.** In Nostr mode, a zap receipt (kind 9735) contains
a cryptographic preimage — mathematical proof that a specific Lightning
invoice was paid by a specific Nostr identity. Guest mode has none of this.
If a dispute arises ("I paid you, where's my product?"), neither party has
verifiable proof. **Example:** You sell a digital download for 5,000 sats.
The buyer claims they paid. You see nothing in your wallet. Without a
receipt, it's your word against theirs.

**No audit trail.** Guest invoices leave no persistent record. If you need
to reconcile payments (for accounting, taxes, revenue tracking), guest
mode gives you nothing. Invoices vanish when you close the tab. **Example:**
You accept 50 guest payments at a weekend market. Monday morning, you need
to report income. You have to manually cross-reference your Lightning wallet
history with your memory of each sale. Miss one, and your books are wrong.

**Invoice reuse risk.** Guest mode doesn't track which invoices have been
paid. If you accidentally show the same QR to two different payers, the
first one to pay settles the invoice — the second gets an error (invoice
already paid). This is harmless but confusing. Worse: if you regenerate the
invoice with the same amount, a delayed payment might arrive on the old
invoice after you've already shown a new one to someone else. **Example:**
You generate a 100 sat QR, screen-share it. Two people scan it. One pays —
the invoice is consumed. The second person's wallet rejects it. They think
you're scamming them.

**No spam or Sybil protection.** Nostr mode ties payments to pubkeys, which
lets you filter out spam, identify repeat supporters, or block bad actors.
Guest mode has no identity layer. Anyone can pay, and you'll never know if
10 payments came from 10 different people or one person testing your QR.
**Example:** You post a guest QR on a public forum. You get 200 payments.
Are they from 200 unique supporters or one person with a script? You can't tell.

**No Lightning address validation at generation time.** When you paste an
address in guest mode, the app resolves it when you click "Generate QR".
If you mistyped `@getalby.com` as `@getably.com`, you'll get an error then —
not before. If the LNURL service is temporarily down, you get an error.
Nostr mode caches your address from your profile, so the happy path is
smoother.

**Social engineering surface.** Because there's no verification, a scammer
can exploit the manual confirmation flow. **Example:** At a conference, a
stranger shows you a wallet screenshot claiming they paid your QR. You tap
"I Received" to move on. Later you check your wallet — nothing. The scammer
walked away with whatever you gave them in exchange for the "payment."

### 🟡 Real-World Examples: When Guest Mode Backfires

**The content creator accepting tips.** A writer posts a guest QR at the
bottom of their newsletter, asking for tips. Over a month, they get 30
payments. But they can't tell which readers tipped, can't thank them by
name, can't offer supporter perks, and can't prove their income to anyone.
A Nostr ledger would give them all of this automatically.

**The remote freelancer.** A developer invoices a client 50,000 sats via
a guest QR. The client says "Paid!" The developer checks their wallet —
nothing. "It must be delayed, bro." Without a receipt, the developer can't
prove non-payment. They either accept the loss or escalate with no evidence.

**The charity fundraiser.** An NGO collects donations via guest QR codes at
a gala. They collect 500 payments but have no record of amounts, no donor
list, no way to issue receipts for tax purposes. Their accountant spends a
weekend manually reconstructing everything from wallet history.

**The recurring payment.** A subscriber sends you 1,000 sats monthly.
In guest mode, you have no way to know if the same person has been paying
you every month or if different people are paying. No relationship, no
loyalty tracking, no way to offer perks to long-term supporters.

## Limitations of Nostr Mode

**Nostr account required.** You need a Nostr keypair and a Lightning address
in your profile. This takes a few minutes to set up but unlocks all features.

**Public by default.** Zap receipts (kind 9735) are published to Nostr relays.
Anyone can see how much you received and from whom. This is by design — zaps
are social signals — but it's less private than Guest mode.

**Relay dependency.** Payment detection depends on Nostr relay connectivity.
If all your configured relays are down, detection may fall back to periodic
polling (30–60 second delay).

## Decision Guide

Not sure which mode to use? Answer these questions:

**Are you handling money you can't afford to lose track of?**
→ Use **Nostr mode**. Receipts are your proof. Guest mode has none.

**Do you need to know who paid you?**
→ Use **Nostr mode**. Guest mode payers are anonymous.

**Are you accepting tips or donations publicly?**
→ Use **Nostr mode**. The social proof of zaps is the entire point.

**Is this a one-off payment from someone you trust, where you don't need a record?**
→ **Guest mode** is fine. A friend buying you coffee, a flea market sale, a
quick invoice for someone in the room. But remember: you're trusting the payer
and your own eyes (checking your wallet). There's no safety net.

**Are you generating multiple invoices in a session and want to track them?**
→ **Guest mode** lets you do this — but each invoice is independent. There's
no running total, no way to tell which ones got paid without manually checking
your wallet each time. If you need any tracking at all, Nostr mode is the
right call.

**Do you lack a Nostr account and need something now?**
→ **Guest mode**. But create a Nostr account later if you plan to receive regularly.

**Are you in a high-privacy scenario where payer anonymity matters?**
→ **Guest mode**. No relay record, no pubkey linkage.

### Quick Reference

```
                     Guest Mode              Nostr Mode
Setup time:         0 minutes               5 minutes
Privacy:            ★★★★★                   ★★☆☆☆
Verifiability:      ☆☆☆☆☆                   ★★★★★
Auditability:       ☆☆☆☆☆                   ★★★★★
Convenience:        ★★☆☆☆                   ★★★★★
Features:           ★★☆☆☆                   ★★★★★
Payer info:         Anonymous               Nostr identity
Fraud resistance:   None                    Cryptographic proof
Best for:           Disconnected / trust-based    Regular / business use
Session persistence: None — tab close = gone       Full — ledger survives reloads
```

---

**Next:** [FAQ →](faq.md)