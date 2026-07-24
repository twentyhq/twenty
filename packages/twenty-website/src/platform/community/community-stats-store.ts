import 'server-only';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { isDefined } from 'twenty-shared/utils';

import { type CommunityStats } from './get-community-stats';
import { readFiniteNumber } from './read-finite-number';

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

const readStoredStats = async (
  bucket: CommunityStatsBucket,
): Promise<CommunityStats | null> => {
  const storedObject = await bucket.get(STORE_KEY);
  if (!isDefined(storedObject)) return null;

  const raw = await storedObject.text();
  try {
    const parsed = JSON.parse(raw) as {
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
};

export const communityStatsStore = {
  read: async (): Promise<CommunityStats | null> => {
    const bucket = await getBucket();
    if (!isDefined(bucket)) return null;

    try {
      return await readStoredStats(bucket);
    } catch {
      return null;
    }
  },

  write: async (stats: CommunityStats): Promise<void> => {
    const bucket = await getBucket();
    if (!isDefined(bucket)) return;

    try {
      const stored = await readStoredStats(bucket);
      const entry: CommunityStats = {
        githubStars: stats.githubStars ?? stored?.githubStars ?? null,
        discordMembers: stats.discordMembers ?? stored?.discordMembers ?? null,
      };
      await bucket.put(STORE_KEY, JSON.stringify(entry));
    } catch {
      return;
    }
  },
};
