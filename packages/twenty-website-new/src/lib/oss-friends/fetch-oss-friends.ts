import type { OssFriend } from '@/lib/oss-friends/types';

const OSS_FRIENDS_URL = 'https://formbricks.com/api/oss-friends';

function isOssFriendRow(value: unknown): value is OssFriend {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.name === 'string' &&
    typeof row.description === 'string' &&
    typeof row.href === 'string'
  );
}

export async function fetchOssFriends(): Promise<{
  friends: OssFriend[];
  loadFailed: boolean;
}> {
  try {
    const response = await fetch(OSS_FRIENDS_URL, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { friends: [], loadFailed: true };
    }

    const json = (await response.json()) as { data?: unknown };
    const rawList = json.data;

    if (!Array.isArray(rawList)) {
      return { friends: [], loadFailed: true };
    }

    const friends = rawList.filter(isOssFriendRow);
    return { friends, loadFailed: false };
  } catch {
    return { friends: [], loadFailed: true };
  }
}
