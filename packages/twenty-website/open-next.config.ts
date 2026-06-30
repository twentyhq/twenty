import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';

// Worker custom-domain hostnames bypass the zone-level Cache Rule for
// synthetic responses (OpenNext builds responses from R2 reads rather than
// `fetch()`-ing an origin). Wrapping the R2 incremental cache with the
// regional cache means cache-hit reads come from CF's per-region Cache API
// (~10ms) instead of R2 (~100ms), recovering most of the TTFB the migration
// lost.
const incrementalCache = withRegionalCache(r2IncrementalCache, {
  mode: 'long-lived',
});

const baseConfig = defineCloudflareConfig({
  incrementalCache,
});

// `defineCloudflareConfig` only takes the `CloudflareOverrides` subset of the
// config today; `skewProtection` lives directly under `cloudflare.*` and has to
// be merged in. See packages/cloudflare/src/api/config.ts in opennextjs-cloudflare.
export default {
  ...baseConfig,
  cloudflare: {
    ...baseConfig.cloudflare,
    skewProtection: {
      enabled: true,
      // Window large enough to keep prod-version history for skew routing AND
      // hold one slot per open PR preview. `maxVersionAgeDays` prunes the rest.
      maxNumberOfVersions: 50,
      maxVersionAgeDays: 14,
    },
  },
};
