# Nostr Wallet Connect (NWC)

Nostr Wallet Connect ([NIP-47](https://github.com/nostr-protocol/nips/blob/master/47.md))
lets you connect a remote Lightning wallet to ZapQR. Once connected, you can
pay invoices directly without manual QR scanning.

## When to Use NWC

- You want to **send zaps** to other Nostr users via the ZapButton
- You want to **pay displayed invoices** with one click from your connected wallet

> NWC is optional. For receiving payments, you only need a Lightning address —
> NWC is for outgoing payments.

## Connect a Wallet

1. Open the **Wallet settings** in ZapQR (click the wallet icon)
2. Paste your `nostr+walletconnect://` URI
3. Confirm the connection

Supported NWC wallets include:

- **Alby Hub** — self-hosted Lightning node connector
- **Alby Go** — mobile wallet
- **Mutiny** — web-based Lightning wallet
- Any **NIP-47 compatible** wallet

## How It Works

NWC uses Nostr relays to send encrypted payment requests between ZapQR and
your wallet. The connection string contains a **relay URL** and a **secret key**
that authenticates requests.

> ⚠️ **Security:** Keep your NWC connection string private. It contains a secret
> key that authorizes payments from your wallet. Never share it.

---

**Next:** [WebLN →](webln.md)