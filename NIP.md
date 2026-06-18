# ZapQR Nostr Schemas

ZapQR does not define a new event kind for campaigns. Campaigns use **NIP-78
application-specific data**, kind `30078`, because fundraising campaign metadata
is app-specific and addressable by the creator.

## ZapQR Campaign

- Kind: `30078`
- Addressable key: `pubkey + kind + d`
- `d` tag prefix: `pub.zapqr/campaign/`
- Route: `/:naddr`

### Required Tags

```json
["d", "pub.zapqr/campaign/<slug>"]
["title", "<campaign title>"]
["goal", "<sats>", "sats"]
["alt", "ZapQR fundraising campaign: <campaign title>"]
```

### Recommended Tags

```json
["summary", "<short description>"]
["image", "https://example.com/banner.jpg"]
["p", "<recipient pubkey>"]
["r", "https://example.com/<npub-or-nprofile>"]
["t", "zapqr"]
["t", "fundraising"]
```

### Content

`content` contains the campaign description as plaintext. Clients should prefer
the `summary` tag for compact previews and use `content` as a fallback.

### Validation

A valid ZapQR campaign event:

- has kind `30078`
- has a `d` tag beginning with `pub.zapqr/campaign/`
- has a non-empty `title` tag
- has a positive integer `goal` tag, denominated in sats
- has a NIP-31 `alt` tag

When resolving a campaign route, clients must query by all three addressable
components:

```ts
{
  kinds: [30078],
  authors: [pubkey],
  '#d': ['pub.zapqr/campaign/<slug>'],
  limit: 1,
}
```

The `authors` filter is required. The `d` tag alone is not a trust boundary.
