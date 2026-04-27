import { isDefined } from 'twenty-shared/utils';

export type ImapSyncCursor = {
  highestUid: string;
  uidValidity: string;
  modSeq?: string;
  firstSyncedUid?: string;
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
