import { isNonEmptyString } from '@sniptt/guards';
import { type ImapFlow } from 'imapflow';

export const normalizeImapMailboxPath = (
  path: string,
  client?: Pick<ImapFlow, 'enabled'>,
): string =>
  client?.enabled.has('UTF8=ACCEPT') ? path.normalize('NFC') : path;

export const getImapFolderPath = (
  externalId: string | null | undefined,
  client?: Pick<ImapFlow, 'enabled'>,
): string | null => {
  if (!isNonEmptyString(externalId)) {
    return null;
  }

  const lastColonIndex = externalId.lastIndexOf(':');

  const path =
    lastColonIndex === -1
      ? externalId
      : /^\d+$/.test(externalId.slice(lastColonIndex + 1))
        ? externalId.slice(0, lastColonIndex)
        : externalId;

  return normalizeImapMailboxPath(path, client);
};
