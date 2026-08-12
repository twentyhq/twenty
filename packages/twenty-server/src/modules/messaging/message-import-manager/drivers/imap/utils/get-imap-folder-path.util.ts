import { isNonEmptyString } from '@sniptt/guards';
import { type ImapFlow } from 'imapflow';

import { normalizeImapFolderPath } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/normalize-imap-folder-path.util';

export const getImapFolderPath = (
  client: Pick<ImapFlow, 'enabled'>,
  externalId: string | null | undefined,
): string | null => {
  if (!isNonEmptyString(externalId)) {
    return null;
  }

  const lastColonIndex = externalId.lastIndexOf(':');
  const trailingSegment = externalId.slice(lastColonIndex + 1);
  const folderPath =
    lastColonIndex !== -1 && /^\d+$/.test(trailingSegment)
      ? externalId.slice(0, lastColonIndex)
      : externalId;

  return normalizeImapFolderPath(client, folderPath);
};
