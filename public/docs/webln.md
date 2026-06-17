# WebLN

[WebLN](https://webln.guide/) is a browser API that lets websites request
Lightning payments. When you have a WebLN-compatible browser extension installed,
ZapQR automatically detects it and offers one-click payment.

## How It Works

1. When an invoice is displayed, ZapQR checks for `window.webln`
2. If found, a **"Pay with WebLN"** button appears
3. Clicking it sends the invoice to your extension
4. You confirm the payment in the extension popup

## Compatible Extensions

- **[Alby](https://getalby.com)** — the most popular WebLN provider
- Any extension implementing the [WebLN standard](https://webln.guide/)

## Benefits

- **No QR scanning** — pay with one click
- **No copy & paste** — the extension handles everything
- **Works on desktop** — where camera scanning isn't practical

> WebLN is automatically detected. No configuration needed — just install
> a compatible extension and log in.

---

**Next:** [NIP-57 Zaps →](nip57.md)