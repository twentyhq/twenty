import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';

const baseConfig = defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
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
