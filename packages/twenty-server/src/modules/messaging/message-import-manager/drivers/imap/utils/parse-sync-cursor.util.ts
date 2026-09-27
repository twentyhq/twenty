import { isDefined } from 'twenty-shared/utils';

// Track known UIDs and message count to detect expunged messages (Issue #26099)
export type ImapSyncCursor = {
  highestUid: number;
  uidValidity: number;
  modSeq?: string;
  knownUids?: number[];
  messageCount?: number;
};

export const parseSyncCursor = (
  cursor: string | null,
): ImapSyncCursor | null => {
  if (!isDefined(cursor)) {
    return null;
  }

  try {
    return JSON.parse(cursor) as ImapSyncCursor;
  } catch {
    return null;
  }
};
