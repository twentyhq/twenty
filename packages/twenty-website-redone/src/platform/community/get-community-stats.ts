export type CommunityStats = {
  discordMembers: number;
  githubStars: number;
};

// Live numbers when reachable, recent-real fallbacks when not — so the menu
// never renders empty chips and never blocks on a third party.
const FALLBACK_STATS: CommunityStats = {
  discordMembers: 6600,
  githubStars: 49600,
};

const REVALIDATE_SECONDS = 3600;

const fetchJson = async (url: string): Promise<unknown> => {
  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) throw new Error(`${url} -> ${response.status}`);
  return response.json();
};

const readNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export async function getCommunityStats(): Promise<CommunityStats> {
  const [github, discord] = await Promise.allSettled([
    fetchJson('https://api.github.com/repos/twentyhq/twenty'),
    fetchJson('https://discord.com/api/v9/invites/cx5n4Jzs57?with_counts=true'),
  ]);

  const githubStars =
    github.status === 'fulfilled'
      ? readNumber(
          (github.value as { stargazers_count?: unknown }).stargazers_count,
        )
      : null;
  const discordMembers =
    discord.status === 'fulfilled'
      ? readNumber(
          (discord.value as { approximate_member_count?: unknown })
            .approximate_member_count,
        )
      : null;

  return {
    discordMembers: discordMembers ?? FALLBACK_STATS.discordMembers,
    githubStars: githubStars ?? FALLBACK_STATS.githubStars,
  };
}
