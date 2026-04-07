import { cache } from 'react';

import { fetchDiscordMemberCount } from '@/lib/community/fetch-discord-member-count';
import { fetchGithubStarCount } from '@/lib/community/fetch-github-star-count';
import { formatCompactCount } from '@/lib/community/format-compact-count';

export type CommunityStats = {
  discord: string;
  github: string;
};

export const fetchCommunityStats = cache(async (): Promise<CommunityStats> => {
  const [githubStars, discordMembers] = await Promise.all([
    fetchGithubStarCount(),
    fetchDiscordMemberCount(),
  ]);

  let discord = '';
  let github = '';

  if (githubStars != null) {
    github = formatCompactCount(githubStars);
  }

  if (discordMembers != null) {
    discord = formatCompactCount(discordMembers);
  }

  return { discord, github };
});
