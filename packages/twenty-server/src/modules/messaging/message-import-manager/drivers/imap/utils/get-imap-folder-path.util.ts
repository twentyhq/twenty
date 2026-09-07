import { isNonEmptyString } from '@sniptt/guards';
import { type ImapFlow } from 'imapflow';

import { normalizeImapUnicode } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/normalize-imap-unicode.util';

export const getImapFolderPath = (
  externalId: string | null | undefined,
  client?: Pick<ImapFlow, 'enabled'>,
): string | null => {
  if (!isNonEmptyString(externalId)) {
    return null;
  }

  const lastColonIndex = externalId.lastIndexOf(':');

  if (lastColonIndex === -1) {
    return normalizeImapUnicode(externalId, client);
  }

  const suffix = externalId.slice(lastColonIndex + 1);

  if (!/^\d+$/.test(suffix)) {
    return normalizeImapUnicode(externalId, client);
  }

  return normalizeImapUnicode(externalId.slice(0, lastColonIndex), client);
};
