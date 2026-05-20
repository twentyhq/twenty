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
      // Bumped from 10 to make room for PR-preview versions (each open PR
      // holds one slot, plus one per push within the PR until cleanup).
      // Cleanup-on-close + maxVersionAgeDays keep the window from drifting.
      maxNumberOfVersions: 50,
      maxVersionAgeDays: 14,
    },
  },
};
