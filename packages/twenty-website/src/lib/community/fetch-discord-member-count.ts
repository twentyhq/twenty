import { unstable_cache } from 'next/cache';

export const fetchDiscordMemberCount = unstable_cache(
  async (): Promise<number | null> => {
    try {
      const response = await fetch(
        'https://discord.com/api/v10/invites/cx5n4Jzs57?with_counts=true',
      );

      if (!response.ok) return null;

      const data = (await response.json()) as {
        profile?: { member_count?: number };
      };
      return data.profile?.member_count ?? null;
    } catch {
      return null;
    }
  },
  ['community-stats:discord-members'],
  { revalidate: 3600, tags: ['community-stats'] },
);
