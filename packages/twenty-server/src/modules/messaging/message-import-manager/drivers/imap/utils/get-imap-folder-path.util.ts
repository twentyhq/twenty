import { isNonEmptyString } from '@sniptt/guards';

export const getImapFolderPath = (
  externalId: string | null | undefined,
): string | null => {
  if (!isNonEmptyString(externalId)) {
    return null;
  }

  const lastColonIndex = externalId.lastIndexOf(':');
  const trailingSegment = externalId.slice(lastColonIndex + 1);

  return lastColonIndex !== -1 && /^\d+$/.test(trailingSegment)
    ? externalId.slice(0, lastColonIndex)
    : externalId;
};
