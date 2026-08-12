import { isNonEmptyString } from '@sniptt/guards';

export const canonicalizeFolderExternalId = (
  externalId: string | null | undefined,
): string | null =>
  isNonEmptyString(externalId) ? externalId.normalize('NFC') : null;
