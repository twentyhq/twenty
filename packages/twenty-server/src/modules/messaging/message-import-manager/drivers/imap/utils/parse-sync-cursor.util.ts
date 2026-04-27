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
    const parsed = JSON.parse(cursor);
    return {
      highestUid: String(parsed.highestUid),
      uidValidity: String(parsed.uidValidity),
      modSeq: isDefined(parsed.modSeq) ? String(parsed.modSeq) : undefined,
      firstSyncedUid: isDefined(parsed.firstSyncedUid)
        ? String(parsed.firstSyncedUid)
        : undefined,
    };
  } catch {
    return null;
  }
};
