import axios from 'axios';
import { unstable_cache } from 'next/cache';

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
