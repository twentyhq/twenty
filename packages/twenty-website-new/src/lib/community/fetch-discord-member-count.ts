import axios from 'axios';

export async function fetchDiscordMemberCount(): Promise<number | null> {
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
}
