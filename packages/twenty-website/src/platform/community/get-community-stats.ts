import 'server-only';

import { isDefined } from 'twenty-shared/utils';

import { communityStatsStore } from './community-stats-store';
import { readFiniteNumber } from './read-finite-number';

export type CommunityStats = {
  discordMembers: number | null;
  githubStars: number | null;
};

const REVALIDATE_SECONDS = 900;

const GITHUB_REPO_URL = 'https://api.github.com/repos/twentyhq/twenty';
const DISCORD_INVITE_URL =
  'https://discord.com/api/v9/invites/cx5n4Jzs57?with_counts=true';

async function fetchGithubStars(): Promise<number | null> {
  const token = process.env.GITHUB_STATS_TOKEN;
  try {
    const response = await fetch(GITHUB_REPO_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'twenty-website',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { stargazers_count?: unknown };
    return readFiniteNumber(body.stargazers_count);
  } catch {
    return null;
  }
}

async function fetchDiscordMembers(): Promise<number | null> {
  try {
    const response = await fetch(DISCORD_INVITE_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as {
      approximate_member_count?: unknown;
    };
    return readFiniteNumber(body.approximate_member_count);
  } catch {
    return null;
  }
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const [githubStars, discordMembers] = await Promise.all([
    fetchGithubStars(),
    fetchDiscordMembers(),
  ]);

  const hasMissingLiveValue =
    !isDefined(githubStars) || !isDefined(discordMembers);
  const cached = hasMissingLiveValue ? await communityStatsStore.read() : null;

  const resolved: CommunityStats = {
    githubStars: githubStars ?? cached?.githubStars ?? null,
    discordMembers: discordMembers ?? cached?.discordMembers ?? null,
  };

  if (isDefined(githubStars) || isDefined(discordMembers)) {
    await communityStatsStore.write(resolved);
  }

  return resolved;
}
