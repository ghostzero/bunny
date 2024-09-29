# bunny.net Token Authentication

This is a simple library to generate signed URLs for [bunny.net](https://bunny.net) token authentication.

Credit to [BunnyCDN.TokenAuthentication](https://github.com/BunnyWay/BunnyCDN.TokenAuthentication) for the original implementation.

## Installation

```bash
# deno
deno add jsr:@gz/bunny

# npm (use any of npx, yarn dlx, pnpm dlx, or bunx)
npx jsr add @gz/bunny
```

## Usage

To generate a signed URL, you can use the `signUrl()` function.

```typescript
import { signUrl } from "@gz/bunny";

const signedUrl = await signUrl("https://example.com", "foo-bar");

console.log(signedUrl);
```