import { isNonEmptyString } from '@sniptt/guards';

import { mimeEncode } from 'src/modules/messaging/message-import-manager/utils/mime-encode.util';

export const formatMessageFromHeader = ({
  fromEmail,
  fromName,
}: {
  fromEmail: string;
  fromName?: string | null;
}) => {
  return isNonEmptyString(fromName)
    ? `${mimeEncode(fromName)} <${fromEmail}>`
    : fromEmail;
};
