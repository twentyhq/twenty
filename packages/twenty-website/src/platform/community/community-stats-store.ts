import 'server-only';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { isDefined } from 'twenty-shared/utils';

import { type CommunityStats } from './get-community-stats';
import { readFiniteNumber } from './read-finite-number';

// Reuses the worker's existing OpenNext R2 cache bucket; the key lives outside
// its incremental-cache/ prefix so the two never collide.
const STORE_KEY = 'community-stats/latest.json';

type CommunityStatsBucket = {
  get: (key: string) => Promise<{ text: () => Promise<string> } | null>;
  put: (key: string, value: string) => Promise<unknown>;
};

const isCommunityStatsBucket = (
  value: unknown,
): value is CommunityStatsBucket =>
  isDefined(value) &&
  typeof (value as CommunityStatsBucket).get === 'function' &&
  typeof (value as CommunityStatsBucket).put === 'function';

const getBucket = async (): Promise<CommunityStatsBucket | null> => {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const binding = (env as { NEXT_INC_CACHE_R2_BUCKET?: unknown })
      .NEXT_INC_CACHE_R2_BUCKET;
    return isCommunityStatsBucket(binding) ? binding : null;
  } catch {
    return null;
  }
};

export const communityStatsStore = {
  read: async (): Promise<CommunityStats | null> => {
    const bucket = await getBucket();
    if (!isDefined(bucket)) return null;

    try {
      const storedObject = await bucket.get(STORE_KEY);
      if (!isDefined(storedObject)) return null;

      const parsed = JSON.parse(await storedObject.text()) as {
        githubStars?: unknown;
        discordMembers?: unknown;
      };
      return {
        githubStars: readFiniteNumber(parsed.githubStars),
        discordMembers: readFiniteNumber(parsed.discordMembers),
      };
    } catch {
      return null;
    }
  },

  write: async (stats: CommunityStats): Promise<void> => {
    const bucket = await getBucket();
    if (!isDefined(bucket)) return;

    const entry = { ...stats, fetchedAt: Date.now() };
    try {
      await bucket.put(STORE_KEY, JSON.stringify(entry));
    } catch {
      // Best-effort persistence: a write failure must not break the render.
    }
  },
};
