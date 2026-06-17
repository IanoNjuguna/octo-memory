# Lightning Address Setup

ZapQR uses your Nostr profile's Lightning address (`lud16` field) to create
invoices. Your Lightning address looks like an email address — e.g.,
`yourname@getalby.com` — and is served by a Lightning service provider.

## Option 1: Alby

[Alby](https://getalby.com) is a free, user-friendly Lightning wallet available
as a browser extension and web app.

### Setup Steps

1. Go to [getalby.com](https://getalby.com) and sign up
2. Install the browser extension if desired
3. Your Lightning address will be `yourname@getalby.com`
4. Open ZapQR, edit your Nostr profile, and set the `lud16` field to your
   Alby address

> **Tip:** The Alby browser extension also enables WebLN — you'll see a
> "Pay with WebLN" button on invoices for one-click payment.

## Option 2: LNbits

[LNbits](https://lnbits.com) is an open-source Lightning wallet with a
powerful plugin system. You can use a cloud instance or self-host.

### Setup Steps

1. Sign up at [legend.lnbits.com](https://legend.lnbits.com) (or self-host)
2. Enable the **LNURLp** extension
3. Copy your LNURL-pay callback URL
4. Either:
   - Set up a `lud16` that resolves to your LNbits instance, **or**
   - Use `lud06` and paste the bech32-encoded LNURL directly in your profile

## Option 3: Other Providers

Any service that provides a LNURL-pay endpoint works with ZapQR. Other options include:

- **BTCPay Server** (self-hosted, full node)
- **Strike** (custodial, available in select countries)
- **ZBD** (gaming-focused Lightning wallet)

---

**Next:** [Nostr Wallet Connect →](nwc.md)