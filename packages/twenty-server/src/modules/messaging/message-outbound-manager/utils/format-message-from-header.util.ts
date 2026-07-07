import { isDefined } from 'twenty-shared/utils';

import { mimeEncode } from 'src/modules/messaging/message-import-manager/utils/mime-encode.util';

export const formatMessageFromHeader = ({
  fromEmail,
  fromName,
}: {
  fromEmail: string;
  fromName?: string | null;
}) => {
  return isDefined(fromName) && fromName.trim().length > 0
    ? `${mimeEncode(fromName.trim())} <${fromEmail}>`
    : fromEmail;
};
