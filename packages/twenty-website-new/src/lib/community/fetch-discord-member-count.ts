import axios from 'axios';
import { unstable_cache } from 'next/cache';

/**
 * Fetches Discord server member count via the public invite endpoint.
 *
 * Wrapped in `unstable_cache` with a 1-hour revalidation window — same
 * reasoning as the GitHub fetcher: the count is slow-moving and the
 * invite endpoint is unauthenticated, so caching keeps us comfortably
 * under any reasonable per-IP budget.
 *
 * Failure (network, rate limit, malformed response) silently resolves to
 * `null` so the caller can render a fallback without throwing.
 */
export const fetchDiscordMemberCount = unstable_cache(
  async (): Promise<number | null> => {
    try {
      const response = await axios.get(
        'https://discord.com/api/v10/invites/cx5n4Jzs57',
        {
          params: { with_counts: true },
        },
      );

      return response.data.profile.member_count;
    } catch {
      return null;
    }
  },
  ['community-stats:discord-members'],
  { revalidate: 3600, tags: ['community-stats'] },
);
