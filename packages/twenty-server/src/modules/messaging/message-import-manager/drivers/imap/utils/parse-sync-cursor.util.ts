export type ImapSyncCursor = {
  highestUid: number;
  uidValidity: number;
  modSeq?: string;
};

export const parseSyncCursor = (cursor?: string): ImapSyncCursor | null => {
  if (!cursor) {
    return null;
  }

  try {
    return JSON.parse(cursor) as ImapSyncCursor;
  } catch {
    return null;
  }
};
