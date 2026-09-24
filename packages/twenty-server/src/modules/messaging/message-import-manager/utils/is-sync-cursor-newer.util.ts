const isNumericCursor = (cursor: string): boolean => /^\d+$/.test(cursor);

export const isSyncCursorNewer = (
  nextSyncCursor: string,
  currentSyncCursor: string | null | undefined,
): boolean => {
  if (!currentSyncCursor) {
    return true;
  }
  if (isNumericCursor(nextSyncCursor) && isNumericCursor(currentSyncCursor)) {
    return BigInt(nextSyncCursor) > BigInt(currentSyncCursor);
  }

  return nextSyncCursor > currentSyncCursor;
};
