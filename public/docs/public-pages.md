# Public Zap Pages

ZapQR turns any Nostr profile link into a public Lightning payment page.

Supported routes:

- `/<npub1...>`
- `/<nprofile1...>`
- `/<naddr1...>` for published ZapQR campaigns

Public pages show the profile name, avatar, Lightning address, QR invoice form,
recent zap receipts, supporter details, relay hints, and sharing controls.

## Mainnet and Testnet

ZapQR has a Lightning Network switch for **Mainnet** and **Testnet**. The switch
does not convert a mainnet Lightning address into a testnet one. It guards the
invoice that comes back from the LNURL provider:

- mainnet mode accepts `lnbc...` invoices
- testnet mode accepts `lntb...` invoices

If a provider returns the wrong invoice type, ZapQR rejects it before showing a
QR code. For testnet demos, use a testnet LNURL/Lightning address from a testnet
provider.

## Sharing to Nostr and Soapbox/Ditto

The public page includes:

- **Copy Post** - copies a ready-to-paste Nostr post.
- **Share to Ditto** - opens the native share target when available, which Ditto
  supports on Android, and falls back to copying the post.
- **Post to Nostr** - publishes a kind `1` announcement note with `zapqr`,
  `lightning`, `bitcoin`, and `nostr` tags.

ZapQR also adds `p` and `r` tags to announcements so clients can associate the
post with the recipient profile and payment URL.

## Relay Hints

`nprofile` links may include relay hints. ZapQR uses those hints alongside the
app relay pool when fetching public zap receipts, then deduplicates receipts by
event id.

Campaign `naddr` routes also use relay hints when resolving the campaign event.
Campaign lookups always filter by `authors` and `#d`.

## Campaigns

Campaigns can be shared two ways:

1. URL parameters on a public profile page:

```text
/<npub1...>?title=Open%20Source%20Fund&goal=100000&description=Help%20ship%20ZapQR
```

2. Published Nostr campaign events using NIP-78 kind `30078`.

Published campaigns use a `d` tag beginning with:

```text
pub.zapqr/campaign/
```

Campaign pages show title, description, optional banner, raised sats, goal sats,
remaining sats, a progress bar, and recent supporters.

## Embed vs Public Page

`/embed` is a compact iframe widget for websites and blogs. It generates a QR
from a Lightning address and amount.

Public `npub`, `nprofile`, and campaign pages are full social payment pages.
They include profile context, sharing, public receipts, relay hints, and campaign
progress.

## Demo Flow

1. Open a public `npub` or `nprofile` page.
2. Generate a Lightning invoice QR.
3. Copy the post or use Share to Ditto.
4. Publish the announcement note.
5. Show recent receipts and supporter rows.
6. Show relay hint badges.
7. Open `/ledger` to show the private received-zap ledger.
