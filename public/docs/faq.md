# FAQ

## Do payers need a Nostr account?

**No.** Payers only need a Lightning wallet. They scan the QR code and pay —
no login, no account creation.

## What wallets are supported for paying?

Any BOLT11-compatible Lightning wallet: Wallet of Satoshi, Phoenix, Breez,
Alby, BlueWallet, Zeus, and many more.

## Is there a maximum zap amount?

No hard limit in ZapQR itself, but your LNURL-pay provider may impose limits.
Alby typically caps at 1,000,000 sats per invoice. Check your provider's
documentation.

## Do I need to run a server?

**No.** ZapQR is entirely client-side. Invoices are created by calling your
LNURL-pay endpoint (hosted by Alby, LNbits, etc.), and payment detection
happens through Nostr relays.

## How fast is payment detection?

Typically **1–5 seconds** after the payer sends the Lightning payment. ZapQR
uses real-time Nostr relay subscriptions for instant detection, with polling
as a fallback.

## Can I embed the QR code on my website?

Yes! Generate a QR code, click **"Embed this QR"**, and copy the iframe snippet.
Paste it into your website, blog, or Notion page. The QR auto-generates on each
page load and works with any Lightning address. See the [Embedding Guide](qr-codes.md#embedding-the-qr-code) for details.

## What happens if I close the browser?

The invoice remains valid until its expiry (~1 hour). When you reopen the app,
the ledger will catch up by querying relays for recent receipts.

## Is this production-ready?

ZapQR is built on the [MKStack](https://gitlab.com/soapbox-pub/mkstack)
framework with the [Nostrify](https://nostrify.org) relay library and
[nostr-tools](https://github.com/nbd-wtf/nostr-tools). The Lightning
integration uses the NIP-57 zap specification, which is actively used by
thousands of Nostr clients.

## Can I tip/contribute?

ZapQR is open source — you can find the repository at
[github.com/IanoNjuguna/octo-memory](https://github.com/IanoNjuguna/octo-memory).
Contributions are welcome!

## How do I report a bug?

Open an issue on the [GitHub repository](https://github.com/IanoNjuguna/octo-memory/issues).

---

[← Back to Overview](/)
