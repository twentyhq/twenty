import { isDefined } from 'twenty-shared/utils';

export const computeMessageImportProgress = ({
  importedMessagesCount,
  totalMessagesToImportCount,
}: {
  importedMessagesCount: number | undefined;
  totalMessagesToImportCount: number | undefined;
}): number | null => {
  if (
    !isDefined(totalMessagesToImportCount) ||
    totalMessagesToImportCount === 0
  ) {
    return null;
  }

  const cappedImportedMessagesCount = Math.min(
    importedMessagesCount ?? 0,
    totalMessagesToImportCount,
  );

  return Math.floor(
    (cappedImportedMessagesCount / totalMessagesToImportCount) * 100,
  );
};
