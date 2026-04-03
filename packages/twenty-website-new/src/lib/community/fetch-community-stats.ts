import { COMMUNITY } from '@/constants/community';
import { formatCompactCount } from '@/lib/community/format-compact-count';
import { cache } from 'react';

export type CommunityStats = {
  discordMembers: number | null;
  githubStars: number | null;
};

async function fetchGithubStargazersCount(): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${COMMUNITY.GITHUB_REPO_FULL_NAME}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === 'number'
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}

async function fetchDiscordApproximateMemberCount(): Promise<number | null> {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/invites/${COMMUNITY.DISCORD_INVITE_CODE}?with_counts=true`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      approximate_member_count?: unknown;
    };
    return typeof data.approximate_member_count === 'number'
      ? data.approximate_member_count
      : null;
  } catch {
    return null;
  }
}

async function loadCommunityStats(): Promise<CommunityStats> {
  const [githubStars, discordMembers] = await Promise.all([
    fetchGithubStargazersCount(),
    fetchDiscordApproximateMemberCount(),
  ]);

  return { discordMembers, githubStars };
}

export const getCommunityStats = cache(loadCommunityStats);

export function labelsFromCommunityStats(stats: CommunityStats): {
  discord: string;
  github: string;
} {
  return {
    discord:
      stats.discordMembers != null
        ? formatCompactCount(stats.discordMembers)
        : COMMUNITY.FALLBACK_DISCORD_LABEL,
    github:
      stats.githubStars != null
        ? formatCompactCount(stats.githubStars)
        : COMMUNITY.FALLBACK_GITHUB_LABEL,
  };
}
