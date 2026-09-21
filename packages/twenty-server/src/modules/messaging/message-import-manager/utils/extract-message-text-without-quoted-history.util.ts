import { type MessageBody } from 'src/modules/messaging/message-import-manager/types/message-body.type';
import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';
import { readBodyAsText } from 'src/modules/messaging/message-import-manager/utils/read-body-as-text.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';
import { stripQuotedHistory } from 'src/modules/messaging/message-import-manager/utils/strip-quoted-history.util';

export const extractMessageTextWithoutQuotedHistory = (
  body: MessageBody,
): string => {
  const bodyAsText = readBodyAsText(body);
  const withoutQuotedHistory = stripQuotedHistory(bodyAsText);
  const withoutNullCharacters = sanitizeString(withoutQuotedHistory);

  return normalizeMessageText(withoutNullCharacters);
};
