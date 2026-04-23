import axios from 'axios';
import { unstable_cache } from 'next/cache';

/**
 * Fetches GitHub star count for `twentyhq/twenty`.
 *
 * Wrapped in `unstable_cache` with a 1-hour revalidation window because:
 *
 * - Unauthenticated GitHub API requests are rate-limited to 60/hour per IP.
 *   On a serverless deploy that shares an outbound IP with neighbours, the
 *   site can blow through the budget in minutes if every render fetches.
 * - Star counts move slowly enough that one-hour staleness is invisible to
 *   visitors but caps cost at ~24 GitHub calls/day per region.
 *
 * If `GITHUB_TOKEN` is set we send it as a Bearer token, lifting the limit
 * to 5000/hour. Failure (network, rate limit, server error) silently
 * resolves to `null` so the caller can render a fallback without throwing.
 */
export const fetchGithubStarCount = unstable_cache(
  async (): Promise<number | null> => {
    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      };

      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      const response = await axios.get(
        'https://api.github.com/repos/twentyhq/twenty',
        { headers },
      );

      return response.data.stargazers_count;
    } catch {
      return null;
    }
  },
  ['community-stats:github-stars'],
  { revalidate: 3600, tags: ['community-stats'] },
);
